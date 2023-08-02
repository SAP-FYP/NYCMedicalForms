const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.SECRETKEY;

// Token contains encrypted, studentNRIC, dateOfBirth

module.exports.verifyToken = function verifyToken(req, res, next) {
    const token = req.cookies.parentJWT;
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
                res.clearCookie('parentJWT');
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

// Validate if the correct user is accessing the resource
module.exports.validateUser = function validateUser(req, res, next) {
    const encrypted = req.params.encrypted || req.body.encrypted;
    if (!encrypted) {
        // NO ENCRYPTED
        const error = new Error("No encrypted found! Reason(Empty encrypted)");
        error.status = 401;
        console.log('Error: ' + error.message);
        return next(error);
    }
    if (encrypted !== req.decodedToken.encrypted) {
        // FAIL CHECK
        const error = new Error("Not authorized! Reason(Invalid encrypted)");
        error.status = 403;
        console.log('Error: ' + error.message);
        return next(error);
    }
    next();
}