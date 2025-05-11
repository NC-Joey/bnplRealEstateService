const { BnplTransaction } = require('../models/bnplTransaction')

module.exports = async function(req, res, next) {
    const transaction = await BnplTransaction.findById(req.params.id);
    if(!transaction) return res.status(400).send("Invalid request")

    //Only logged in user can see personal transactions
    if (req.user._id != transaction.user) return res.status(400).send(`Unauthorized Access`)    

    next();



}