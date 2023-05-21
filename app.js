const express = require("express");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt = require("jsonwebtoken");
const multer = require('multer');
const cloudinary = require("cloudinary").v2;
const crypto = require('crypto');

const verifyUser = require('./auth/userAuth')
const userModel = require('./model/user')
const doctorFormModel = require('./model/doctorForm');
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

/**
 * HAJIN
 * 
 */

cloudinary.config({
    cloud_name: "sp-esde-2100030",
    api_key: "189815745826899",
    api_secret: "eAKSNgdEoKxTWu8kh__hUi3U7J0",
});
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname)
    }
  });
  
  const upload = multer({ storage });
  
  //upload image to cloudinary
  app.post('/uploadSign', upload.single('signature'), (req, res) => {
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
  
  //upload encrypted info on database
  app.post('/postSignInfo', async function(req, res) {
    const {
      applicantName,
      schoolOrg,
      personalId,
      designation,
      courseDate,
      tetanusVaccine,
      fitStatus,
      medicalText,
      mcrNo,
      clinicName,
      date,
      contactNo,
      clinicAddress,
      userName,
      signatureInfo
    } = req.body;
  
    console.log(userName + "   " + signatureInfo)
    const algorithm = 'aes-256-cbc'; // encryption algorithm
    const key = Buffer.from('qW3eRt5yUiOpAsDfqW3eRt5yUiOpAsDf'); //must be 32 characters
    const iv = Buffer.from('qW3eRt5yUiOpAsDf'); // the initialization vector(), recommended to create randombytes and store safely crypto.randomBytes(16)
  
    const cipher = crypto.createCipheriv(algorithm, key, iv);//create cipher iv first,
    let encryptedsignatureInfo = cipher.update(signatureInfo, 'utf8', 'hex'); //and encrypt the data with it
    encryptedsignatureInfo += cipher.final('hex'); //this is to signal the end of encryption, and to notice the type of data the encryption
    //you cannot cipher.update or cipher.final once you finished encryption using cipher.final. it will throw error
  
    return doctorFormModel
      .postSignatureInfo(
        applicantName,
        schoolOrg,
        personalId,
        designation,
        courseDate,
        tetanusVaccine,
        fitStatus,
        medicalText,
        mcrNo,
        clinicName,
        date,
        contactNo,
        clinicAddress,
        userName,
        encryptedsignatureInfo
      )
      .then(function () {
        return res.sendStatus(201);
      })
      .catch(function (error) {
        return res.status(500).json({ message: "Unknown error" });
      });
  });
  
app.get('/jwt', (req, res, next) => {
    const jwt = req.cookies.jwt;
    return res.send(jwt);
})

module.exports = app;