module.exports = function(req, res, next) {
    if (!req.user.isAdmin) return res.status(401).send(`Admin Access Denied`)

    next()
}