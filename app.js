const express = require("express");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const moment = require('moment');
const elasticEmail = require('elasticemail');
const elasticEmailClient = elasticEmail.createClient({
    apiKey: process.env.elasticAPIKey
});

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
 * User: Medical Examiner
 */

// Login
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

            if (error.status == 401) {
                return res.status(401).json({ error: error.message });
            }

            return res.status(error.status || 500).json({ error: error.message });
        })
});

// Email test
app.post('/send-email', (req, res) => {
    const { email } = req.body;
      // Compose the email parameters
      const emailParams = {
        to: email,
        subject: 'Your Lol',
        from: 'leebarry008@gmail.com',
        body: '<p>Hello, this is the body text of the email!</p>',
      };
  
      // Send the email using Elastic Email SDK
      elasticEmailClient.mailer.send(emailParams, (err, result) => {
        if (err) {
          console.error('Failed to send email:', err);
          res.status(500).send('Failed to send email');
        } else {
          console.log('Email sent successfully:', result);
          res.status(200).send('Email sent successfully');
        }
      });
    });
  

app.get('/jwt', (req, res, next) => {
    const jwt = req.cookies.jwt;
    return res.send(jwt);
})

/**
 * User: Super Admin
 */

// Login
app.post('obs-admin/login', (req, res, next) => {
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

            if (error.status == 401) {
                return res.status(401).json({ error: error.message });
            }

            return res.status(error.status || 500).json({ error: error.message });
        })
});

// Create Account
app.post('obs-admin/newuser', (req, res, next) => {

});


module.exports = app;