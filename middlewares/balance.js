module.exports = function(req, res, next) {
    if (!req.user.wallet) return res.status(401).send("Access Denied, No token provided")

    next()