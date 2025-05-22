const { Fund, validate } = require('../models/fund');
const { User } = require('../models/user')
const auth = require('../middlewares/auth');
const personal = require('../middlewares/personal');
const admin = require('../middlewares/admin');
const express = require('express');
const router = express.Router();

router.post('/', auth, async (req, res) => {
    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await User.findById(req.user._id)
    if (!user) return res.status(400).send("User not found");

    let funding = new Fund({
        user: {
            _id: user._id,
            name: user.name
        },

        amount: req.body.amount
    })

    funding = await funding.save();

    user.wallet += req.body.amount;
    user.save()
    
    
    res.send(funding);
})

//logged in user funding history
router.get('/:id', [auth, personal], async (req, res) => {
    const fundHistory = await Fund.find({user: req.user._id}).sort({date: -1});
    if (!fundHistory) return res.status(400).send("Invalid request")
    if (fundHistory.length < 1) res.send("No wallet funding history found")

    res.send(fundHistory)
})

//See all users funding history
router.get('/', [auth, admin], async (req, res) => {
    const fundHistory = await Fund.find().sort({date: -1});
    if (!fundHistory) return res.status(400).send("Invalid request")

    res.send(fundHistory)
}) 
module.exports = router;