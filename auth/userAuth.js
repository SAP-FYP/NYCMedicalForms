const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.SECRETKEY;

const userModel = require('../model/user')
const momentHelper = require('../helper/epochConverter')

module.exports.verifyToken = function verifyToken(req, res, next) {
    const token = req.cookies.jwt;
    if (!token) {

        // NO TOKEN
        const error = new Error("No token found! Reason(Empty token)");
        error.status = 401;
        console.log('Error: ' + error.message);
        return next(error);

    } else {
        // CHECK TOKEN
        jwt.verify(token, JWT_SECRET, { algorithm: ['HS256'] }, function (err, decodedPayload) {
            if (err) {
                // FAIL CHECK
                res.clearCookie('jwt');
                const error = new Error("Not authorized! Reason(Invalid token)");
                error.status = 403;
                console.log('Error: ' + error.message);
                return next(error);

            } else {
                // PASS CHECK
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
            // COMPARE ISSUED JWT TOKEN AND DB INVALIDATION
            if (invalidation_iat && invalidation_iat >= issued_iat) {
                // INVALIDATED
                res.clearCookie('jwt');
                const error = new Error("Token expired/invalidated! Reason(Invalidated token)");
                error.status = 401;
                return next(error);

            }
            next();
        })
        .catch((error) => {
            console.log(error)
            return res.status(error.status || 500).json({ error: error.message });
        })
}