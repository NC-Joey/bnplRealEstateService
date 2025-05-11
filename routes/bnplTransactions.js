const { validate } = require('../models/bnplTransaction');
const { initiateBnplTransaction, processMonthlyPayment } = require('../services/bnplService')
const auth = require('../middlewares/auth');
const private = require('../middlewares/private');
const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const transaction = await initiateBnplTransaction(req.body.userId, req.body.propertyId)
    
    res.send(transaction)

})

router.post('/:id', [auth, private], async (req, res) => {
    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const result = await processMonthlyPayment(req.params.id)

    res.send(result)
} )


module.exports = router;