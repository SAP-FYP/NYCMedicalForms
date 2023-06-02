const express = require("express");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const moment = require('moment');

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
 * User: General
 */

// Login
app.post('/login', (req, res, next) => {
    const credentials = {
        email: req.body.email,
        password: req.body.password,
    };

    if (!credentials.email || !credentials.password) {
        const error = new Error("Empty email or password");
        error.status = 400;
        throw error;
    }

    return userModel
        .loginUser(credentials)
        .then((result) => {
            console.log(result);

            // CHECK HASH
            if (!bcrypt.compareSync(credentials.password, result.password)) {
                const error = new Error("Invalid email or password");
                error.status = 401;
                throw error;
            }

            // SET JWT
            let payload = {
                'email': result.email,
                'permissionGroup': result.groupID
            }

            let tokenConfig = {
                expiresIn: 28800,
                algorithm: "HS256"
            };

            // SIGN JWT
            jwt.sign(payload, JWT_SECRET, tokenConfig, (error, token) => {

                if (error) {
                    console.log(error)

                    const error = new Error("Failed to sign JWT");
                    error.status = 500;
                    throw error;
                };

                res.cookie('jwt', token, {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'strict'
                });

                delete result.password;
                return res.json({ user: result });
            })
        })
        .catch((error) => {
            console.log(error)
            return res.status(error.status || 500).json({ error: error.message });
        });
});

app.get('/jwt', (req, res, next) => {
    const jwt = req.cookies.jwt;
    return res.send(jwt);
})

/**
 * User: Super Admin
 */

// Create Account
app.post('obs-admin/newuser', (req, res, next) => {

});

// Update User Permission Group
app.put('/obs-admin/update-user-group', (req, res, next) => {
    const { email, groupId } = req.body;
    // TODO: Error handling and validation
    return userModel.updateUserPermission(email, groupId)
        .then((result) => {
            return res.json(result);
        })
        .catch((error) => {
            return res.status(error.status || 500).json({ error: error.message });
        })
});

// Disable Account
app.put('/obs-admin/update-account-status', (req, res, next) => {
    const { email, status } = req.body;
    // TODO: Error handling and validation
    return userModel.updateAccountStatus(email, status)
        .then((result) => {
            return res.json(result);
        })
        .catch((error) => {
            return res.status(error.status || 500).json({ error: error.message });
        })
});


// Delete Account
app.put('/obs-admin/delete-user', (req, res, next) => {
    const { email } = req.body;
    // TODO: Error handling and validation
    return userModel.deleteUser(email)
        .then((result) => {
            return res.json(result);
        })
        .catch((error) => {
            return res.status(error.status || 500).json({ error: error.message });
        })
});

module.exports = app;