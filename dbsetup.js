const { query } = require('./database'); // Import from db.js

//////////////////////////////////////////////////////
// CREATE TABLES
//////////////////////////////////////////////////////
const CREATE_TABLE_SQL = `
    CREATE TABLE IF NOT EXISTS user (
    email VARCHAR(255) NOT NULL,
    nameOfUser VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    contactNo INT NOT NULL,
    groupID VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL,
    PRIMARY KEY (email)
    );

    CREATE TABLE IF NOT EXISTS \`group\` (
    groupID INT NOT NULL,
    groupName VARCHAR(255) NOT NULL,
    PRIMARY KEY (groupID)
    );

    CREATE TABLE IF NOT EXISTS groupPerm (
    groupID INT NOT NULL,
    permsID INT NOT NULL,
    PRIMARY KEY (groupID, permsID)
    );

    CREATE TABLE IF NOT EXISTS permission (
    permsID INT NOT NULL,
    permsName VARCHAR(255) NOT NULL,
    permsDescription VARCHAR(255) NOT NULL,
    PRIMARY KEY (permsID)
    );

    CREATE TABLE IF NOT EXISTS doctor (
    doctorMCR VARCHAR(255) NOT NULL,
    nameOfDoctor VARCHAR(255) NOT NULL,
    signature BLOB NOT NULL,
    nameOfClinic VARCHAR(255) NOT NULL,
    clinicAddress VARCHAR(255) NOT NULL,
    contactNo INT NOT NULL,
    PRIMARY KEY (doctorMCR)
    );

    CREATE TABLE IF NOT EXISTS student (
    studentNRIC VARCHAR(9) NOT NULL,
    nameOfStudent VARCHAR(255) NOT NULL,
    class VARCHAR(255) NOT NULL,  
    school VARCHAR(255) NOT NULL,
    dateOfVaccination VARCHAR(255) NOT NULL,
    PRIMARY KEY (studentNRIC)  
    );

    CREATE TABLE IF NOT EXISTS parentAcknowledgement (
    studentNRIC VARCHAR(9) NOT NULL,
    parentNRIC VARCHAR(9) NOT NULL,
    nameOfParent VARCHAR(255) NOT NULL,
    parentSignature BLOB NOT NULL,
    dateOfAcknowledgement DATE NOT NULL,
    parentContactNo INT NOT NULL,
    statusOfAcknowledgement VARCHAR(50) NOT NULL,
    PRIMARY KEY (studentNRIC)
    );

    CREATE TABLE IF NOT EXISTS form (
    studentNRIC VARCHAR(9) NOT NULL,
    courseDate DATE NOT NULL,
    doctorMCR VARCHAR(255) NOT NULL,
    eligibility VARCHAR(5) NOT NULL,
    comments VARCHAR(255) NOT NULL,
    formStatus VARCHAR(50) NOT NULL,
    examinationDate DATE NOT NULL,
    email VARCHAR(255) NOT NULL,
    PRIMARY KEY (studentNRIC)
    );

`;

    return query(CREATE_TABLE_SQL)
    .then(function (result) {
        console.log('Tables created');
    })
    .catch(function (error) {
        if (error.code === 'ER_TABLE_EXISTS_ERROR') {
            throw new Error('Table already exists');
        }
        
        throw error;
    });