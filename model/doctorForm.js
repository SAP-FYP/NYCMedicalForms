const conn = require('../database');
const { query } = conn;

const {
    UserNotFoundError,
} = require('../errors');

module.exports.matchDoctorInfo = function matchDoctorInfo(doctorMCR){
    const sql = `SELECT * FROM doctor WHERE doctorMCR = ?;`;
    return query(sql,[doctorMCR]).then(function (result) {
        const rows = result[0];
        console.log(rows);
        if (rows.length === 0) {
            throw new UserNotFoundError('No doctor found with the provided MCR');
        }
        return rows;
    });
};

module.exports.getSignatureInfo = function getSignatureInfo(userName) {
    const sql = `SELECT signatureInfo FROM signatureInfo WHERE userName = ?;`;
    return query(sql,[userName]).then(function (result) {
        const rows = result[0];
        if (rows.length === 0) {
            throw new Error;
        }
        return rows;
    });
};

module.exports.postDoctorInfo = function postDoctorInfo(doctorMCR, physicianName,encryptedsignatureInfo,clinicName,clinicAddress,contactNo) {
    const sql = `INSERT INTO doctor (doctorMCR,nameOfDoctor, signature, nameOfClinic, clinicAddress, contactNo) VALUES (?,?,?,?,?,?)`;
    return query(sql, [doctorMCR, physicianName,encryptedsignatureInfo,clinicName,clinicAddress,contactNo]).catch(function (error) {
        console.log(error)
        throw error;
    });
};

module.exports.postStudentInfo = function postStudentInfo(studentNRIC,studentName,dateOfBirth,studentClass,schoolName,dateOfVaccine) {
    const sql = `INSERT INTO student (studentNRIC,nameOfStudent,dateOfBirth,class,school,dateOfVaccination) VALUES (?,?,?,?,?,?)`;
    return query(sql, [studentNRIC,studentName,dateOfBirth,studentClass,schoolName,dateOfVaccine]).catch(function (error) {
        console.log(error)
        throw error;
    });
};

module.exports.postFormInfo = function postFormInfo(studentId, courseDate,doctorMCR,eligibility,comments,date) {
    const sql = `INSERT INTO form (studentId,courseDate,doctorMCR,eligibility,comments,examinationDate) VALUES (?,?,?,?,?,?)`;
    return query(sql, [studentId, courseDate,doctorMCR,eligibility,comments,date]).catch(function (error) {
        console.log(error)
        throw error;
    });
};

module.exports.mySign = function mySign() {
    const sql = `SELECT signature FROM DS LIMIT 1;`;
    return query(sql).then(function (result) {
        const rows = result[0];
        if (rows.length === 0) {
            throw new Error;
        }
        return rows;
    });
};
