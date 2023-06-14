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
    groupId INT NOT NULL,
    created_at DATETIME NOT NULL,
    isDisabled BOOLEAN NOT NULL DEFAULT FALSE,
    isDeleted BOOLEAN NOT NULL DEFAULT FALSE,
    invalidationDate DATETIME,
    passwordUpdated DATETIME,
    roleId INT NOT NULL,
    PRIMARY KEY (email)
    );

    CREATE TABLE IF NOT EXISTS roles (
    roleId INT NOT NULL AUTO_INCREMENT,
    roleName VARCHAR(255) NOT NULL,
    PRIMARY KEY (roleId)
    );

    CREATE TABLE IF NOT EXISTS \`group\` (
    groupId INT NOT NULL,
    groupName VARCHAR(255) NOT NULL,
    PRIMARY KEY (groupId)
    );

    CREATE TABLE IF NOT EXISTS groupPerm (
    groupId INT NOT NULL,
    permsId INT NOT NULL,
    PRIMARY KEY (groupId, permsId)
    );

    CREATE TABLE IF NOT EXISTS permission (
    permsId INT NOT NULL,
    permsName VARCHAR(255) NOT NULL,
    permsDescription VARCHAR(255) NOT NULL,
    PRIMARY KEY (permsId)
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
    studentId INT NOT NULL AUTO_INCREMENT,
    studentNRIC VARCHAR(9) NOT NULL,
    nameOfStudent VARCHAR(255) NOT NULL,
    class VARCHAR(255) NOT NULL,  
    school VARCHAR(255) NOT NULL,
    dateOfBirth DATE NOT NULL,
    dateOfVaccination VARCHAR(255) NOT NULL,
    PRIMARY KEY (studentId)  
    );

    CREATE TABLE IF NOT EXISTS parentAcknowledgement (
    studentId INT NOT NULL AUTO_INCREMENT,
    parentNRIC VARCHAR(9) NOT NULL,
    nameOfParent VARCHAR(255) NOT NULL,
    parentEmail VARCHAR(255) NULL.
    parentSignature BLOB NOT NULL,
    dateOfAcknowledgement DATE NOT NULL,
    parentContactNo INT NOT NULL,
    statusOfAcknowledgement VARCHAR(50) NOT NULL,
    PRIMARY KEY (studentId)
    );

    CREATE TABLE IF NOT EXISTS form (
    formId INT NOT NULL AUTO_INCREMENT,
    studentId INT NOT NULL,
    courseDate DATE NOT NULL,
    doctorMCR VARCHAR(255) NOT NULL,
    eligibility VARCHAR(5) NOT NULL,
    comments VARCHAR(255) NOT NULL,
    formStatus VARCHAR(50) NOT NULL,
    examinationDate DATE NOT NULL,
    email VARCHAR(255) NOT NULL,
    review VARCHAR(255) NOT NULL,
    PRIMARY KEY (formId)
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