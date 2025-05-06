const { User, validate} = require('../models/user');
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const express = require('express');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const router = express.Router();

router.get('/', [auth, admin], async (req, res) => {
    const users = await User.find().sort('name')

    res.send(users)
})

router.get('/:id', [auth, admin], async (req, res) => {
    const users = await User.findById(req.params.id)

    res.send(users)
})

router.post('/', async (req, res) => {
    const {error} = validate(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    let user = await User.findOne({email: req.body.email});
    if (user) return res.status(400).send("Email already registered on this platform")

    user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    })

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt)

    user = await user.save();

    const token = user.generateAuthToken();
    res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email']));
})

router.delete('/:id', [auth, admin], async (req, res) => {
    let user = await User.findByIdAndDelete(req.params.id)

    if (!user) return res.status(400).send("Unable to complete request")

    res.send("User Deleted Successfully")
})

module.exports = router;