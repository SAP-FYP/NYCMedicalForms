const express = require("express");
const cookieParser = require('cookie-parser');
const moment = require('moment');
const bodyParser = require('body-parser');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const elasticEmail = require('elasticemail');
const multer = require('multer');
const cloudinary = require("cloudinary").v2;
const {
    UserNotFoundError
} = require("./errors");
const crypto = require('crypto');
const key = Buffer.from(process.env.encryptKey, 'hex');
const iv = Buffer.from(process.env.encryptIV, 'hex');

const authHelper = require('./auth/userAuth')
const userModel = require('./model/user')
const doctorFormModel = require('./model/doctorForm');
const parentModel = require('./model/parent')
const formModel = require('./model/form')
const adminModel = require('./model/admin')
const pmtModel = require('./model/pmt')
const mstModel = require('./model/mst')


const app = express();
const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.SECRETKEY;

const twilioClient = require('twilio')(process.env.twilioSID, process.env.twilioToken);

const elasticEmailClient = elasticEmail.createClient({ apiKey: process.env.elasticAPIKey});

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
                } else if (payload.role == 2 || payload.role == 4) {
                    return res.redirect('/obs-admin/obs-management')
                } else if (payload.role == 3) {
                    return res.redirect('/obs-form')
                } else {
                    const error = new Error("Invalid user role");
                    error.status = 500;
                    throw error;
                }
            })
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
        const error = new Error("Empty user");
        error.status = 404;
        throw error;
    }

    delete user.iat;
    delete user.exp;
    delete user.permissionGroup;

    return res.send({ user });
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


// Setting parent's acknowledgement
app.post('/post-acknowledge', (req, res) => {
    const parentEmail = req.body.parentEntry.parentEmail;
    const studentId = req.body.parentEntry.studentId;
    const parentContact = req.body.parentEntry.parentContact;

    const data = {
        parentEmail: parentEmail,
        studentId: studentId,
        parentContact: parentContact
    }

    return parentModel
        .setParentsAcknowledgement(data)
        .then((result) => {
            return res.status(200).send({ 'message': 'Parent Acknowledgement Successful' });
        }
        )
        .catch((error) => {
            console.log(error)
            return res.status(error.status || 500).json({ error: error.message });
        }
        )

})
    
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
            console.log(message.sid)
            return res.status(200).send({ 'message': 'SMS sent successfully' });
        })
        // TODO NEED TO DO ERROR HANDLING FOR INCORRECT PHONE NUMBER)
        .catch((error) => {
            console.log(error)
            return res.status(error.status || 500).json({ error: error.message });
        })
})

// Email test
app.post('/send-email', (req, res) => {
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
        body: `<p>Dear Parents,
        We hope this email finds you and your family in good health and high spirits. As part of our ongoing commitment to provide the best care for your children, we would like to inform you about some important updates regarding their medical conditions. <br> <br>
        At our recent healthcare evaluation, we have made significant progress in understanding and managing your child's medical condition. To ensure that our records are up to date, we kindly request your cooperation in acknowledging the new changes in your child's medical condition by clicking on the following link: spmeet.onrender.com/acknowledge/?encrypted=${encryptedStudentId}<br> <br>
        By clicking on the link, you will confirm that you have received and reviewed the updates related to your child's health. Your acknowledgment will help us ensure that our information is accurate and that we can continue to provide the highest quality of care. <br> <br>
        Rest assured that all the information you provide will remain strictly confidential and will only be used for healthcare purposes. We adhere to the highest standards of privacy and data protection, in compliance with applicable laws and regulations. <br> <br>
        If you have any questions or require further assistance, please do not hesitate to reach out to our dedicated support team at nyc_enquiries@nyc.gov.sg. We are here to address any concerns you may have and guide you through the process. <br> <br>
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

/**
 * User: Super Admin
 */

// Create Account
app.post('/obs-admin/newuser', authHelper.verifyToken, authHelper.checkIat, (req, res, next) => {

    // AUTHORIZATION CHECK - ADMIN
    if (req.decodedToken.role != 1) {
        return res.redirect('/error?code=403')
    }

    const newuser = {
        name: req.body.name,
        email: req.body.email,
        contact: req.body.contact,
        password: req.body.password,
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
        newuser.created_at = moment.tz('Asia/Singapore').format('YYYY-MM-DD HH:mm:ss')
        newuser.passwordUpdated = moment.tz('Asia/Singapore').format('YYYY-MM-DD HH:mm:ss')

        return adminModel
            .createUser(newuser)
            .then((result) => {
                if (!result) {
                    const error = new Error("Unable to create account")
                    error.status = 500;
                    throw error;
                }
                return res.sendStatus(201);
            })
            .catch((error) => {
                if (error.code == "ER_DUP_ENTRY") {
                    return res.status(422).json({ error: "Email or contact already exists" });
                }
                return res.status(error.status || 500).json({ error: error.message });
            })
    })

});

// Get All Users
app.get('/obs-admin/users/:search', authHelper.verifyToken, authHelper.checkIat, (req, res, next) => {

    // AUTHORIZATION CHECK - ADMIN
    if (req.decodedToken.role != 1) {
        return res.redirect('/error?code=403')
    }

    let searchInput = ""
    if (req.params.search != -1) {
        searchInput = req.params.search
    }

    return adminModel
        .getAllUsers(req.decodedToken.email, searchInput)
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

// Update User
app.put('/obs-admin/user', authHelper.verifyToken, authHelper.checkIat, (req, res, next) => {

    // AUTHORIZATION CHECK - ADMIN
    if (req.decodedToken.role != 1) {
        return res.redirect('/error?code=403')
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
        return res.redirect('/error?code=403')
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

// Disable Account
app.put('/obs-admin/disable/user/:email/:status', authHelper.verifyToken, authHelper.checkIat, (req, res, next) => {

    // AUTHORIZATION CHECK - ADMIN
    if (req.decodedToken.role != 1) {
        return res.redirect('/error?code=403')
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


/**
 * Admin: Partnership Management Team (PMT)
 */

//PMT Retrieve All Submissions
app.get('/obs-admin/pmt/all', authHelper.verifyToken, authHelper.checkIat, async (req, res, next) => {
     // IF NO PERMISSIONS
     if (!req.decodedToken.permissions.includes(1)) {
        return res.redirect('/error?code=403')
    }

    // AUTHORIZATION CHECK - PMT, MST 
    if (req.decodedToken.role != 2 && req.decodedToken.role != 4) {
        return res.redirect('/error?code=403')
    }
    return pmtModel
        .retrieveAllSubmissions()
        .then((result) => {
            if (result.length === 0) {
                throw new Error("No submissions found");
            }
            return res.json(result[0]);
        })
        .catch((error) => {
            return res.status(error.status || 500).json({ error: error.message });
        });
});

//PMT Retrieve Submission By Student Name
app.get('/obs-admin/pmt/:nameOfStudent', authHelper.verifyToken, authHelper.checkIat, async (req, res, next) => {
    const nameOfStudent = req.params.nameOfStudent;
     // IF NO PERMISSIONS
     if (!req.decodedToken.permissions.includes(1)) {
        return res.redirect('/error?code=403')
    }
    // AUTHORIZATION CHECK - PMT, MST 
    if (req.decodedToken.role != 2 && req.decodedToken.role != 4) {
        return res.redirect('/error?code=403')
    }
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

//PMT Update Submission By Student ID
app.put('/obs-admin/pmt/:studentId', authHelper.verifyToken, authHelper.checkIat, async (req, res, next) => {
    const studentId = req.params.studentId;
    const formStatus = req.body.formStatus;
    // IF NO PERMISSIONS
    if (!req.decodedToken.permissions.includes(2)) {
        return res.redirect('/error?code=403')
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
    if (req.decodedToken.role != 2 && req.decodedToken.role != 4) {
        return res.redirect('/error?code=403')
    }

    // let searchInput = ""
    // if (req.params.search != -1) {
    //     searchInput = req.params.search
    // }

    return pmtModel
        .retrieveSubmissionBySearch(searchInput)
        .then((result) => {
            if (result.length === 0) {
                throw new Error("No submission found");
            }
            return res.json(result[0]);
        })
        .catch((error) => {
            return res.status(error.status || 500).json({ error: error.message });
        })
});

//PMT Retrieve Submission By Filtering by school
app.get('/obs-admin/pmt/filter/school/:filter', authHelper.verifyToken, authHelper.checkIat, (req, res, next) => {
    const filter = req.params.filter;
    // AUTHORIZATION CHECK - PMT, MST 
    if (req.decodedToken.role != 2 && req.decodedToken.role != 4) {
        return res.redirect('/error?code=403')
    }

    return pmtModel
        .retrieveSubmissionBySchoolName(filter)
        .then((result) => {
            if (result.length === 0) {
                throw new Error("No submission found");
            }
            return res.json(result[0]);
        })
        .catch((error) => {
            return res.status(error.status || 500).json({ error: error.message });
        })
});

//PMT Retrieve Submission By Filtering by class
app.get('/obs-admin/pmt/filter/class/:filter', authHelper.verifyToken, authHelper.checkIat, (req, res, next) => {
    const filter = req.params.filter;
    // AUTHORIZATION CHECK - PMT, MST 
    if (req.decodedToken.role != 2 && req.decodedToken.role != 4) {
        return res.redirect('/error?code=403')
    }

    return pmtModel
        .retrieveSubmissionByClassName(filter)
        .then((result) => {
            if (result.length === 0) {
                throw new Error("No submission found");
            }
            return res.json(result[0]);
        })
        .catch((error) => {
            return res.status(error.status || 500).json({ error: error.message });
        })
});

//PMT Retrieve Submission By Filtering by class
app.get('/obs-admin/pmt/filter/courseDate/:filter', authHelper.verifyToken, authHelper.checkIat, (req, res, next) => {
    const filter = req.params.filter;
    // AUTHORIZATION CHECK - PMT, MST 
    if (req.decodedToken.role != 2 && req.decodedToken.role != 4) {
        return res.redirect('/error?code=403')
    }

    return pmtModel
        .retrieveSubmissionByCourseDate(filter)
        .then((result) => {
            if (result.length === 0) {
                throw new Error("No submission found");
            }
            return res.json(result[0]);
        })
        .catch((error) => {
            return res.status(error.status || 500).json({ error: error.message });
        })
});

//PMT Retrieve Submission By Filtering by class
app.get('/obs-admin/pmt/filter/eligibility/:filter', authHelper.verifyToken, authHelper.checkIat, (req, res, next) => {
    const filter = req.params.filter;
    
    // AUTHORIZATION CHECK - PMT, MST 
    if (req.decodedToken.role != 2 && req.decodedToken.role != 4) {
        return res.redirect('/error?code=403')
    }
    
    const [eligibility1, eligibility2] = filter.split(',');
  
    return pmtModel
      .retrieveSubmissionByEligibility(eligibility1, eligibility2)
      .then((result) => {
        if (result.length === 0) {
          throw new Error("No submission found");
        }
        return res.json(result[0]);
      })
      .catch((error) => {
        return res.status(error.status || 500).json({ error: error.message });
      });
  });

const XLSX = require('xlsx');


// Endpoint for exporting the Excel file
app.get('/export', authHelper.verifyToken, authHelper.checkIat, (req, res) => {
   // IF NO PERMISSIONS
   if (!req.decodedToken.permissions.includes(5)) {
    return res.redirect('/error?code=403')
}
 // AUTHORIZATION CHECK - PMT
 if (req.decodedToken.role != 2) {
    return res.redirect('/error?code=403')
}
  // Extract the form data from the request
  const { applicantName, schoolOrg, classNo, courseDate, formStatus } = req.query;
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
    },
  ], {
    header: [
      "Name of Applicant",
      "Organization/School",
      "Designation/Class",
      "Course Date",
      "Form Status",
    ],
  });
  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Student Data");

  // Generate the Excel file buffer
  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  // Set the response headers for downloading the file
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="' + encodeURIComponent(applicantName) + '.xlsx"');

  // Send the Excel file buffer as the response
  res.send(excelBuffer);
});

// Endpoint for exporting the Excel file in bulk
app.get('/export-bulk', authHelper.verifyToken, authHelper.checkIat, (req, res) => {
    // IF NO PERMISSIONS
    if (!req.decodedToken.permissions.includes(5)) {
        return res.redirect('/error?code=403')
    }
     // AUTHORIZATION CHECK - PMT
 if (req.decodedToken.role != 2) {
    return res.redirect('/error?code=403')
}
    // Retrieve the bulk data from the request or pass it as a parameter
    const data = req.query.data;

    const dataArray = JSON.parse(data);
    
    // Create a new worksheet with the formatted data
    const worksheet = XLSX.utils.json_to_sheet(dataArray, {
      header: [
        "Name of Applicant",
        "Organization/School",
        "Designation/Class",
        "Course Date",
        "Form Status",
      ],
    });
  
    // Create a new workbook and add the worksheet to it
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bulk Data");
  
    // Generate the Excel file buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  
    // Set the response headers for downloading the file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="exported-Bulk.xlsx"');

  
    // Send the Excel file buffer as the response
    res.send(excelBuffer);
  });
  
  app.put('/obs-admin/mst/review/:studentId', authHelper.verifyToken, authHelper.checkIat, async (req, res, next) => {
    // IF NO PERMISSIONS
    if (!req.decodedToken.permissions.includes(7)) {
        return res.redirect('/error?code=403')
    }
     // AUTHORIZATION CHECK - PMT, MST 
     if (req.decodedToken.role != 2 && req.decodedToken.role != 4) {
        return res.redirect('/error?code=403')
    }
    const studentId = req.params.studentId;
    const review = req.body.review;
    
    return mstModel
        .updateSubmissionReview(review, studentId)
        .then((result) => {
            if (!studentId || !review) {
                return res.status(400).json({ error: "Review cannot be empty" });
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

/**
 * HAJIN 
 */

cloudinary.config({
    cloud_name: "sp-esde-2100030",
    api_key: "189815745826899",
    api_secret: "eAKSNgdEoKxTWu8kh__hUi3U7J0",
});

//upload image to cloudinary
app.post('/uploadSign', (req, res) => {
    const file = req.body.signature;
    //console.log(file)
    cloudinary.uploader.upload(file, { resource_type: 'image', format: 'png' }, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Upload failed" });
        }
        return res.json({ url: result.secure_url });
    });
});

// upload doctor informtaion
app.post('/postDoctorInfo', (req, res, next) => {
    const { doctorMCR, physicianName, signatureData, clinicName, clinicAddress, contactNo } = req.body;
    try {
        // encryption part
        const algorithm = 'aes-256-cbc'; // encryption algorithm
        const key = Buffer.from('qW3eRt5yUiOpAsDfqW3eRt5yUiOpAsDf'); //must be 32 characters
        const iv = Buffer.from('qW3eRt5yUiOpAsDf'); // the initialization vector(), recommended to create randombytes and store safely crypto.randomBytes(16)

        const cipher = crypto.createCipheriv(algorithm, key, iv);//create cipher iv first,
        let encryptedsignatureInfo = cipher.update(signatureData, 'utf8', 'hex'); //and encrypt the data with it
        encryptedsignatureInfo += cipher.final('hex'); //this is to signal the end of encryption, and to notice the type of data the encryption
        //you cannot cipher.update or cipher.final once you finished encryption using cipher.final. it will throw error

        return doctorFormModel
            .postDoctorInfo(doctorMCR, physicianName, encryptedsignatureInfo, clinicName, clinicAddress, contactNo)
            .then(data => {
                console.log(data)
                res.json(data);
            })
            .catch(error => {
                if (error instanceof DUPLICATE_ENTRY_ERROR) {
                    res.status(409).json({ message: error.message });
                } else {
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
app.post('/postStudentInfo', (req, res, next) => {
    const { studentName, schoolName, dateOfBirth, studentNRIC, studentClass, dateOfVaccine } = req.body;
    return doctorFormModel
        .postStudentInfo(studentNRIC, studentName, dateOfBirth, studentClass, schoolName, dateOfVaccine)
        .then(data => {
            console.log(data)
            res.json(data);
        })
        .catch(error => {
            if (error instanceof DUPLICATE_ENTRY_ERROR) {
                res.status(409).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'Internal server error' });
            }
        });
});

//upload form information
app.post('/postFormInfo', (req, res, next) => {
    const { studentId, courseDate, doctorMCR, eligibility, comments, date } = req.body;
    return doctorFormModel
        .postFormInfo(studentId, courseDate, doctorMCR, eligibility, comments, date)
        .then(data => {
            console.log(data)
            res.json(data);
        })
        .catch(error => {
            if (error instanceof DUPLICATE_ENTRY_ERROR) {
                res.status(409).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'Internal server error' });
            }
        });
});

// check doctor mcr
app.post('/checkDoctorMCR', (req, res, next) => {
    //retrieve doctorMCR here...
    const { doctorMCR } = req.body;
    //continue to database...
    return doctorFormModel
        .matchDoctorInfo(doctorMCR)
        .then(data => {
            const encryptedSignInfo = data[0].signature
            const key = Buffer.from('qW3eRt5yUiOpAsDfqW3eRt5yUiOpAsDf'); //must be 32 characters
            const iv = Buffer.from('qW3eRt5yUiOpAsDf'); //must be 16 characters
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
            console.error(err);
            if (err instanceof UserNotFoundError) {
                // user is not found
                res.status(404).json({ message: 'DoctorNotFound' });
            } else {
                // unknown internal error(system failure)
                res.status(500).json({ message: 'Unknown error occurred.' });
            }
        });
});

// get classes
app.get('/getClasses', (req, res, next) => {
    const limit = parseInt(req.query.limit);
    const offset = parseInt(req.query.offset);
    const search = req.query.search || '';
    console.log(search)
    return doctorFormModel
        .getClasses(limit, offset, search)
        .then(data => {
            const classLists = data[0];
            console.log(classLists)
            res.json(classLists);
        })
        .catch(err => {
            if (error instanceof EMPTY_RESULT_ERROR) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'Internal server error' });
            }
        });
});

// get schools
app.get('/getSchools', (req, res, next) => {
    const limit = parseInt(req.query.limit);
    const offset = parseInt(req.query.offset);
    const search = req.query.search || '';

    return doctorFormModel
        .getSchools(limit, offset, search)
        .then(data => {
            const schoolLists = data[0];
            console.log(schoolLists)
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

// get course dates
app.get('/getCourseDates', (req, res, next) => {
    const limit = parseInt(req.query.limit);
    const offset = parseInt(req.query.offset);
    const search = req.query.search || '';

    return doctorFormModel
        .getCourseDates(limit, offset, search)
        .then(data => {
            const courseDateLists = data[0];
            res.json(courseDateLists)
        })
        .catch(err => {
            if (error instanceof EMPTY_RESULT_ERROR) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'Internal server error' });
            }
        });
});

// get eligibility
app.get('/getEligibility', (req, res, next) => {
    const limit = parseInt(req.query.limit);
    const offset = parseInt(req.query.offset);

    return doctorFormModel
        .getEligibility(limit, offset)
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