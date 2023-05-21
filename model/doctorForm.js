const conn = require('../database');
const { query } = conn;

module.exports.uploadSign = function uploadSign(name, signatureBlob) {
    const sql = `INSERT INTO DS (name,signature) VALUES (?,?)`;
    return query(sql, [name,`${signatureBlob}`]).catch(function (error) {
        console.log(error)
        throw error;
    });
};

module.exports.postSignatureInfo = function postSignatureInfo(
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
  ) {
    const sql = `INSERT INTO formInfo (applicantName, schoolName, NRIC, class, courseDate, tentanusVaccinationDate, fitness, additionalInfo, physicianMCR, clinicName, currentDate, contactNo, clinicAddress, physicianName, signatureInfo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    return query(sql, [
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
    ]).catch(function (error) {
      console.log(error);
      throw error;
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
