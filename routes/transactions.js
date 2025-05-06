const { Transaction, validate } = require('../models/transaction');
const { Property } = require('../models/property');
const { User } = require('../models/user');
const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const property = await Property.findById(req.body.propertyId);
    if (!property) return res.status(400).send("Invalid Property");

    const user = await User.findById(req.body.userId);
    if (!user) return res.status(400).send("Invalid User");
    console.log("User:", user.name)

    let deposit = property.price/10;
    if(user.wallet < deposit) return res.status(400).send("Insufficient funds...");

    principal = property.price - deposit;
    repayment = 1.05 * principal;
    monthlyPayment = repayment/12;

    let transaction = new Transaction({
        property: {
            _id: property._id,
            name: property.name,
            price: property.price,
            location: property.location
        },

        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            
        },

        initialDeposit: deposit
    })

    transaction = await transaction.save();

    user.wallet = user.wallet - deposit;
    user.save();

    res.send(transaction);
    


})


module.exports = router;