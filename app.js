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

const {
  UserNotFoundError
} = require("./errors");

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

// upload doctor informtaion
app.post('/postDoctorInfo',(req,res,next) => {
  const{doctorMCR, physicianName,signatureData,clinicName,clinicAddress,contactNo} = req.body;
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
    .postDoctorInfo(doctorMCR, physicianName,encryptedsignatureInfo,clinicName,clinicAddress,contactNo)
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
  }catch (error) {
    // Encryption Error
    console.error('Encryption Error:', error);
    res.status(500).json({ message: 'Encryption Error' });
  }
});

//upload student information
app.post('/postStudentInfo',(req,res,next) => {
  const{studentName, schoolName,dateOfBirth,studentNRIC,studentClass,dateOfVaccine} = req.body;
  return doctorFormModel
  .postStudentInfo(studentNRIC,studentName,dateOfBirth,studentClass,schoolName,dateOfVaccine)
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
app.post('/postFormInfo',(req,res,next) => {
  const{studentId, courseDate,doctorMCR,eligibility,comments,date} = req.body;
  return doctorFormModel
  .postFormInfo(studentId, courseDate,doctorMCR,eligibility,comments,date)
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
        res.status(404).json({ message: err.message });
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
  const search =req.query.search || '';
  console.log(search)
  return doctorFormModel
    .getClasses(limit,offset,search)
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
  const search =req.query.search || '';
  
  return doctorFormModel
    .getSchools(limit,offset,search)
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
  const search =req.query.search || '';

  return doctorFormModel
    .getCourseDates(limit,offset,search)
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

app.get('/jwt', (req, res, next) => {
  const jwt = req.cookies.jwt;
  return res.send(jwt);
})

module.exports = app;