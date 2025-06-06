const moment = require('moment');
const { User } = require('../models/user');
const { Property } = require('../models/property');
const { BnplTransaction } = require('../models/bnplTransaction');

// Generate a payment schedule for BNPL
exports.generatePaymentSchedule = (propertyPrice) => {
    const upfrontPayment = propertyPrice * 0.1;
    const balanceLeft = propertyPrice * 0.9;
    const interestAmount = balanceLeft * 0.05;
    const totalPriceWithInterest = propertyPrice + interestAmount;
    const totalRemainingWithInterest = balanceLeft + interestAmount;
    const monthlyInstallment = totalRemainingWithInterest / 12;

    const paymentSchedule = [];

    let currentDate = moment();

    for (let i = 1; i <= 12; i++) {
        currentDate = currentDate.add(1, 'months');

        paymentSchedule.push({
            installmentNumber: i,
            amount: monthlyInstallment,
            dueDate: currentDate.toDate(),
            status: 'pending'
        });
    }

    return {
        upfrontPayment, totalRemainingWithInterest, totalPriceWithInterest, monthlyInstallment, paymentSchedule
    };

}

//Validate if user can afford upfront payment
exports.validateUserFunds = async (userId, upfrontAmount) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    if (user.wallet < upfrontAmount) {
        throw new Error('Insufficient funds for initial deposit');
    }

    return true;
};

// Initialize a BNPL transaction
exports.initiateBnplTransaction = async (userId, propertyId) => {
    const property = await Property.findById(propertyId);
    
    if (!property) { 
        throw new Error('Property not found');
    }

    if (property.status != 'available') {
        throw new Error("Property is not available for purchase")
    }

    //Generate payment schedule
    const {
        upfrontPayment,
        totalRemainingWithInterest, paymentSchedule,
        totalPriceWithInterest
    } = this.generatePaymentSchedule(property.price);

    //Validate user has enough funds
    await this.validateUserFunds(userId, upfrontPayment);

    //Create BNPL transaction
    const bnplTransaction = new BnplTransaction({
        user: userId,
        property: propertyId,
        totalAmount: totalPriceWithInterest,
        upfrontPayment,
        balanceLeft: totalRemainingWithInterest,
        paymentSchedule,
        totalPaid: upfrontPayment,
        percentagePaid: (upfrontPayment / property.price) * 100
    })

    // Update user wallet
    const user = await User.findById(userId);
    user.wallet -= upfrontPayment;
    await user.save();

    // Update property status
    property.status = 'bnpl';
    property.currentOwner = userId;
    await property.save();

    // Save transaction
    await bnplTransaction.save();
    
    return bnplTransaction;

}


//Process monthly payments
exports.processMonthlyPayment = async (transactionId) => {
    const transaction = await BnplTransaction.findById(transactionId);

    if (!transaction) {
        throw new Error('Transaction not found');
    }

    if (transaction.status !== 'active') {
        throw new Error('This transaction is no longer active');
    }

    const installmentNumber = transaction.installmentsPaid + transaction.missedPayments + 1;

    //Find the insatllment
    const installment = transaction.paymentSchedule.find(p =>p.status === 'pending');

    if (!installment) {
        throw new Error('Invalid installment or already paid');
    }

    // Check if user has enough funds
    const user = await User.findById(transaction.user);
    
    if (user.wallet < installment.amount) {
        throw new Error('Insufficient funds for this payment');
    }

    // Process payment
    user.wallet -= installment.amount;
    await user.save();

    // Update installment status
    installment.status = 'paid';
    installment.paidDate = Date.now();

    transaction.installmentsPaid += 1

    // Reset consecutive missed payments if any
    transaction.missedPayments = 0;

    // Update total paid amount
    transaction.totalPaid += installment.amount;

    //update balance left
    transaction.balanceLeft -= installment.amount; 

    // Calculate percentage paid
    const property = await Property.findById(transaction.property);
    transaction.percentagePaid = (transaction.totalPaid / property.price) * 100;

    // Unlock property if 50% paid
    if (transaction.percentagePaid >= 50 && transaction.isLocked) {
        transaction.isLocked = false;
    }

    // Check if all payments are complete
    // const allPaid = transaction.paymentSchedule[transaction.paymentSchedule.length - 1].status == "paid"

    if (transaction.totalAmount == transaction.totalPaid) {
        transaction.status = 'completed';
        transaction.completionDate = Date.now();
        property.status = 'sold';
        await property.save();
    }

    await transaction.save();

    return transaction;

}


//Handle missed payments
exports.checkMissedPayments = async() => {
    let today = new Date();
    const activeTransactions = await BnplTransaction.find({status: 'active'})

    for (const transaction of activeTransactions) {
        //Check for missed payments (payments that are still pending and due date is in the past)
        const missedPayments = transaction.paymentSchedule.filter(p => p.status === 'pending' && p.dueDate < today);

        if (missedPayments.length > 0) {
            //Mark them as missed
            missedPayments.forEach(payment => {
                payment.status = 'missed'
                let lastInstallmentDate = transaction.paymentSchedule[transaction.paymentSchedule.length - 1].dueDate;
                lastInstallmentDate = moment(lastInstallmentDate);
                const newInstallmentNumber = transaction.paymentSchedule.length + 1;
                // const extraMonth = newInstallmentNumber - payment.installmentNumber
                let newDueDate = lastInstallmentDate.add(1, "months") //add another month from the last installment month

                //add an extra installment to the schedule
                transaction.paymentSchedule.push({
                    installmentNumber: newInstallmentNumber,
                    amount: payment.amount,
                    dueDate: newDueDate.toDate(),
                    status: 'pending'
                })

                //missed payment penalty
                let penalty = 0.1 * payment.amount;
                transaction.totalPaid -= penalty //prevent penalty fees from counting toward the total amount paid
                transaction.balanceLeft += penalty //add penalty to the balnaceLeft
                let nextInstallmentIndex = payment.installmentNumber;
                transaction.paymentSchedule[nextInstallmentIndex].amount += penalty //10% penalty on the next installment 
                //TODO send user notification of the penalty
                console.log("A 10% penalty fee will be charged to your next installment")

            
            })

            //Count consecutive missed payments
            const sortedPayments = [...transaction.paymentSchedule].sort((a,b) => a.installmentNumber - b.installmentNumber);

            let consecutive = 0;
            for (const payment of sortedPayments) {
                if (payment.status === 'missed') {
                    consecutive++;
                } else if (payment.status === 'paid') {
                    consecutive = 0;
                }
            }

            transaction.missedPayments = consecutive;

            if (consecutive === 2) {
                //TODO: Send notification
                console.log("Missed payment warning")
            } else if (consecutive >= 3) {
                //Repossess
                transaction.status = 'repossessed'

                const property = await Property.findById(transaction.property);
                property.status = 'available'
                property.currentOwner = null;
                await property.save()
            }

            await transaction.save()
        }
    }        
}


