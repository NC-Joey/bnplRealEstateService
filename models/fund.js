const Joi = require('joi');
const { required } = require('joi/lib/types/lazy');
const mongoose = require('mongoose');

const fundSchema = new mongoose.Schema({
    user: {
        type: new mongoose.Schema({
            name: {
                type: String,
                required: true,
                minLength: 5,
                maxLength: 50
            }
        }),

        required: true
        
    },

    amount: {
        type: Number,
        required: true,
        min: 1000000,
        max: 10000000
    },

    date: {
        type: Date,
        required: true,
        default: Date.now
    }
})

const Fund = mongoose.model('Fund', fundSchema);

function validateFund(fund) {
    const schema = {
        userId: Joi.string().required(),
        amount: Joi.number().required().min(1000000).max(10000000)
    }

    return Joi.validate(fund, schema)
}

exports.Fund = Fund;
exports.validate = validateFund;