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

const transcationSchema = new mongoose.Schema({
    property: {
        type: new mongoose.Schema({
            name: {
                type: String,
                minLength: 5,
                maxLength: 255,
            },
        
            price: {
                type: Number,
                min: 0,
                max: 999999999
            },
        
            state: {
                type: String,
                minLength: 3,
                maxLength: 50
            },

            lga: {
                type: String,
                minLength: 3,
                maxLength: 50
            },
        
            status: {
                type: String,
                enum: ['available', 'sold', 'bnpl'],
                default: 'available'
            }
        }),

        required: true
    },

    user: {
        type: new mongoose.Schema({
            name: {
                type: String,
                minLength: 5,
                maxLength: 50
            },
        
            email: {
                type: String,
                minLength: 5,
                maxLength: 255
            }
        }),

        required: true
    },

    totalAmount: {
        type: Number,
        required: true
    },

    initialDeposit: {
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
        default: active
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

const Transaction = mongoose.model('Transaction', transcationSchema);

function validateTransaction(transaction) {
    const schema = {
        propertyId: Joi.string().required(),
        userId: Joi.string().required()
    }

    return Joi.validate(transaction, schema)
}

exports.Transaction = Transaction;
exports.validate = validateTransaction;
