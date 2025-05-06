const moment = require('moment');
const { User } = require('../models/user');
const { Property } = require('../models/property');
const { Transaction } = require('../models/transaction');

// Generate a payment schedule for BNPL
exports.generatePaymentSchedule = (propertyPrice) => {
    const initialDeposit = propertyPrice * 0.1;
    const balanceLeft = propertyPrice * 0.9;
    const interestAmount = balanceLeft * 0.05;
    const totalWithInterest = balanceLeft + interestAmount;
    const monthlyInstallment = totalWithInterest / 12;

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
        initialDeposit, balanceLeft, totalWithInterest, monthlyInstallment, paymentSchedule
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
}



