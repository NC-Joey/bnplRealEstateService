const Joi = require('joi');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minLength: 5,
        maxLength: 50
    },

    email: {
        type: String,
        required: true,
        unique: true,
        minLength: 5,
        maxLength: 255
    },

    password: {
        type: String,
        required: true,
        minLength: 8,
        maxLength: 1024
    },

    wallet: {
        type: Number,
        default: 0,

    },

    isAdmin: Boolean
})

userSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({_id: this.id, name: this.name, isAdmin: this.isAdmin}, config.get('jwtPrivateKey'));

    return token;
}

const User = mongoose.model('User', userSchema);

function validateUser(user) {
    const schema = {
        name: Joi.string().required().min(5).max(50),
        email: Joi.string().required().email().min(5).max(255),
        password: Joi.string().required().min(8).max(255)
    }

    return Joi.validate(user, schema)
}

exports.User = User;
exports.validate = validateUser;
