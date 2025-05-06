module.exports = function(req, res, next) {
    if (!req.user.isAdmin) return res.status(401).send("Access Denied, No token provided")

    next()
}