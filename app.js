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

const verifyUser = require('./auth/userAuth')
const userModel = require('./model/user')
const parentModel = require('./model/parent')
const formModel = require('./model/form')
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

// Create Account
app.post('obs-admin/newuser', (req, res, next) => {

});

// Get All Permission Groups or by Search
app.get('/obs-admin/permission/groups/:search', authHelper.verifyToken, authHelper.checkIat, (req, res, next) => {

    // AUTHORIZATION CHECK - ADMIN
    if (req.decodedToken.role != 1) {
        return res.redirect('/error?code=403')
    }

    let searchInput = ""
    if (req.params.search != -1) {
        searchInput = req.params.search
    }

    return adminModel
        .getPermissionGroups(searchInput)
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
        return res.redirect('/error?code=403')
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
        return res.redirect('/error?code=403')
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
        return res.redirect('/error?code=403')
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
        return res.redirect('/error?code=403')
    }

    const permGroup = {
        permGroupId: req.body.groupId,
        permGroupName: req.body.groupName,
        permissions: req.body.permsId
    }

    if (!permGroup.permissions.includes('1')) {
        permGroup.permissions.push('1')
    }

    if (!permGroup.permGroupName || permGroup.permissions.length == 0) {
        const error = new Error("Empty or invalid information");
        error.status = 400;
        throw error;
    }

    return adminModel
        .editPermGroup(permGroup)
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
        return res.redirect('/error?code=403')
    }

    const groupId = req.params.groupId
    if (!groupId) {
        const error = new Error("Empty groupId")
        error.status = 400;
        throw error;
    }

    return adminModel
        .deletePermissionGroup(groupId)
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


//////////////////////////////////////////////////////
// Feature: PMT Retrieve All Submissions
// http://localhost:3000/api/pmt/all
// Method: GET
//////////////////////////////////////////////////////
app.get('/api/pmt/all', /*verifyUser,*/ async (req, res, next) => {
    return pmtModel
        .retrieveAllSubmissions()
        .then((result) => {
            if (result.length === 0) {
                throw new Error("No submissions found");
            }
            return res.json( result[0] );
        })
        .catch((error) => {
            return res.status(error.status || 500).json({ error: error.message });
        });
});

app.get('/api/pmt/:nameOfStudent', /*verifyUser,*/ async (req, res, next) => {
    const nameOfStudent = req.params.nameOfStudent;
    return pmtModel
        .retrieveSubmission(nameOfStudent)
        .then((result) => {
            if (result.length === 0) {
                throw new Error(nameOfStudent + "'s submission not found");
            }
            return res.json(result[0]);
        })
        .catch((error) => {
            return res.status(error.status || 500).json({ error: error.message });
        });
});

app.put('/api/pmt/:studentId', /*verifyUser,*/ async (req, res, next) => {
    const studentId = req.params.studentId;
    const formStatus = req.body.formStatus;
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


/**
 * User: Parents
 */

// ! Make sure parents are unable to login if already acknowledged.
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
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    const studentID = decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');

    if (!studentID || !password) {
        return res.status(400).json({ error: 'Invalid URL or password' });
    }

    return userModel
        .parentLogin(studentID)
        .then((result) => {
            // Convert dateofbirth to DD/MM/YYYY (Singapore format)
            result.dateOfBirth = new Date(result.dateOfBirth).toLocaleDateString('en-SG');
            // Remove / from dateofbirth
            result.dateOfBirth = result.dateOfBirth.replace(/\//g, '');
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

    // Update parent's acknowledgement
    app.put('/parent/acknowledge', (req, res, next) => {

        // Decrypt studentID
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        const studentID = decipher.update(req.body.encrypted, 'hex', 'utf8') + decipher.final('utf8');

        const data = {
            studentID: studentID,
            parentNRIC: req.body.parentNRIC,
            nameOfParent: req.body.nameOfParent,
            parentSignature: req.body.parentSignature,
            dateOfAcknowledgement: req.body.dateOfAcknowledgement,
        };
        // TODO ERROR HANDLING
        return parentModel.updateAcknowledgement(data)
            .then((result) => {
                return res.json({ user: result });
            }
        ).catch((error) => {
            console.log(error)
            return res.status(error.status || 500).json({ error: error.message });
        })
    })

/**
 * Form Routes
 */

// Retrieve form details for parent acknowledgement- Used by Barry (for identification for merging)
app.get('/form/:encrypted', (req, res, next) => {
    const encrypted = req.params.encrypted;

    // Decrypt studentID
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    const studentID = decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');

    return formModel
        .getFormDetails(studentID)
        .then((result) => {
            return res.json({ form: result });
        })
        .catch((error) => {
            // TODO ERROR HANDLING
            console.log(error)
            return res.status(error.status || 500).json({ error: error.message });
        })
});

/**
 * Error handling
 */

app.use((error, req, res, next) => {
    if (error) {
        return res.redirect(`/error?code=${error.status || 500}`)
    }
});

app.get('*', (req, res) => {
    return res.redirect('/error?code=404')
})
module.exports = app;