const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.SECRETKEY;

const userModel = require('../model/user')
const momentHelper = require('../helper/epochConverter')

module.exports.verifyToken = function verifyToken(req, res, next) {
    const token = req.cookies.jwt;

    if (!token) {
        const error = new Error("No token found! Reason(Empty token)");
        console.log('Error: ' + error.message);

        res.clearCookie('jwt');
        return res.status(401).json({ error: error.message });

    } else {
        tokenConfig = { algorithm: ['HS256'] }

        jwt.verify(token, JWT_SECRET, tokenConfig, function (err, decodedPayload) {
            if (err) {
                const error = new Error("Not authorized! Reason(Invalid token)");
                console.log('Error: ' + error.message);

                res.clearCookie('jwt');
                return res.status(401).json({ error: error.message });

            } else {
                req.decodedToken = decodedPayload;
                next();
            }
        });
    }
}

module.exports.checkIat = function checkIat(req, res, next) {
    const issued_iat = req.decodedToken.iat;
    const email = req.decodedToken.email;

    return userModel
        .getUser(email)
        .then((result) => {
            const invalidation_iat = momentHelper.localeToIat(result.invalidationDate);

            if (invalidation_iat && invalidation_iat >= issued_iat) {
                res.clearCookie('jwt');
                const error = new Error("Token expired/invalidated! Reason(Invalidated token)");
                error.status = 401;
                throw error;
            }
            next();
        })
        .catch((error) => {
            console.log(error)
            return res.status(error.status || 500).json({ error: error.message });
        })
}