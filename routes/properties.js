const { Property, validate} = require('../models/property');
const { Company } = require('../models/company');
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const express = require('express');
const router = express.Router();

router.get('/', [auth, admin], async (req, res) => {
    const properties = await Property.find().sort('name');
    
    res.send(properties);
})

router.post('/', [auth, admin], async (req, res) => {
    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const company = await Company.findById(req.body.companyId)
    if (!company) return res.status(400).send("Invalid request...")

    let property = new Property({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        state: req.body.state,
        lga: req.body.lga,
        company: {
            _id: company.id,
            name: company.name
        } 
    });

    property = await property.save();

    company.propertyCount++;
    company.save();

    res.send(property)
});

router.put('/', [auth, admin], async (req, res) => {
    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message)

    const property = await Property.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        price: req.body.price,
        location: req.body.location,
        isLocked: req.body.isLocked
    })

    if (!property) return res.status(400).send("Property does not exist");

    res.send(property)
})


module.exports = router;