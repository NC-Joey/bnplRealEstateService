const Joi = require('joi');
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    installmentNumber: {
        type: Number,
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    dueDate: {
        type: Date,
        required: true
    },

    status: {
        type: String,
        enum: ['pending', 'paid', 'missed'],
        required: true
    },
    
    paidDate: {
        type: Date
    }
})

const bnplTranscationSchema = new mongoose.Schema({
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    totalAmount: {
        type: Number,
        required: true
    },

    upfrontPayment: {
        type: Number,
        required: true
    },

    balanceLeft: {
        type: Number,
        required: true
    },

    interestRate: {
        type: Number,
        default: 5
    },

    paymentSchedule: [paymentSchema],
    
    missedPayments: {
        type: Number,
        default: 0
    },

    totalPaid: {
        type: Number,
        default: 0
    },

    percentagePaid: {
        type: Number,
        default: 0
    },

    isLocked: {
        type: Boolean,
        default: true
    },

    status: {
        type: String,
        enum: ['active', 'completed', 'repossessed', 'resold'],
        default: 'active'
    },

    startDate: {
        type: Date,
        default: Date.now
    },

    completionDate: {
        type: Date,
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});

const BnplTransaction = mongoose.model('Transaction', bnplTranscationSchema);

function validateTransaction(transaction) {
    const schema = {
        propertyId: Joi.string().required(),
        userId: Joi.string().required()
    }

    return Joi.validate(transaction, schema)
}

exports.BnplTransaction = BnplTransaction;
exports.validate = validateTransaction;
