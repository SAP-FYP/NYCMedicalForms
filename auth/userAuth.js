const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.SECRETKEY;

const bcrypt = require('bcrypt');
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
                console.log('Error: ' + error.message);
                return next(error);
            }
            next();
        })
        .catch((error) => {
            console.log(error)
            return res.status(error.status || 500).json({ error: error.message });
        })
}

module.exports.checkPassword = function checkPassword(req, res, next) {
    const credentials = {
        email: req.decodedToken.email,
        password: req.body.password.currentPassword,
    };

    if (!credentials.email || !credentials.password) {
        const error = new Error("Empty email or password");
        error.status = 400;
        throw error;
    }

    return userModel
        .loginUser(credentials.email)
        .then((result) => {

            // CHECK HASH
            if (!bcrypt.compareSync(credentials.password, result.password)) {
                const error = new Error("Invalid email or password");
                error.status = 401;
                console.log('Error: ' + error.message);
                throw error;
            }

            if (result.isDisabled) {
                const error = new Error("Account is disabled. Please dontact admin for more information");
                error.status = 403;
                console.log('Error: ' + error.message);
                next(error);
            }

            next();
        })
        .catch((error) => {
            console.log(error)
            return res.status(error.status || 500).json({ error: error.message });
        });
}