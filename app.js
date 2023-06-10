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

// Crypto
const crypto = require('crypto');
const key = Buffer.from(process.env.encryptKey, 'hex');
const iv = Buffer.from(process.env.encryptIV, 'hex');
const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

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
        subject: "Require Parent's Acknowledgement: New Changes in Your Child's Medical Condition",
        from: 'leebarry008@gmail.com',
        body: `<p>Dear Parents,
        We hope this email finds you and your family in good health and high spirits. As part of our ongoing commitment to provide the best care for your children, we would like to inform you about some important updates regarding their medical conditions. <br> <br>
        At our recent healthcare evaluation, we have made significant progress in understanding and managing your child's medical condition. To ensure that our records are up to date, we kindly request your cooperation in acknowledging the new changes in your child's medical condition by clicking on the following link: [Insert URL] <br> <br>
        By clicking on the link, you will confirm that you have received and reviewed the updates related to your child's health. Your acknowledgment will help us ensure that our information is accurate and that we can continue to provide the highest quality of care. <br> <br>
        Rest assured that all the information you provide will remain strictly confidential and will only be used for healthcare purposes. We adhere to the highest standards of privacy and data protection, in compliance with applicable laws and regulations. <br> <br>
        If you have any questions or require further assistance, please do not hesitate to reach out to our dedicated support team at [Insert contact details]. We are here to address any concerns you may have and guide you through the process. <br> <br>
        Thank you for your attention to this matter and for entrusting us with the care of your precious child. Together, we can make a positive impact on their health and future. <br>
        Warm regards, <br>
        National Youth Council in affiliation with Outward Bound Singapore</p>`,
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

/**
 * User: Parents
 */

app.post('/parent/login/', (req, res, next) => {        
    // Get encrypted studentID from body
    const encrypted = req.body.encrypted;
    // Get password from body
    const password = req.body.password;

    // Check if encrypted StudentID is valid
    if (encrypted.length != 32) {
        return res.status(400).json({ error: 'Invalid URL' });
    }

    // Decrypt studentID
    const studentID = decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');

    if (!studentID || !password) {
        return res.status(400).json({ error: 'Invalid URL or password' });
    }

    return userModel
        .parentLogin(studentID)
        .then((result) => {
            console.log(result);

            // Check if password entered is == to DOB + NRIC (password) in database
            if (password != result.dateOfBirth + result.studentNRIC) {
                // !! Thrown error is not caught by catch block
                const error = new Error("Invalid URL or password");
                error.status = 401;
                throw error;
            }
            
            return res.json({ user: result });
            
        })
    })
module.exports = app;