const mongoose = require('mongoose');
const Joi = require('joi');

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 5,
        maxLength: 255,
        required: true
    },

    propertyCount: {
        type: Number,
        default: 0
    }
})

const Company = mongoose.model('Company', companySchema);

function validateCompany(company) {
    const schema = {
        name: Joi.string().min(5).max(255).required()
    }

    return Joi.validate(company, schema);
}

exports.Company = Company;
exports.validate = validateCompany;