const { User } = require('../models/user');

module.exports = async function(req, res, next) {
    const user = await User.findById(req.params.id);
    if(!user) return res.status(400).send("Invalid request")

    //Only logged in user can see personal transactions
    if (req.user._id != user._id) return res.status(400).send(`Unauthorized Access`)   
    next();
}