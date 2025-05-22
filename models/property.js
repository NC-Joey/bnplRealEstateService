const Joi = require('joi');
const { required } = require('joi/lib/types/lazy');
const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        minLength: 5,
        maxLength: 50,
    },

    description: {
        type: String,
        minLength: 0,
        maxLength: 255,
        required: true
    },

    price: {
        type: Number,
        required: true,
        min: 0,
        max: 999999999
    },

    state: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 50
    },

    lga: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 50
    },

    status: {
        type: String,
        enum: ['available', 'sold', 'bnpl'],
        default: 'available'
    },

    company: {
        type: new mongoose.Schema({
            name: {
                type: "String",
                minLength: 5,
                maxLength: 255
            }
        }),

        required: true
    },

    currentOwner: {
        type: String,   
    }

})

const Property = mongoose.model('Property', propertySchema);

function validateProperty(property) {
    const schema = {
        name: Joi.string().required().min(5).max(50),
        description: Joi.string().required().min(0).max(255),
        price: Joi.number().required().min(0).max(999999999),
        state: Joi.string().required().min(3).max(50),
        lga: Joi.string().required().min(3).max(50),
        companyId: Joi.string().min(5).max(255).required()
    }

    return Joi.validate(property, schema);
}

exports.Property = Property;
exports.validate = validateProperty;
