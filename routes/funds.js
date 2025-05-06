const { Fund, validate } = require('../models/fund');
const { User } = require('../models/user')
const auth = require('../middlewares/auth');
const express = require('express');
const router = express.Router();

router.post('/', auth, async (req, res) => {
    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await User.findById(req.body.userId)
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

module.exports = router;