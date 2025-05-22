const { Company, validate } = require('../models/company');
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');

router.get('/', [auth, admin], async (req, res) => {
    const companies = await Company.find().sort('name');

    res.send(companies);
})

router.post('/', [auth, admin], async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let company = new Company({
        name: req.body.name,
    })

    company = await company.save();

    res.send(company)
})

router.delete('/:id', [auth, admin], async (req, res) => {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) return res.status(400).send("Invalid request...")

    res.send(`"${company.name}" deleted successfully...`)
})

module.exports = router;