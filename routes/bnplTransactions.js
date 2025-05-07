const { validate } = require('../models/bnplTransaction');
const { initiateBnplTransaction } = require('../services/bnplService')
const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const transaction = await initiateBnplTransaction(req.body.userId, req.body.propertyId)
    
    res.send(transaction)

})

router.post('/:id/scedule')


module.exports = router;