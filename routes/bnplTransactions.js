const { validate, BnplTransaction } = require('../models/bnplTransaction');
const { initiateBnplTransaction, processMonthlyPayment } = require('../services/bnplService')
const auth = require('../middlewares/auth');
const private = require('../middlewares/private');
const admin = require('../middlewares/admin');
const express = require('express');
const router = express.Router();


//Initiate a new transaction
router.post('/', async (req, res) => {
    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const transaction = await initiateBnplTransaction(req.body.userId, req.body.propertyId)
    
    res.send(transaction)

})

//Pay next installment
router.post('/:id', [auth, private], async (req, res) => {
    const result = await processMonthlyPayment(req.params.id)

    res.send(result)
} )


router.get('/', [auth, admin], async (req, res) => {
    const transactions = await BnplTransaction.find();
    if (!transactions) return res.status(400).send("Invalid request");
})

module.exports = router;