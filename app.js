const express = require("express");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt = require("jsonwebtoken");

const verifyUser = require('./auth/userAuth')
const userModel = require('./model/user')
const JWT_SECRET = process.env.SECRETKEY;

const app = express();
const port = process.env.PORT || 3000;
const pool = require('./database'); //Import from db.js

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get('/', (req, res) => {
    res.send(`Server running on port ${port}`)

});

//////////////////////////////////////////////////////
// POST GET METHODS
// http://localhost:3000/api/
// Use Postman to test
//////////////////////////////////////////////////////
app.get('/api', async (req, res, next) => {
    console.log(req.query);

    res.json(req.query);
});

app.post('/api', async (req, res, next) => {
    console.log(req.body);

    res.json(req.body);
});

/**
 * Feature: Medical Examiner Login 
 * Method: POST
 */

app.post('/login', (req, res, next) => {
    const credentials = {
        email: req.body.email,
        password: req.body.password,
    };

    if (!credentials.email || !credentials.password) {
        return res.status(400).json({ error: 'Invalid email or password' });
    }

    return userModel
        .loginUser(credentials)
        .then((result) => {
            console.log(result);

            let payload = {
                'email': result.email,
                'permissionGroup': result.groupID
            }

            let tokenConfig = {
                expiresIn: 28800,
                algorithm: "HS256"
            };

            jwt.sign(payload, JWT_SECRET, tokenConfig, (error, token) => {

                if (error) {
                    console.log(error)
                    throw "Failed to sign JWT"
                };

                res.cookie('jwt', token, {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'strict'
                });

                return res.json({ user: result });
            })
        })
        .catch((error) => {
            console.log(error)

            if (error == "Invalid email or password") {
                return res.status(400).json({ error: error.message });
            } else if (error == "JWT Sign Error") {
                return res.status(401).json({ error: error.message });
            }
            return res.status(error.status || 500).json({ error: error.message });
        })
});

app.get('/jwt', (req, res, next) => {
    const jwt = req.cookies.jwt;
    return res.send(jwt);
})

module.exports = app;