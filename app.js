const express = require("express");
const cookieParser = require('cookie-parser');
const moment = require('moment');
const XLSX = require('xlsx');
const bodyParser = require('body-parser');
const formData = require("express-form-data");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const elasticEmail = require('elasticemail');
const cloudinary = require("cloudinary").v2;
const { UserNotFoundError, DUPLICATE_ENTRY_ERROR, EMPTY_RESULT_ERROR, WRONG_VALUE_FOR_FIELD } = require("./errors");
const crypto = require('crypto');

const key = Buffer.from(process.env.encryptKey, 'hex');
const iv = Buffer.from(process.env.encryptIV, 'hex');

const authHelper = require('./auth/userAuth');
const parentAuthHelper = require('./auth/parentAuth');
const userModel = require('./model/user');
const doctorFormModel = require('./model/doctorForm');
const parentModel = require('./model/parent');
const formModel = require('./model/form');
const adminModel = require('./model/admin');
const pmtModel = require('./model/pmt');
const mstModel = require('./model/mst');
const regFormModel = require('./model/regForm');
const cloudinaryModel = require('./model/cloudinary');
const passwordGenerator = require('./helper/passwordGenerator');
const momentHelper = require('./helper/epochConverter');
const cronJob = require('./helper/cron');

const app = express();
const JWT_SECRET = process.env.SECRETKEY;

const twilioClient = require('twilio')(process.env.twilioSID, process.env.twilioToken);

const elasticEmailClient = elasticEmail.createClient({ apiKey: process.env.elasticAPIKey });

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

// Form Data Parser
app.use(formData.parse({}));
app.use(formData.format());
app.use(formData.stream());
app.use(formData.union());

// JSON Parser
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// CRON Job
cronJob.dataRetentionJob();

app.get('/', (req, res) => {
    res.redirect(`/login`);
});

app.get('/obs-admin', (req, res) => {
    res.redirect(`/obs-admin/login`);
});
// callback function - directs back to home page
app.get('/callback', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

/**
 * User: General
 */

// Login
app.post('/login', (req, res, next) => {

    const requestUrl = req.headers.referer;

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
        .loginUser(credentials.email)
        .then((result) => {
            // CHECK HASH

            if ((requestUrl.includes("/obs-admin/login") && result.roleId == 4) ||
                (!requestUrl.includes("/obs-admin/login") && result.roleId != 4) ||
                (!bcrypt.compareSync(credentials.password, result.password))) {
                const error = new Error("Invalid email or password");
                error.status = 401;
                throw error;
            }

            if (result.isDisabled) {
                const error = new Error("Account is disabled. Please contact admin for more information");
                error.status = 403;
                throw error;
            }

            const passwordExpiry = momentHelper.utcToLocale(result.passwordUpdated);
            const today = moment();

            // to simulate and test
            //const today = moment().add(180, 'days')
            //console.log(today.diff(passwordExpiry, 'days'))

            // PASSWORD EXPIRY CHECK (180 DAYS)
            if (today.diff(passwordExpiry, 'days') >= 180 || !passwordExpiry.isValid()) {

                let payload = {
                    'email': result.email,
                    'forcereset': true
                }

                let tokenConfig = {
                    expiresIn: 28800,
                    algorithm: 'HS256'
                };

                jwt.sign(payload, JWT_SECRET, tokenConfig, (err, token) => {

                    if (err) {
                        const error = new Error("Failed to sign JWT");
                        error.status = 500;
                        throw error;
                    };

                    res.cookie('resetToken', token, {
                        httpOnly: true,
                        secure: false,
                        sameSite: 'strict'
                    });

                    if (payload.email) {
                        return res.redirect('/reset-password');

                    } else {
                        const error = new Error("Invalid user data");
                        error.status = 500;
                        throw error;
                    }
                })
            }

            // SET JWT
            let payload = {
                'email': result.email,
                'name': result.nameOfUser,
                'permissionGroup': result.groupId,
                'role': result.roleId,
                'permissions': result.permissions,
                'picUrl': result.picUrl,
                'contact': result.contactNo
            }

            let tokenConfig = {
                expiresIn: 28800,
                algorithm: 'HS256'
            };

            // SIGN JWT
            jwt.sign(payload, JWT_SECRET, tokenConfig, (err, token) => {

                if (err) {
                    const error = new Error("Failed to sign JWT");
                    error.status = 500;
                    throw error;
                };

                res.cookie('jwt', token, {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'strict'
                });

                if (payload.role == 1) {
                    return res.redirect('/obs-admin/admin')
                } else if (payload.role == 2 || payload.role == 3) {
                    return res.redirect('/obs-admin/obs-management')
                } else if (payload.role == 4) {
                    return res.redirect('/obs-form')
                } else {
                    const error = new Error("Invalid user role");
                    error.status = 500;
                    throw error;
                }
            })
        })
        .catch((error) => {
            return res.status(error.status || 500).json({ error: error.message });
        });
});

// Check password
app.post('/checkpass', authHelper.verifyToken, authHelper.checkIat, (req, res, next) => {

    const credentials = {
        email: req.decodedToken.email,
        password: req.body.password,
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
                throw error;
            }

            if (result.isDisabled) {
                const error = new Error("Account is disabled. Please dontact admin for more information");
                error.status = 403;
                throw error;
            }

            res.sendStatus(200);
        })
        .catch((error) => {
            console.log(error)
            return res.status(error.status || 500).json({ error: error.message });
        });
});

// Get User Info
app.get('/user', authHelper.verifyToken, authHelper.checkIat, (req, res, next) => {
    const user = req.decodedToken;

    if (!user) {
        return res.redirect('/error?code=401')
    }

    delete user.iat;
    delete user.exp;
    delete user.permissionGroup;

    return adminModel
        .getUserRoles()
        .then((result) => {
            if (!result) {
                const error = new Error("No user roles found")
                error.status = 404;
                throw error
            }

            result.forEach(i => {
                if (i.roleId == user.role) {
                    user.roleName = i.roleName
                }
            });

            return res.send({ user });
        })
        .catch((error) => {
            return res.status(error.status || 500).json({ error: error.message });
        })
})

// Update user password
app.put('/user/password', authHelper.verifyToken, authHelper.checkIat, authHelper.checkPassword, (req, res, next) => {
    const user = req.decodedToken;

    if (!user) {
        console.log('UPDATE PASSWORD ERROR: User not found.')
        return res.redirect('/error?code=401&type=obs-admin')
    }

    if (!req.body.password.newPassword || !user.email) {
        const error = new Error("Empty or invalid information");
        error.status = 400;
        throw error;
    }

    const { newPassword, confirmPassword } = req.body.password;

    if (newPassword != confirmPassword) {
        const error = new Error("Passwords do not match");
        error.status = 400;
        throw error;
    }

    bcrypt.hash(newPassword, 10, async function (err, hash) {
        if (err) {
            return res.status(500).json({ error: 'Error hashing password' });
        }

        const email = user.email;
        const password = hash;
        const invalidationDate = moment.tz('Asia/Singapore').format('YYYY-MM-DD HH:mm:ss');
        const passwordUpdated = invalidationDate;

        return adminModel
            .updateUserPassword(email, password, invalidationDate, passwordUpdated)
            .then((result) => {

                if (!result) {
                    const error = new Error("Unable to update account password")
                    error.status = 500;
                    throw error;
                }

                return userModel
                    .loginUser(email)
                    .then((result) => {

                        // CHECK HASH
                        if (!bcrypt.compareSync(newPassword, result.password)) {
                            const error = new Error("Invalid email or password");
                            error.status = 401;
                            throw error;
                        }

                        if (result.isDisabled) {
                            const error = new Error("Account is disabled. Please dontact admin for more information");
                            error.status = 403;
                            throw error;
                        }

                        // SET JWT
                        let payload = {
                            'email': result.email,
                            'name': result.nameOfUser,
                            'permissionGroup': result.groupId,
                            'role': result.roleId,
                            'permissions': result.permissions,
                            'picUrl': result.picUrl,
                            'contact': result.contactNo
                        }

                        let tokenConfig = {
                            expiresIn: 28800,
                            algorithm: 'HS256'
                        };

                        // SIGN JWT
                        jwt.sign(payload, JWT_SECRET, tokenConfig, (err, token) => {

                            if (err) {
                                const error = new Error("Failed to sign JWT");
                                error.status = 500;
                                throw error;
                            };

                            res.cookie('jwt', token, {
                                httpOnly: true,
                                secure: false,
                                sameSite: 'strict'
                            });

                            if (payload.role) {
                                return res.sendStatus(200);
                            } else {
                                const error = new Error("Invalid user role");
                                error.status = 500;
                                throw error;
                            }
                        })
                    })
            })
            .catch((error) => {
                console.log(error)
                return res.status(error.status || 500).json({ error: error.message });
            })
    })
})

// Force update panel access check
app.get('/user/updatepassword', authHelper.verifyResetToken, (req, res, next) => {

    if (!req.decodedToken.forcereset) {
        return res.redirect('/error?code=403')
    }

    res.sendStatus(200);
})

// Update user password (force update panel)
app.put('/user/updatepassword', authHelper.verifyResetToken, (req, res, next) => {
    const user = req.decodedToken;

    if (!user.forcereset) {
        return res.redirect('/error?code=403')
    }

    if (!req.body.password.newPassword || !user.email) {
        const error = new Error("Empty or invalid information");
        error.status = 400;
        throw error;
    }

    const { newPassword, confirmPassword } = req.body.password;

    if (newPassword != confirmPassword) {
        const error = new Error("Passwords do not match");
        error.status = 400;
        throw error;
    }

    bcrypt.hash(newPassword, 10, async function (err, hash) {
        if (err) {
            return res.status(500).json({ error: 'Error hashing password' });
        }

        const email = user.email;
        const password = hash;
        const invalidationDate = moment.tz('Asia/Singapore').format('YYYY-MM-DD HH:mm:ss');
        const passwordUpdated = invalidationDate;

        return adminModel
            .updateUserPassword(email, password, invalidationDate, passwordUpdated)
            .then((result) => {

                if (!result) {
                    const error = new Error("Unable to update account password")
                    error.status = 500;
                    throw error;
                }

                return userModel
                    .loginUser(email)
                    .then((result) => {

                        // CHECK HASH
                        if (!bcrypt.compareSync(newPassword, result.password)) {
                            const error = new Error("Invalid email or password");
                            error.status = 401;
                            throw error;
                        }

                        if (result.isDisabled) {
                            const error = new Error("Account is disabled. Please dontact admin for more information");
                            error.status = 403;
                            throw error;
                        }

                        // SET JWT
                        let payload = {
                            'email': result.email,
                            'name': result.nameOfUser,
                            'permissionGroup': result.groupId,
                            'role': result.roleId,
                            'permissions': result.permissions,
                            'picUrl': result.picUrl,
                            'contact': result.contactNo
                        }

                        let tokenConfig = {
                            expiresIn: 28800,
                            algorithm: 'HS256'
                        };

                        // SIGN JWT
                        jwt.sign(payload, JWT_SECRET, tokenConfig, (err, token) => {

                            if (err) {
                                const error = new Error("Failed to sign JWT");
                                error.status = 500;
                                throw error;
                            };

                            res.clearCookie('resetToken');
                            res.cookie('jwt', token, {
                                httpOnly: true,
                                secure: false,
                                sameSite: 'strict'
                            });

                            if (payload.role == 1) {
                                return res.redirect('/obs-admin/admin')
                            } else if (payload.role == 2 || payload.role == 3) {
                                return res.redirect('/obs-admin/obs-management')
                            } else if (payload.role == 4) {
                                return res.redirect('/obs-form')
                            } else {
                                const error = new Error("Invalid user role");
                                error.status = 500;
                                throw error;
                            }
                        })
                    })
            })
            .catch((error) => {
                console.log(error)
                return res.status(error.status || 500).json({ error: error.message });
            })
    })
})

// Update user
app.put('/user/profile', authHelper.verifyToken, authHelper.checkIat, authHelper.checkPassword, (req, res, next) => {
    const user = req.decodedToken;

    if (!user) {
        console.log('UPDATE USER ERROR: User not found.')
        return res.redirect('/error?code=401&type=obs-admin')
    }

    if (!req.body.name || !req.body.number || !user.email) {
        const error = new Error("Empty or invalid information");
        error.status = 400;
        throw error;
    }

    const email = user.email;
    const name = req.body.name;
    const number = req.body.number;
    const img = req.body.img || null;
    const invalidationDate = moment.tz('Asia/Singapore').format('YYYY-MM-DD HH:mm:ss');

    return cloudinaryModel
        .uploadImage(img)
        .then((result) => {
            const imageUrl = result || null;

            return adminModel
                .updateUserProfile(email, name, number, invalidationDate, imageUrl)
                .then((result) => {
                    if (!result) {
                        const error = new Error("Unable to update profile")
                        error.status = 500;
                        throw error;
                    }

                    return userModel
                        .loginUser(email)
                        .then((result) => {

                            const { currentPassword } = req.body.password;

                            // CHECK HASH
                            if (!bcrypt.compareSync(currentPassword, result.password)) {
                                const error = new Error("Invalid email or password");
                                error.status = 401;
                                throw error;
                            }

                            if (result.isDisabled) {
                                const error = new Error("Account is disabled. Please dontact admin for more information");
                                error.status = 403;
                                throw error;
                            }

                            // SET JWT
                            let payload = {
                                'email': result.email,
                                'name': result.nameOfUser,
                                'permissionGroup': result.groupId,
                                'role': result.roleId,
                                'permissions': result.permissions,
                                'picUrl': result.picUrl,
                                'contact': result.contactNo
                            }

                            let tokenConfig = {
                                expiresIn: 28800,
                                algorithm: 'HS256'
                            };

                            // SIGN JWT
                            jwt.sign(payload, JWT_SECRET, tokenConfig, (err, token) => {

                                if (err) {
                                    const error = new Error("Failed to sign JWT");
                                    error.status = 500;
                                    throw error;
                                };

                                res.cookie('jwt', token, {
                                    httpOnly: true,
                                    secure: false,
                                    sameSite: 'strict'
                                });

                                if (payload.role) {
                                    return res.sendStatus(200);
                                } else {
                                    const error = new Error("Invalid user role");
                                    error.status = 500;
                                    throw error;
                                }
                            })
                        })
                })
        })
        .catch((error) => {
            console.log(error)
            return res.status(error.status || 500).json({ error: error.message });
        })
})

// Logout
app.get('/logout', (req, res, next) => {
    try {
        res.clearCookie('jwt');
        return res.status(200).send({ 'message': 'Logout successful' });

    } catch (err) {
        const error = new Error("Cleanup error");
        error.status = 500;
        throw error;
    }
})

/**
 * User: Parent
 */

// Encrypt studentID for Cypress testing
app.post('/parent/cypress/encrypt', (req, res, next) => {
    const studentID = req.body.studentID.toString();

    // Encrypt studentID
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const encrypted = cipher.update(studentID, 'utf8', 'hex') + cipher.final('hex');

    return res.status(200).json({ encrypted: encrypted });
})

app.get('/parent/logout', (req, res, next) => {
    try {
        res.clearCookie('parentJWT');
        return res.status(200).send({ 'message': 'Logout successful' });

    } catch (err) {
        const error = new Error("Cleanup error");
        error.status = 500;
        throw error;
    }
})

app.get('/form/:encrypted', parentAuthHelper.verifyToken, parentAuthHelper.validateUser, (req, res, next) => {
    const encrypted = req.params.encrypted;

    // Decrypt studentID
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    const studentID = decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');

    return formModel
        .getFormDetails(studentID)
        .then((result) => {
            // Decrypt signature data
            const encryptedSignInfo = result.signature
            const key = Buffer.from(process.env.signatureKey);
            const iv = Buffer.from(process.env.signatureIV);
            try {
                // Create the decipher object
                const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
                let decrypted = decipher.update(encryptedSignInfo, 'hex', 'utf8');
                decrypted += decipher.final('utf8');
                result.signature = decrypted.split(';')[0];
            } catch (error) {
                // Decrypt Error
                console.error('Decryption Error:', error);
                res.status(500).json({ message: 'Decryption Error' });
            }

            return res.json({ form: result });
        })
        .catch((error) => {
            console.log(error)
            return res.status(error.status || 500).json({ error: error.message });
        })
});

app.post('/parent-sign-upload', parentAuthHelper.verifyToken, (req, res) => {
    const file = req.body.parentSignature;
    return cloudinaryModel.uploadSignature(file)
        .then((result) => {
            const signature = result;
            return res.status(200).json({ signature: signature });
        }
        )
        .catch((error) => {
            console.log(error)
            return res.status(error.status || 500).json({ error: error.message });
        }
        )
});

// Twilio SMS
app.post('/send-sms', (req, res) => {
    const { contact } = req.body;

    // Compose the sms parameters
    const smsParams = {
        from: "+14178525159",
        to: "+65" + contact,
        body: `📩 Important: Check your email! 📩
Dear Parents,

Your child's health update requires your attention. Please check your email for important information regarding new medical conditions. Kindly acknowledge upon reading.

Thank you,
National Youth Council in affiliation with Outward Bound Singapore`
    }

    // Send sms
    twilioClient.messages.create(smsParams)
        .then((message) => {
            return res.status(200).send({ 'message': 'SMS sent successfully' });
        })
        .catch((error) => {
            console.log(error)
            return res.status(error.status || 500).json({ error: error.message });
        })
})

// Email test
app.post('/send-email', authHelper.verifyToken, authHelper.checkIat, (req, res) => {
    const { email, studentId } = req.body;
    // Make studentId into a string
    const parsedStudentId = studentId.toString();
    // Encrypt studentId
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encryptedStudentId = cipher.update(parsedStudentId, 'utf8', 'hex');
    encryptedStudentId += cipher.final('hex');

    // Compose the email parameters
    const emailParams = {
        to: email,
        subject: "Require Parent's Acknowledgement: New Changes in Your Child's Medical Condition",
        from: 'sg.outwardbound@gmail.com',
        body: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Important Medical Updates</title><style>body{font-family:Arial,sans-serif;padding:20px;background-color:#f5f5f5}.container{max-width:600px;margin:0 auto;background-color:#fff;padding:20px;border-radius:5px;box-shadow:0 2px 5px rgba(0,0,0,.1)}.logo{text-align:left;margin-bottom:40px}.logo img{max-width:300px}.message{margin-bottom:20px;font-size:16px}.btn{display:inline-block;padding:10px 20px;background-color:#007bff;color:#fff;text-decoration:none;border-radius:5px;font-weight:700}.btn:hover{background-color:#0056b3}.footer{text-align:center;color:#888;font-size:14px;margin-top:20px;border-top:1px solid #ccc;padding-top:20px}.footer hr{margin-bottom:10px}.footer p{margin-bottom:10px}</style></head><body><div class="container"><div class="logo"><img src="https://res.cloudinary.com/sp-esde-2100030/image/upload/v1688051640/obs-logo_pi70gy.png" alt="Logo"></div><div class="message"><p>Dear Parents,</p><p>We hope this email finds you and your family in good health and high spirits. As part of our ongoing commitment to provide the best care for your children, we would like to inform you about some important updates regarding their medical conditions.</p><br><p>At our recent healthcare evaluation, we have made significant progress in understanding and managing your child's medical condition. To ensure that our records are up to date, we kindly request your cooperation in acknowledging the new changes in your child's medical condition by clicking on the following link:</p><p><a class="btn" href="form-obs.onrender.com/acknowledgement/?encrypted=${encryptedStudentId}">Click here to acknowledge the updates</a></p><br><p>By clicking on the link, you will confirm that you have received and reviewed the updates related to your child's health. Your acknowledgment will help us ensure that our information is accurate and that we can continue to provide the highest quality of care.</p><br><p>Rest assured that all the information you provide will remain strictly confidential and will only be used for healthcare purposes. We adhere to the highest standards of privacy and data protection, in compliance with applicable laws and regulations.</p><br><p>If you have any questions or require further assistance, please do not hesitate to reach out to our dedicated support team at nyc_enquiries@nyc.gov.sg. We are here to address any concerns you may have and guide you through the process.</p><br><p>Thank you for your attention to this matter and for entrusting us with the care of your precious child. Together, we can make a positive impact on their health and future.</p><p>Warm regards,</p><p>National Youth Council in affiliation with Outward Bound Singapore</p></div><div class="footer"><p>This email was sent to you by the Administrative Team. If you have any questions, please contact our support team.</p><p>© National Youth Council | Outward Bound Singapore.</p></div></div></body></html>`
    };

    // Send the email using Elastic Email SDK
    elasticEmailClient.mailer.send(emailParams, (err, result) => {
        if (err) {
            console.error('Failed to send email:', err);
            res.status(500).send('Failed to send email');
        } else {
            return res.status(200).json({ message: 'Email sent successfully:' });
        }
    });
});

// Update formStatus after parent acknowledges
app.put('/parent/status', parentAuthHelper.verifyToken, parentAuthHelper.validateUser, (req, res, next) => {

    const encrypted = req.body.encrypted;

    if (encrypted.length != 32) {
        return res.status(400).json({ error: 'Invalid URL' });
    }
    // Decrypt
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    const studentID = decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');

    if (!studentID) {
        return res.status(400).json({ error: 'Invalid URL' });
    }


    return parentModel.updateFormStatus(studentID)
        .then((result) => {
            return res.json(result);
        })
        .catch((error) => {
            return res.status(error.status || 500).json({ error: error.message });
        }
        );



});

app.post('/parent/login-verify', (req, res, next) => {
    // Get encrypted studentID from query
    const encrypted = req.body.encrypted;

    // Check if encrypted StudentID is valid
    if (encrypted.length != 32 || !encrypted) {
        return res.status(400).json({ error: 'Invalid URL' });
    }

    // Decrypt studentID
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    const studentID = decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');

    if (!studentID) {
        return res.status(400).json({ error: 'Invalid URL' });
    }

    return parentModel
        .verifyIfAcknowledged(studentID)
        .then((result) => {
            return res.json(result);
        })
        .catch((error) => {
            return res.status(error.status || 500).json({ error: error.message });
        });
});

app.post('/parent/login/', (req, res, next) => {
    // Get encrypted studentID from body
    const encrypted = req.body.encrypted;
    // Get password from body
    const password = req.body.password.toUpperCase();

    // Check if encrypted StudentID is valid
    if (encrypted.length != 32 || !encrypted) {
        return res.status(400).json({ error: 'Invalid URL' });
    }

    // Decrypt studentID
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    const studentID = decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');

    if (!studentID || !password) {
        return res.status(400).json({ error: 'Invalid URL or password' });
    }

    return userModel
        .parentLogin(studentID)
        .then((result) => {
            // Convert dateofbirth to DD/MM/YYYY (Singapore format)
            result.dateOfBirth = new Date(result.dateOfBirth).toLocaleDateString('en-SG').replace(/\//g, '');
            if (password != (result.dateOfBirth + result.studentNRIC).toUpperCase()) {
                const error = new Error("Invalid URL or password");
                error.status = 401;
                throw error;
            }

            let payload = {
                encrypted: req.body.encrypted,
            }

            let tokenConfig = {
                expiresIn: '1h',
                algorithm: 'HS256'
            }

            // Generate JWT token
            jwt.sign(payload, JWT_SECRET, tokenConfig, (err, token) => {
                if (err) {
                    console.error('Failed to sign JWT token:', err);
                    err.status = 500;
                    throw err;
                };
                res.cookie('parentJWT', token, { httpOnly: true, secure: false, sameSite: 'strict' });
                return res.json({ key: result });
            })


        })
        .catch((error) => {
            console.log(error);
            return res.status(error.status || 500).json({ error: error.message });
        }
        );
})

// Update parent's acknowledgement
app.put('/parent/acknowledge', parentAuthHelper.verifyToken, parentAuthHelper.validateUser, (req, res, next) => {

    const encrypted = req.body.encrypted;

    if (encrypted.length != 32) {
        return res.status(400).json({ error: 'Invalid URL' });
    }

    // Decrypt studentID
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    const studentID = decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');

    // Encrypt parent signature 
    const signatureKey = Buffer.from(process.env.signatureKey); //must be 32 characters
    const signatureIV = Buffer.from(process.env.signatureIV);
    const cipher = crypto.createCipheriv('aes-256-cbc', signatureKey, signatureIV);
    let parentSignature = cipher.update(req.body.parentSignature, 'utf8', 'hex');
    parentSignature += cipher.final('hex');

    if (!studentID) {
        return res.status(400).json({ error: 'Invalid URL' });
    }

    const data = {
        studentID: studentID,
        parentNRIC: req.body.parentNRIC,
        nameOfParent: req.body.nameOfParent,
        parentSignature: parentSignature,
        dateOfAcknowledgement: req.body.dateOfAcknowledgement,
    };

    // If any of the fields are empty
    if (!data.studentID || !data.parentNRIC || !data.nameOfParent || !data.parentSignature || !data.dateOfAcknowledgement) {
        console.log("One of the fields are empty")
        return res.status(400).json({ error: 'Invalid fields' });
    }

    return parentModel.updateAcknowledgement(data)
        .then((result) => {
            return res.json({ user: result });
        }
        ).catch((error) => {
            console.log(error);
            return res.status(error.status || 500).json({ error: error.message });
        })

    function newFunction() {
        parentAuthHelper.validateIfAcknowledged(studentID);
    }
})

app.post('/postAcknowledge', authHelper.verifyToken, authHelper.checkIat, (req, res, next) => {
    const { studentId, parentContactNo, parentEmail } = req.body;
    if (req.decodedToken.role != 4) {
        return res.redirect('/error?code=403');
    }
    return parentModel.postAcknowledgement(studentId, parentContactNo, parentEmail)
        .then((result) => {
            return res.json({ user: result });
        }
        ).catch((error) => {
            console.log(error)
            return res.status(error.status || 500).json({ error: error.message });
        })
});

app.post('/parent/acknowledged', parentAuthHelper.verifyToken, parentAuthHelper.validateUser, (req, res, next) => {
    const { encrypted } = req.body;

    if (encrypted.length != 32 || !encrypted) {
        return res.status(400).json({ error: 'Invalid URL' });
    }

    // Decrypt studentID
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    const studentID = decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');

    if (!studentID) {
        return res.status(400).json({ error: 'Invalid URL' });
    }


    return parentModel.getAcknowledgement(studentID)
        .then((result) => {

            const signatureKey = Buffer.from(process.env.signatureKey);
            const signatureIV = Buffer.from(process.env.signatureIV);
            const decipher = crypto.createDecipheriv('aes-256-cbc', signatureKey, signatureIV);
            let parentSignature = decipher.update(result.parentSignature, 'hex', 'utf8');
            parentSignature += decipher.final('utf8');
            result.parentSignature = parentSignature;

            return res.json({ user: result });
        }
        ).catch((error) => {
            return res.status(error.status || 500).json({ error: error.message });
        })
});


/**
 * User: Super Admin    
 */

// Create Account
app.post('/obs-admin/newuser', authHelper.verifyToken, authHelper.checkIat, (req, res, next) => {

    // AUTHORIZATION CHECK - ADMIN
    if (req.decodedToken.role != 1) {
        return res.redirect('/error?code=403&type=obs-admin')
    }

    const generatedPassword = passwordGenerator.generatePassword();

    const newuser = {
        name: req.body.name,
        email: req.body.email,
        contact: req.body.contact,
        password: generatedPassword,
        permissionGroup: req.body.permissionGroup,
        role: req.body.role
    }

    if (!newuser.name || !newuser.email || !newuser.contact || !newuser.password
        || !newuser.permissionGroup || (newuser.permissionGroup == -1 && newuser.role != 1) || newuser.role == -1) {
        const error = new Error("Empty or invalid user information");
        error.status = 400;
        throw error;
    }

    if (newuser.role == 1) {
        newuser.permissionGroup = 0
    }

    // HASHING PASSWORD
    bcrypt.hash(newuser.password, 10, async function (err, hash) {
        if (err) {
            return res.status(500).json({ error: 'Error hashing password' });
        }

        newuser.password = hash;
        newuser.created_at = moment.tz('Asia/Singapore').format('YYYY-MM-DD HH:mm:ss');

        return adminModel
            .createUser(newuser)
            .then((result) => {
                if (!result) {
                    const error = new Error("Unable to create account")
                    error.status = 500;
                    throw error;
                }

                let urlLink;
                newuser.role == 4 ? urlLink = 'https://form-obs.onrender.com' : urlLink = 'https://form-obs.onrender.com/obs-admin'

                const emailOptions = {
                    to: newuser.email,
                    subject: "Welcome to the OBS Team!",
                    from: 'sg.outwardbound@gmail.com',
                    body: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Forget Password</title><style>body{font-family:Arial,sans-serif;padding:20px;background-color:#f5f5f5}.container{max-width:600px;margin:0 auto;background-color:#fff;padding:20px;border-radius:5px;box-shadow:0 2px 5px rgba(0,0,0,.1)}.logo{text-align:left;margin-bottom:40px}.logo img{max-width:300px}.message{margin-bottom:20px;font-size:16px}.password-block{background-color:#f5f5f5;padding:10px;border-radius:5px;text-align:center}.password{font-weight:700;font-size:24px;color:#007bff}.btn{display:inline-block;padding:10px 20px;background-color:#007bff;color:#fff;text-decoration:none;border-radius:5px;font-weight:700}.btn:hover{background-color:#0056b3}.footer{text-align:center;color:#888;font-size:14px;margin-top:20px;border-top:1px solid #ccc;padding-top:20px}.footer hr{margin-bottom:10px}.footer p{margin-bottom:10px}.login-btn{display:inline-block;padding:10px 20px;background-color:#007bff;color:#fff;text-decoration:none;border-radius:5px;font-weight:700;margin-top:20px;margin-bottom:20px}.login-btn:hover{background-color:#0056b3}</style></head><body><div class="container"><div class="logo"><img src="https://res.cloudinary.com/sp-esde-2100030/image/upload/v1688051640/obs-logo_pi70gy.png" alt="Logo"></div><div class="message"><p><b>Hello ${newuser.name}, Welcome to the team!</b></p><p>Your account have been successfully created and you may now login with your email and the given password below.</p><div class="password-block"><span class="password" id="new-password">${generatedPassword}</span></div><p>Please use this password to log in to your account. We recommend changing your password after logging in for security reasons.</p><p>If you did not initiate this request, please ignore this email or contact our support team.</p></div><div style="text-align:center"><a class="login-btn" href="${urlLink}">Login Now</a></div><div class="footer"><p>This email was sent to you by the Administrative Team. If you have any questions, please contact our support team.</p><p>© National Youth Council | Outward Bound Singapore.</p></div></div></body></html>`,
                };

                elasticEmailClient.mailer.send(emailOptions, (error, result) => {
                    if (error) {
                        const error = new Error("Failed to send email");
                        error.status = 500;
                        throw error;
                    } else {
                        res.sendStatus(201);
                    }
                });
            })
            .catch((error) => {
                if (error.code == "ER_DUP_ENTRY") {
                    return res.status(422).json({ error: "Email already exists" });
                }
                return res.status(error.status || 500).json({ error: error.message });
            })
    })

});

// Get All Users
app.get('/obs-admin/users/:search/:limit/:offset', authHelper.verifyToken, authHelper.checkIat, (req, res, next) => {

    // AUTHORIZATION CHECK - ADMIN
    if (req.decodedToken.role != 1) {
        return res.redirect('/error?code=403&type=obs-admin')
    }

    let searchInput = ""
    if (req.params.search != -1) {
        searchInput = req.params.search
    }

    const { email } = req.decodedToken
    const offset = parseInt(req.params.offset);
    const limit = parseInt(req.params.limit);

    return adminModel
        .getAllUsers(email, searchInput, limit, offset)
        .then((result) => {
            if (!result) {
                const error = new Error("No users found")
                error.status = 404;
                throw error
            }
            return res.json({ result })
        })
        .catch((error) => {
            return res.status(error.status || 500).json({ error: error.message });
        })
});

// Get All Permission Groups or by Search
app.get('/obs-admin/permission/groups/:search/:limit/:offset', authHelper.verifyToken, authHelper.checkIat, (req, res, next) => {

    // AUTHORIZATION CHECK - ADMIN
    if (req.decodedToken.role != 1) {
        return res.redirect('/error?code=403&type=obs-admin')
    }

    let searchInput = ""
    if (req.params.search != -1) {
        searchInput = req.params.search
    }

    const offset = parseInt(req.params.offset);
    let limit = null;

    req.params.limit ? limit = parseInt(req.params.limit) : limit;
    //limit = parseInt(req.params.limit);


    return adminModel
        .getPermissionGroups(searchInput, limit, offset)
        .then((result) => {
            if (!result) {
                const error = new Error("No permission groups found")
                error.status = 404;
                throw error
            }
            return res.json({ result })
        })
        .catch((error) => {
            return res.status(error.status || 500).json({ error: error.message });
        })
});

// Get All Permissions
app.get('/obs-admin/permission', authHelper.verifyToken, authHelper.checkIat, (req, res, next) => {

    // AUTHORIZATION CHECK - ADMIN
    if (req.decodedToken.role != 1) {
        return res.redirect('/error?code=403&type=obs-admin')
    }

    return adminModel
        .getPermissions()
        .then((result) => {
            if (!result) {
                const error = new Error("No permissions found")
                error.status = 404;
                throw error
            }
            return res.json({ result })
        })
        .catch((error) => {
            return res.status(error.status || 500).json({ error: error.message });
        })
})

// Get All User Roles
app.get('/obs-admin/roles', authHelper.verifyToken, authHelper.checkIat, (req, res, next) => {

    // AUTHORIZATION CHECK - ADMIN
    if (req.decodedToken.role != 1) {
        return res.redirect('/error?code=403&type=obs-admin')
    }

    return adminModel
        .getUserRoles()
        .then((result) => {
            if (!result) {
                const error = new Error("No user roles found")
                error.status = 404;
                throw error
            }
            return res.json({ result })
        })
        .catch((error) => {
            return res.status(error.status || 500).json({ error: error.message });
        })
});

// Create Permission Group
app.post('/obs-admin/permission/groups', authHelper.verifyToken, authHelper.checkIat, (req, res, next) => {

    // AUTHORIZATION CHECK - ADMIN
    if (req.decodedToken.role != 1) {
        return res.redirect('/error?code=403&type=obs-admin')
    }

    const newPermGroup = {
        permGroupName: req.body.groupName,
        permissions: req.body.permsId
    }

    if (!newPermGroup.permissions.includes('1')) {
        newPermGroup.permissions.push('1')
    }

    if (!newPermGroup.permGroupName || newPermGroup.permissions.length == 0) {
        const error = new Error("Empty or invalid information");
        error.status = 400;
        throw error;
    }

    return adminModel
        .createPermGroup(newPermGroup)
        .then((result) => {
            if (!result) {
                const error = new Error("Unable to create permission group")
                error.status = 500;
                throw error;
            }
            return res.status(201).json(result);
        })
        .catch((error) => {
            if (error.code == "ER_DUP_ENTRY") {
                return res.status(422).json({ error: "Permission group already exists" });
            }
            return res.status(error.status || 500).json({ error: error.message });
        })
})

// Edit Permission Group
app.put('/obs-admin/permission/groups', authHelper.verifyToken, authHelper.checkIat, (req, res, next) => {

    // AUTHORIZATION CHECK - ADMIN
    if (req.decodedToken.role != 1) {
        return res.redirect('/error?code=403&type=obs-admin')
    }

    const permGroup = {
        permGroupId: req.body.groupId,
        permGroupName: req.body.groupName,
        permissions: req.body.permsId
    }

    if (permGroup.permGroupId == '155') {
        const error = new Error("Cannot edit default group");
        error.status = 400;
        throw error;
    }

    if (!permGroup.permissions.includes('1')) {
        permGroup.permissions.push('1')
    }

    if (!permGroup.permGroupName || permGroup.permissions.length == 0) {
        const error = new Error("Empty or invalid information");
        error.status = 400;
        throw error;
    }

    const invalidationDate = moment.tz('Asia/Singapore').format('YYYY-MM-DD HH:mm:ss');

    return adminModel
        .editPermGroup(permGroup, invalidationDate)
        .then((result) => {
            if (!result) {
                const error = new Error("Unable to update permission group")
                error.status = 500;
                throw error;
            }
            return res.sendStatus(200);
        })
        .catch((error) => {
            console.log(error)
            if (error.code == "ER_DUP_ENTRY") {
                return res.status(422).json({ error: "Permission group already exists" });
            }
            return res.status(error.status || 500).json({ error: error.message });
        })
})

// Delete Permission Group
app.delete('/obs-admin/permission/groups/:groupId', authHelper.verifyToken, authHelper.checkIat, (req, res, next) => {

    // AUTHORIZATION CHECK - ADMIN
    if (req.decodedToken.role != 1) {
        return res.redirect('/error?code=403&type=obs-admin')
    }

    const groupId = req.params.groupId

    if (!groupId) {
        const error = new Error("Empty groupId")
        error.status = 400;
        throw error;
    }

    if (groupId == '155') {
        const error = new Error("Cannot delete default group");
        error.status = 400;
        throw error;
    }

    const invalidationDate = moment.tz('Asia/Singapore').format('YYYY-MM-DD HH:mm:ss');

    return adminModel
        .deletePermissionGroup(groupId, invalidationDate)
        .then((result) => {
            if (!result) {
                const error = new Error("Unable to delete permission group")
                error.status = 500;
                throw error;
            }
            return res.sendStatus(200);
        })
        .catch((error) => {
            console.log(error)
            return res.status(error.status || 500).json({ error: error.message });
        })
})

// Bulk Delete Permission Groups
app.delete('/obs-admin/permission/groups', authHelper.verifyToken, authHelper.checkIat, (req, res, next) => {

    // AUTHORIZATION CHECK - ADMIN
    if (req.decodedToken.role != 1) {
        return res.redirect('/error?code=403&type=obs-admin')
    }

    const { groupIds } = req.body;

    if (!groupIds) {
        const error = new Error("Empty groupIds")
        error.status = 400;
        throw error;
    }

    if (groupIds.includes('155')) {
        const error = new Error("Cannot delete default group");
        error.status = 400;
        throw error;
    }

    const invalidationDate = moment.tz('Asia/Singapore').format('YYYY-MM-DD HH:mm:ss');

    return adminModel
        .bulkDeletePermissionGroup(groupIds, invalidationDate)
        .then((result) => {
            if (!result) {
                const error = new Error("Unable to delete permission groups")
                error.status = 500;
                throw error;
            }
            return res.sendStatus(200);
        })
        .catch((error) => {
            console.log(error)
            return res.status(error.status || 500).json({ error: error.message });
        })
})

// Update User
app.put('/obs-admin/user', authHelper.verifyToken, authHelper.checkIat, (req, res, next) => {

    // AUTHORIZATION CHECK - ADMIN
    if (req.decodedToken.role != 1) {
        return res.redirect('/error?code=403&type=obs-admin')
    }

    const user = {
        email: req.body.email,
        name: req.body.name,
        role: req.body.role,
        group: req.body.group,
        contact: req.body.contact,
        invalidationDate: moment.tz('Asia/Singapore').format('YYYY-MM-DD HH:mm:ss')
    }

    if (!user.name || !user.email || !user.contact || !user.group || (user.group == -1 && user.role != 1) || user.role == -1) {
        const error = new Error("Empty or invalid user information");
        error.status = 400;
        throw error;
    }

    if (user.role == 1) {
        user.group = 0
    }

    return adminModel
        .editUser(user)
        .then((result) => {
            if (!result) {
                const error = new Error("Unable to update user")
                error.status = 500;
                throw error;
            }
            return res.sendStatus(200);
        })
        .catch((error) => {
            console.log(error)
            if (error.code == "ER_DUP_ENTRY") {
                return res.status(422).json({ error: "User email already exists" });
            }
            return res.status(error.status || 500).json({ error: error.message });
        })
})

// Delete User
app.put('/obs-admin/delete/user/:email', authHelper.verifyToken, authHelper.checkIat, (req, res, next) => {

    // AUTHORIZATION CHECK - ADMIN
    if (req.decodedToken.role != 1) {
        return res.redirect('/error?code=403&type=obs-admin')
    }

    const user = {
        email: req.params.email,
        invalidationDate: moment.tz('Asia/Singapore').format('YYYY-MM-DD HH:mm:ss')
    }

    if (!user.email) {
        const error = new Error("Empty user email")
        error.status = 400;
        throw error;
    }

    return adminModel
        .deleteUser(user)
        .then((result) => {
            if (!result) {
                const error = new Error("Unable to delete user")
                error.status = 500;
                throw error;
            }
            return res.sendStatus(200);
        })
        .catch((error) => {
            console.log(error)
            return res.status(error.status || 500).json({ error: error.message });
        })
})

// Bulk Delete User
app.put('/obs-admin/delete/user', authHelper.verifyToken, authHelper.checkIat, (req, res, next) => {

    // AUTHORIZATION CHECK - ADMIN
    if (req.decodedToken.role != 1) {
        return res.redirect('/error?code=403&type=obs-admin')
    }

    const { users } = req.body;
    const invalidationDate = moment.tz('Asia/Singapore').format('YYYY-MM-DD HH:mm:ss');

    if (!users) {
        const error = new Error("Empty users")
        error.status = 400;
        throw error;
    }

    return adminModel
        .bulkDeleteUser(users, invalidationDate)
        .then((result) => {
            if (!result) {
                const error = new Error("Unable to delete users")
                error.status = 500;
                throw error;
            }
            return res.sendStatus(200);
        })
        .catch((error) => {
            console.log(error)
            return res.status(error.status || 500).json({ error: error.message });
        })
});

// Disable Account
app.put('/obs-admin/disable/user/:email/:status', authHelper.verifyToken, authHelper.checkIat, (req, res, next) => {

    // AUTHORIZATION CHECK - ADMIN
    if (req.decodedToken.role != 1) {
        return res.redirect('/error?code=403&type=obs-admin')
    }

    const user = {
        email: req.params.email,
        status: req.params.status,
        invalidationDate: moment.tz('Asia/Singapore').format('YYYY-MM-DD HH:mm:ss')
    }

    if (!user.email || !user.status) {
        const error = new Error("Empty user email")
        error.status = 400;
        throw error;
    }

    return adminModel
        .disableUser(user)
        .then((result) => {
            if (!result) {
                const error = new Error("Unable to disable/enable user")
                error.status = 500;
                throw error;
            }
            return res.sendStatus(200);
        })
        .catch((error) => {
            console.log(error)
            return res.status(error.status || 500).json({ error: error.message });
        })
});

// Bulk Disable User
app.put('/obs-admin/disable/user', authHelper.verifyToken, authHelper.checkIat, (req, res, next) => {

    // AUTHORIZATION CHECK - ADMIN
    if (req.decodedToken.role != 1) {
        return res.redirect('/error?code=403&type=obs-admin')
    }

    const { users } = req.body;
    const invalidationDate = moment.tz('Asia/Singapore').format('YYYY-MM-DD HH:mm:ss');

    if (!users) {
        const error = new Error("Empty users")
        error.status = 400;
        throw error;
    }

    return adminModel
        .bulkDisableUser(users, 1, invalidationDate)
        .then((result) => {
            if (!result) {
                const error = new Error("Unable to disable users")
                error.status = 500;
                throw error;
            }
            return res.sendStatus(200);
        })
        .catch((error) => {
            console.log(error)
            return res.status(error.status || 500).json({ error: error.message });
        })
});

// Reset user password
app.post('/obs-admin/reset/:email', authHelper.verifyToken, authHelper.checkIat, async (req, res, next) => {
    try {
        // AUTHORIZATION CHECK - ADMIN
        if (req.decodedToken.role !== 1) {
            return res.redirect('/error?code=403&type=obs-admin');
        }

        const { email } = req.params;

        if (!email) {
            const error = new Error("Empty user email");
            error.status = 400;
            throw error;
        }

        const result = await adminModel.getUserInfo(email);

        if (!result) {
            const error = new Error("User does not exist");
            error.status = 404;
            throw error;
        }

        const name = result.nameOfUser;
        const password = passwordGenerator.generatePassword();
        const hash = await bcrypt.hash(password, 10);
        const invalidationDate = moment.tz('Asia/Singapore').format('YYYY-MM-DD HH:mm:ss');
        const passwordUpdated = null;

        const updateResult = await adminModel.updateUserPassword(email, hash, invalidationDate, passwordUpdated);

        if (!updateResult) {
            const error = new Error("Unable to update account password");
            error.status = 500;
            throw error;
        }

        let urlLink;
        result.roleId == 4 ? urlLink = 'https://form-obs.onrender.com' : urlLink = 'https://form-obs.onrender.com/obs-admin'

        const emailOptions = {
            to: email,
            subject: "Reset your OBS password",
            from: 'sg.outwardbound@gmail.com',
            body: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Forget Password</title><style>body{font-family:Arial,sans-serif;padding:20px;background-color:#f5f5f5}.container{max-width:600px;margin:0 auto;background-color:#fff;padding:20px;border-radius:5px;box-shadow:0 2px 5px rgba(0,0,0,.1)}.logo{text-align:left;margin-bottom:40px}.logo img{max-width:300px}.message{margin-bottom:20px;font-size:16px}.password-block{background-color:#f5f5f5;padding:10px;border-radius:5px;text-align:center}.password{font-weight:700;font-size:24px;color:#007bff}.btn{display:inline-block;padding:10px 20px;background-color:#007bff;color:#fff;text-decoration:none;border-radius:5px;font-weight:700}.btn:hover{background-color:#0056b3}.footer{text-align:center;color:#888;font-size:14px;margin-top:20px;border-top:1px solid #ccc;padding-top:20px}.footer hr{margin-bottom:10px}.footer p{margin-bottom:10px}.login-btn{display:inline-block;padding:10px 20px;background-color:#007bff;color:#fff;text-decoration:none;border-radius:5px;font-weight:700;margin-top:20px;margin-bottom:20px}.login-btn:hover{background-color:#0056b3}</style></head><body><div class="container"><div class="logo"><img src="https://res.cloudinary.com/sp-esde-2100030/image/upload/v1688051640/obs-logo_pi70gy.png" alt="Logo"></div><div class="message"><p><b>Hello ${name},</b></p><p>You have requested a new password for your account. Below is your new password:</p><div class="password-block"><span class="password" id="new-password">${password}</span></div><p>Please use this password to log in to your account. We recommend changing your password after logging in for security reasons.</p><p>If you did not request a password reset, email or contact our support team immediately.</p></div><div style="text-align:center"><a class="login-btn" href="${urlLink}">Login Now</a></div><div class="footer"><p>This email was sent to you by the Administrative Team. If you have any questions, please contact our support team.</p><p>© National Youth Council | Outward Bound Singapore.</p></div></div></body></html>`,
        };

        elasticEmailClient.mailer.send(emailOptions, (error, result) => {
            if (error) {
                const error = new Error("Failed to send email");
                error.status = 500;
                throw error;
            } else {
                res.sendStatus(200);
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(error.status || 500).json({ error: error.message });
    }
});

/**
 * Admin: Partnership Management Team (PMT)
 */

//PMT Retrieve All Submissions
app.get('/obs-admin/pmt/all', authHelper.verifyToken, authHelper.checkIat, async (req, res, next) => {
    // AUTHORIZATION CHECK - PMT, MST 
    if (req.decodedToken.role != 2 && req.decodedToken.role != 3) {
        return res.redirect('/error?code=403&type=obs-admin')
    }
    // IF NO PERMISSIONS
    if (!req.decodedToken.permissions.includes(1)) {
        return res.redirect('/error?code=403&type=obs-admin')
    }
    return pmtModel
        .retrieveAllSubmissions()
        .then((result) => {

            if (result.length === 0) {
                throw new Error("No submissions found");
            }


            result[0].push(req.decodedToken.permissions);
            return res.json(result[0]);
        })
        .catch((error) => {
            return res.status(error.status || 500).json({ error: error.message });
        });
});
app.get('/obs-admin/pmt/formStatus/:formStatus', authHelper.verifyToken, authHelper.checkIat, async (req, res, next) => {
    // AUTHORIZATION CHECK - PMT, MST 
    const formStatus = req.params.formStatus;
    if (req.decodedToken.role != 2 && req.decodedToken.role != 3) {
        return res.redirect('/error?code=403&type=obs-admin')
    }
    // IF NO PERMISSIONS
    if (!req.decodedToken.permissions.includes(1)) {
        return res.redirect('/error?code=403&type=obs-admin')
    }
    return pmtModel
        .getSubmissionByStatus(formStatus)
        .then((result) => {

            if (result.length === 0) {
                throw new Error("No submissions found");
            }


            result[0].push(req.decodedToken.permissions);
            return res.json(result[0]);
        })
        .catch((error) => {
            return res.status(error.status || 500).json({ error: error.message });
        });
});

//PMT Retrieve Submission By Student Name
app.get('/obs-admin/pmt/:studentId', authHelper.verifyToken, authHelper.checkIat, async (req, res, next) => {
    const studentId = req.params.studentId;
    // AUTHORIZATION CHECK - PMT, MST
    if (req.decodedToken.role !== 2 && req.decodedToken.role !== 3) {
        return res.redirect('/error?code=403&type=obs-admin');
    }
    // IF NO PERMISSIONS
    if (!req.decodedToken.permissions.includes(1)) {
        return res.redirect('/error?code=403&type=obs-admin');
    }

    return pmtModel.retrieveSubmission(studentId)
        .then((result) => {
            if (result[0].length === 0) {

                throw new Error(`${studentId}'s submission not found`);
            }

            const encryptedSignInfo = result[0][0].signature;
            const encryptedParentSignInfo = result[0][0].parentSignature;
            const key = Buffer.from(process.env.signatureKey, 'utf8'); // must be 32 characters
            const iv = Buffer.from(process.env.signatureIV, 'utf8'); // must be 16 characters

            // Create the decipher object
            const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
            let decrypted = decipher.update(encryptedSignInfo, 'hex', 'utf8');
            decrypted += decipher.final('utf8');

            if (encryptedParentSignInfo !== null) {
                const decipherParent = crypto.createDecipheriv('aes-256-cbc', key, iv);
                let decryptedParent = decipherParent.update(encryptedParentSignInfo, 'hex', 'utf8');
                decryptedParent += decipherParent.final('utf8');
                result[0][0].parentSignature = decryptedParent
            }

            result[0][0].signature = decrypted;



            result[0].push(req.decodedToken.permissions);

            return res.json(result[0]);
        })
        .catch((error) => {
            console.error('Error:', error);
            return res.status(error.status || 500).json({ error: error.message });
        });
});


//PMT Update Submission By Student ID
app.put('/obs-admin/pmt/:studentId', authHelper.verifyToken, authHelper.checkIat, async (req, res, next) => {
    const studentId = req.params.studentId;
    const formStatus = req.body.formStatus;
    // IF NO PERMISSIONS
    if (!req.decodedToken.permissions.includes(2)) {
        return res.redirect('/error?code=403&type=obs-admin')
    }
    return pmtModel
        .updateSubmissionStatus(formStatus, studentId)
        .then((result) => {
            if (!studentId || !formStatus) {
                return res.status(400).json({ error: "Status cannot be empty" });
            }
            if (result.affectedRows === 0) {
                throw new Error("Submission not found");
            }
            return res.json(result);
        })
        .catch((error) => {
            if (isNaN(studentId)) {
                return res.status(400).json({ error: "Invalid student ID" });
            }

            return res.status(error.status || 500).json({ error: error.message });
        });
});

//PMT Retrieve Submission By Student Name Search 
app.get('/obs-admin/pmt/search/:search', authHelper.verifyToken, authHelper.checkIat, (req, res, next) => {
    const searchInput = req.params.search;
    // AUTHORIZATION CHECK - PMT, MST 
    if (req.decodedToken.role != 2 && req.decodedToken.role != 3) {
        return res.redirect('/error?code=403&type=obs-admin')
    }

    return pmtModel
        .retrieveSubmissionBySearch(searchInput)
        .then((result) => {

            if (result[0].length === 0) {
                return res.status(404).json({ error: "No submissions found" });
            }
            result[0].push(req.decodedToken.permissions);
            return res.json(result[0]);
        })
        .catch((error) => {
            return res.status(error.status || 500).json({ error: error.message });
        })
});

app.get('/get-school-filter', authHelper.verifyToken, authHelper.checkIat, (req, res, next) => {
    // AUTHORIZATION CHECK - PMT, MST 
    if (req.decodedToken.role != 2 && req.decodedToken.role != 3) {
        return res.redirect('/error?code=403&type=obs-admin')
    }
    return doctorFormModel
        .getSchoolsFilter()
        .then(data => {
            const schoolLists = data[0];
            data[0].push(req.decodedToken.permissions);
            res.json(schoolLists);
        })
        .catch(err => {
            if (error instanceof EMPTY_RESULT_ERROR) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'Internal server error' });
            }
        });
});

app.get('/getEligibility', authHelper.verifyToken, authHelper.checkIat, (req, res, next) => {
    // AUTHORIZATION CHECK - PMT, MST 
    if (req.decodedToken.role != 2 && req.decodedToken.role != 3) {
        return res.redirect('/error?code=403&type=obs-admin')
    }
    return doctorFormModel
        .getEligibility()
        .then(data => {
            const eligibilityLists = data[0];
            res.json(eligibilityLists)
        })
        .catch(err => {
            if (error instanceof EMPTY_RESULT_ERROR) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'Internal server error' });
            }
        });
});

// PMT Retrieve submissions by filtering (School, Class, Eligibility, CourseDate
app.post('/obs-admin/pmt/filter/', authHelper.verifyToken, authHelper.checkIat, (req, res, next) => {
    // AUTHORIZATION CHECK - PMT, MST 
    if (req.decodedToken.role != 2 && req.decodedToken.role != 3) {
        return res.redirect('/error?code=403&type=obs-admin')
    }
    let school = req.body.school
    let stuClass = req.body.class
    let eligibility = req.body.eligibility
    let courseDate = req.body.courseDate
    let formStatus = req.body.formStatus

    // For each of courseDate, convert to Singapore Time
    if (courseDate) {
        courseDate = courseDate.map((date) => {
            return moment(date).tz("Asia/Singapore").format("YYYY-MM-DD HH:mm:ss")
        })
    }

    const filter = {
        school: school,
        class: stuClass,
        eligibility: eligibility,
        courseDate: courseDate,
        formStatus: formStatus
    }

    // AUTHORIZATION CHECK - PMT, MST

    return pmtModel
        .retrieveSubmissionByFilter(filter)
        .then((result) => {
            if (result.length === 0) {
                throw new Error("No submission found");
            }
            result[0].push(req.decodedToken.permissions);
            return res.json(result[0]);
        })
        .catch((error) => {
            console.log(error);
            return res.status(error.status || 500).json({ error: error.message });
        })
});

// Endpoint for exporting the Excel file
app.get('/export', authHelper.verifyToken, authHelper.checkIat, (req, res) => {
    // AUTHORIZATION CHECK - PMT
    if (req.decodedToken.role !== 2) {
        return res.redirect('/error?code=403&type=obs-admin');
    }

    // IF NO PERMISSIONS
    if (!req.decodedToken.permissions.includes(5)) {
        return res.redirect('/error?code=403&type=obs-admin');
    }

    try {
        // Extract the form data from the request
        const { applicantName, schoolOrg, classNo, courseDate, formStatus, mstReview, docReview } = req.query;
        // Create a new workbook
        const workbook = XLSX.utils.book_new();
        // Create a new worksheet with the form data
        const worksheet = XLSX.utils.json_to_sheet([
            {
                "Name of Applicant": applicantName,
                "Organization/School": schoolOrg,
                "Designation/Class": classNo,
                "Course Date": courseDate,
                "Form Status": formStatus,
                "MST Review": mstReview,
                "Doctor Review": docReview
            },
        ], {
            header: [
                "Name of Applicant",
                "Organization/School",
                "Designation/Class",
                "Course Date",
                "Form Status",
                "MST Review",
                "Doctor Review",
            ],
        });
        // Set the column widths
        const columnWidths = [
            { wch: 30 }, // Name of Applicant (30 characters width)
            { wch: 20 }, // Organization/School (20 characters width)
            { wch: 15 }, // Designation/Class (15 characters width)
            { wch: 15 }, // Course Date (15 characters width)
            { wch: 15 }, // Form Status (15 characters width)
            { wch: 15 }, // MST Review (15 characters width)
            { wch: 15 }, // Doctor Review (15 characters width)
        ];

        // Apply column widths to the worksheet
        worksheet['!cols'] = columnWidths;
        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, "Student Data");

        // Generate the Excel file buffer
        const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        // Set the response headers for downloading the file
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="' + encodeURIComponent(applicantName) + '.xlsx"');

        // Send the Excel file buffer as the response
        res.send(excelBuffer);

        // Log successful export
        console.log('Data successfully exported to Excel:', {
            "Name of Applicant": applicantName,
            "Organization/School": schoolOrg,
            "Designation/Class": classNo,
            "Course Date": courseDate,
            "Form Status": formStatus,
            "MST Review": mstReview,
            "Doctor Review": docReview
        },);

    } catch (error) {
        console.error('Export request failed:', error);
        res.status(400).send('Export request failed');
    }
});
// Endpoint for exporting the Excel file in bulk
app.post('/export-bulk', authHelper.verifyToken, authHelper.checkIat, (req, res) => {
    // AUTHORIZATION CHECK - PMT
    if (req.decodedToken.role !== 2) {
        return res.redirect('/error?code=403&type=obs-admin');
    }

    // IF NO PERMISSIONS
    if (!req.decodedToken.permissions.includes(5)) {
        return res.redirect('/error?code=403&type=obs-admin');
    }

    // Retrieve the bulk data from the request body
    const data = req.body.data;
    const dataArray = JSON.parse(data);
    try {
        console.log('Data successfully exported to Excel:',dataArray)
        console.log('Total rows in dataArray:', dataArray.length);
        if (dataArray.length === 0) {
            const error = new Error('Invalid or empty data array');
            error.status = 400;
            throw error
        }
    } catch (error) {
        console.log('Data parsing error:', error);
        if (error.status === 400) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Invalid data format' });
    }

    // Create a new worksheet with the formatted data
    const worksheet = XLSX.utils.json_to_sheet(dataArray, {
        header: [
            'Name of Applicant',
            'Organization/School',
            'Designation/Class',
            'Course Date',
            'Form Status',
            'MST Review',
            'Doctor Review',
        ],
    });

    // Set the column widths
    const columnWidths = [
        { wch: 30 }, // Name of Applicant (30 characters width)
        { wch: 20 }, // Organization/School (20 characters width)
        { wch: 15 }, // Designation/Class (15 characters width)
        { wch: 15 }, // Course Date (15 characters width)
        { wch: 15 }, // Form Status (15 characters width)
        { wch: 15 }, // MST Review (15 characters width)
        { wch: 15 }, // Doctor Review (15 characters width)
    ];

    // Apply column widths to the worksheet
    worksheet['!cols'] = columnWidths;

    // Create a new workbook and add the worksheet to it
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bulk Data');

    // Generate the Excel file buffer
    const excelBuffer = XLSX.write(workbook, {
        type: 'buffer',
        bookType: 'xlsx',
    });

    // Set the response headers for downloading the file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="exported-Bulk.xlsx"');

    // Send the Excel file buffer as the response
    res.send(excelBuffer);
});


//MST Update Submission Comment
app.put('/obs-admin/mst/review/:studentId', authHelper.verifyToken, authHelper.checkIat, async (req, res, next) => {
    // AUTHORIZATION CHECK - PMT, MST 
    if (req.decodedToken.role != 2 && req.decodedToken.role != 3) {
        return res.redirect('/error?code=403&type=obs-admin')
    }
    // IF NO PERMISSIONS
    if (!req.decodedToken.permissions.includes(7)) {
        return res.redirect('/error?code=403&type=obs-admin')
    }

    const studentId = req.params.studentId;
    const review = req.body.review;

    return mstModel
        .updateSubmissionComment(review, studentId)
        .then((result) => {

            if (review === "") {

                return res.status(204).json({ message: "Your review has been deleted" });
            }

            return res.json(result);
        })
        .catch((error) => {
            if (isNaN(studentId)) {
                return res.status(400).json({ error: "Invalid student ID" });
            }

            return res.status(error.status || 500).json({ error: error.message });
        });
});


/**
 * Obs-form APIs
 */

// Check Doctor Auth
app.get('/obs-form/auth', authHelper.verifyToken, authHelper.checkIat, async (req, res, next) => {
    // AUTHORIZATION CHECK - PMT, MST 
    if (req.decodedToken.role != 4) {
        return res.redirect('/error?code=403');
    }
    return res.sendStatus(200);
});

//upload image to cloudinary
app.post('/uploadSign', authHelper.verifyToken, authHelper.checkIat, (req, res) => {
    if (req.decodedToken.role != 4) {
        return res.redirect('/error?code=403');
    }

    const file = req.body.signature;
    try {

        cloudinary.config({
            cloud_name: process.env.cloudinary_name,
            api_key: process.env.cloudinary_api_key,
            api_secret: process.env.cloudinary_api_secret,
        });

        cloudinary.uploader.upload(file, { resource_type: 'image', format: 'png' }, (err, result) => {
            if (err) {
                console.log(err)
                return res.status(500).json({ message: "Upload failed" });
            }
            return res.json({ url: result.secure_url });
        });
    } catch (error) {
        console.log(error)
    }

});

// upload doctor informtaion
app.post('/postDoctorInfo', authHelper.verifyToken, authHelper.checkIat, (req, res, next) => {
    if (req.decodedToken.role != 4) {
        return res.redirect('/error?code=403');
    }

    const { doctorMCR, physicianName, signatureData, clinicName, clinicAddress, doctorContact } = req.body;
    try {
        // encryption part
        const algorithm = 'aes-256-cbc'; // encryption algorithm
        const key = Buffer.from(process.env.signatureKey); //must be 32 characters
        const iv = Buffer.from(process.env.signatureIV); // the initialization vector(), recommended to create randombytes and store safely crypto.randomBytes(16)
        const cipher = crypto.createCipheriv(algorithm, key, iv);//create cipher iv first,
        let encryptedsignatureInfo = cipher.update(signatureData, 'utf8', 'hex'); //and encrypt the data with it
        encryptedsignatureInfo += cipher.final('hex'); //this is to signal the end of encryption, and to notice the type of data the encryption
        //you cannot cipher.update or cipher.final once you finished encryption using cipher.final. it will throw error

        return doctorFormModel
            .postDoctorInfo(doctorMCR, physicianName, encryptedsignatureInfo, clinicName, clinicAddress, doctorContact)
            .then(data => {
                res.json(data);
            })
            .catch(error => {
                if (error instanceof DUPLICATE_ENTRY_ERROR) {
                    res.status(409).json({ message: error.message });
                }
                else if (error instanceof WRONG_VALUE_FOR_FIELD) {
                    res.status(409).json({ message: error.message });
                }
                else {
                    res.status(500).json({ message: 'Internal server error' });
                }
            })
    } catch (error) {
        // Encryption Error
        console.error('Encryption Error:', error);
        res.status(500).json({ message: 'Encryption Error' });
    }
});

//upload student information
app.post('/postStudentInfo', authHelper.verifyToken, authHelper.checkIat, (req, res, next) => {
    if (req.decodedToken.role != 4) {
        return res.redirect('/error?code=403');
    }
    const { studentName, schoolName, dateOfBirth, studentNRIC, studentClass, dateOfVaccine } = req.body;
    console.log(req.body);
    return doctorFormModel
        .postStudentInfo(studentNRIC, studentName, dateOfBirth, studentClass, schoolName, dateOfVaccine)
        .then(data => {
            res.json(data);
        })
        .catch(error => {
            if (error instanceof DUPLICATE_ENTRY_ERROR) {
                res.status(409).json({ message: error.message });
            }
            else if (error instanceof WRONG_VALUE_FOR_FIELD) {
                res.status(409).json({ message: error.message });
            }
            else {
                res.status(500).json({ message: 'Internal server error' });
            }
        });
});

//upload form information
app.post('/postFormInfo', authHelper.verifyToken, authHelper.checkIat, (req, res, next) => {
    if (req.decodedToken.role != 4) {
        return res.redirect('/error?code=403');
    }

    const { studentId, courseDate, doctorMCR, eligibility, comments, date } = req.body;
    return doctorFormModel
        .postFormInfo(studentId, courseDate, doctorMCR, eligibility, comments, date)
        .then(data => {
            res.json(data);
        })
        .catch(error => {
            if (error instanceof DUPLICATE_ENTRY_ERROR) {
                res.status(409).json({ message: error.message });
            }
            else if (error instanceof WRONG_VALUE_FOR_FIELD) {
                res.status(409).json({ message: error.message });
            }
            else {
                res.status(500).json({ message: 'Internal server error' });
            }
        });
});

// check doctor mcr
app.post('/checkDoctorMCR', authHelper.verifyToken, authHelper.checkIat, (req, res, next) => {
    if (req.decodedToken.role != 4) {
        return res.redirect('/error?code=403');
    }

    //retrieve doctorMCR here...
    const { doctorMCR } = req.body;
    //continue to database...
    return doctorFormModel
        .matchDoctorInfo(doctorMCR)
        .then(data => {
            const encryptedSignInfo = data[0].signature
            const key = Buffer.from(process.env.signatureKey); //must be 32 characters
            const iv = Buffer.from(process.env.signatureIV); //must be 16 characters
            try {
                // Create the decipher object
                const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
                let decrypted = decipher.update(encryptedSignInfo, 'hex', 'utf8');
                decrypted += decipher.final('utf8');

                data[0].signature = decrypted;
                res.json(data);
            } catch (error) {
                // Decrypt Error
                console.error('Decryption Error:', error);
                res.status(500).json({ message: 'Decryption Error' });
            }
        })
        .catch(err => {
            if (err instanceof UserNotFoundError) {
                // user is not found
                res.status(404).json({ message: 'DoctorNotFound' });
            } else {
                // unknown internal error(system failure)
                res.status(500).json({ message: 'Unknown error occurred.' });
            }
        });
});

app.put('/updateFormStatus', authHelper.verifyToken, authHelper.checkIat, (req, res, next) => {
    if (req.decodedToken.role != 4) {
        return res.redirect('/error?code=403');
    }

    const studentId = req.query.studentId;
    //continue to database...
    return doctorFormModel
        .updateFormStatus(studentId)
        .then(data => {
            res.json(data);
        })
        .catch(error => {
            console.error(error);
            if (error instanceof DUPLICATE_ENTRY_ERROR) {
                res.status(409).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'Internal server error' });
            }
        });
});

// get classes
app.get('/getClasses', authHelper.verifyToken, authHelper.checkIat, (req, res, next) => {
    // AUTHORIZATION CHECK - PMT, MST 
    if (req.decodedToken.role != 2 && req.decodedToken.role != 3) {
        return res.redirect('/error?code=403')
    }
    return doctorFormModel
        .getClasses()
        .then(data => {
            const classLists = data[0];
            res.json(classLists);
        })
        .catch(err => {
            res.status(500).json({ message: 'Internal server error' });
        })
});

// get course dates
app.get('/getCourseDates', authHelper.verifyToken, authHelper.checkIat, (req, res, next) => {
    // AUTHORIZATION CHECK - PMT, MST 
    if (req.decodedToken.role != 2 && req.decodedToken.role != 3) {
        return res.redirect('/error?code=403')
    }
    return doctorFormModel
        .getCourseDates()
        .then(data => {
            const courseDateLists = data[0];
            res.json(courseDateLists)
        })
        .catch(err => {
            if (err instanceof EMPTY_RESULT_ERROR) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'Internal server error' });
            }
        });
});

app.get('/getSchools', (req, res, next) => {
    return doctorFormModel
        .getSchools()
        .then(data => {
            const courseDateLists = data[0];
            res.json(courseDateLists)
        })
        .catch(err => {
            if (err instanceof EMPTY_RESULT_ERROR) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'Internal server error' });
            }
        });
});

// check student NRIC
app.post('/checkStudentNRIC', authHelper.verifyToken, authHelper.checkIat, (req, res, next) => {

    if (req.decodedToken.role != 4) {
        return res.redirect('/error?code=403');
    }
    //retrieve doctorMCR here...
    const { studentNRIC } = req.body;
    //continue to database...
    return doctorFormModel
        .getStudentFormStatus(studentNRIC)
        .then(data => {
            console.log(data);
            res.json(data);
        })
        .catch(err => {
            console.error(err);
            if (err instanceof EMPTY_RESULT_ERROR) {
                // user is not found
                res.status(404).json({ message: 'Student Not Found' });
            } else {
                // unknown internal error(system failure)
                res.status(500).json({ message: 'Internal Server Error' });
            }
        });
});

// delete duplicated student
app.delete('/deleteStudentForm', authHelper.verifyToken, authHelper.checkIat, (req, res, next) => {
    if (req.decodedToken.role != 4) {
        return res.redirect('/error?code=403');
    }
    const { studentId } = req.body;
    const { formStatus } = req.body;

    return doctorFormModel
        .deleteStudentForm(studentId, formStatus)
        .then((result) => {
            console.log(result)
            if (!result) {
                const error = new Error("Unable to delete students and forms")
                error.status = 500;
                throw error;
            }
            return res.sendStatus(200);
        })
        .catch((error) => {
            return res.status(error.status || 500).json({ error: error.message });
        });
});
/**
 * Registration Form
 */
//Submit Registration Form
app.post('/obs-reg-form/submit', (req, res, next) => {
    const formData = req.body;
    // console.log(formData.raceId)
    return regFormModel
        .submitRegForm(formData) // Assuming the function in regFormModel is named submitRegForm
        .then((result) => {
            return res.status(200).json({ message: 'Form submission successful!', data: result });
        })
        .catch((error) => {
            console.error('Error submitting form:', error);
            if (error.status === 401) {
                return res.status(401).json({ error: 'Unauthorized' }); 
            } else if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ error: 'Duplicate entry in the database' });
            } else {
                // For other unhandled errors, send a generic error message
                return res.status(500).json({ error: 'Internal server error' });
            }
        });
});

/**
 * Error handling
 */

app.use((error, req, res, next) => {
    let url = new URL(req.headers.referer)
    let urlParams = url.searchParams.toString();

    if (error) {
        if (req.headers.referer.includes('obs-admin')) {
            return res.redirect(`/error?code=${error.status || 500}&type=obs-admin`)
        } else if (req.headers.referer.includes('acknowledgement')) {
            return res.redirect(`/error?code=${error.status || 500}&type=acknowledgement&${urlParams}`)
        } else {
            return res.redirect(`/error?code=${error.status || 500}`)
        }
    }
});

app.get('*', (req, res) => {
    return res.redirect('/error?code=404')
})

module.exports = app;