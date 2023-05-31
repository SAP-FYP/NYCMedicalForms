const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.SECRETKEY;

function verifyToken(req, res, next) {
    // next(); --->  To skip verification during testing. 
    //               Remember to disable when not in use
    // return;

    console.log(req.headers);

    // retreive authorization header's content in Postman
    // "authorization: Bearer <token>"
    var authHeader = req.headers["authorization"];

    // "Bearer <token>"
    console.log(authHeader);

    // process the token
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        let errData = {
            auth: "false",
            message:
                "Not authorized! Reason(No token found / Token has invalid syntax)",
        };

        return res.status(401).type("JSON").end(JSON.stringify(errData));

    }
    else {
        let token = authHeader.replace("Bearer ", "");
        console.log(token);

        // verify token

        let tokenConfig = {
            algorithm: ["HS256"]
        };

        jwt.verify(token, JWT_SECRET, tokenConfig, function (err, decoded) {
            // PS: the variable decoded is the payload

            if (err) {
                let errData = {
                    auth: "false",
                    message: "Not authorized! Reason(Invalid token)",
                };
                return res.status(401).type("JSON").end(JSON.stringify(errData));
            } else {
                // store the payload in the req object

                // Individual Payload
                // req.userid = decoded.id;
                // req.role = decoded.role;

                // Entire Payload
                console.log(decoded);
                req.decodedToken = decoded;

                // pass control to the next MF in the pipeline
                next();
            }
        });
    }
}

//-----------------------------------------
// exports
//-----------------------------------------
module.exports = verifyToken;
