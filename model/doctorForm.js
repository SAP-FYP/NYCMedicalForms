const conn = require('../database');
const { query } = conn;

const {
    UserNotFoundError,
    DUPLICATE_ENTRY_ERROR
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

module.exports.postDoctorInfo = function postDoctorInfo(doctorMCR, physicianName,encryptedsignatureInfo,clinicName,clinicAddress,contactNo) {
    const sql = `INSERT INTO doctor (doctorMCR,nameOfDoctor, signature, nameOfClinic, clinicAddress, contactNo) VALUES (?,?,?,?,?,?)`;
    return query(sql, [doctorMCR, physicianName,encryptedsignatureInfo,clinicName,clinicAddress,contactNo])
    .catch(function (error) {
        console.error('Error in postDoctorInfo:', error);
        if (error.code === 'ER_DUP_ENTRY') {
          // Handle duplicate entry error
          throw new DUPLICATE_ENTRY_ERROR('Doctor Duplicate entry');
        } else {
          // Internal Server Error
          throw new Error('Database error');
        }
    });
};

module.exports.postStudentInfo = function postStudentInfo(studentNRIC,studentName,dateOfBirth,studentClass,schoolName,dateOfVaccine) {
    const sql = `INSERT INTO student (studentNRIC,nameOfStudent,dateOfBirth,class,school,dateOfVaccination) VALUES (?,?,?,?,?,?)`;
    return query(sql, [studentNRIC,studentName,dateOfBirth,studentClass,schoolName,dateOfVaccine])
    .catch(function (error) {
        console.error('Error in postStudentInfo:', error);
        if (error.code === 'ER_DUP_ENTRY') {
          // Handle duplicate entry error
          throw new DUPLICATE_ENTRY_ERROR('Student Duplicate entry');
        } else {
          // Internal Server Error
          throw new Error('Database error');
        }
    });
};

module.exports.postFormInfo = function postFormInfo(studentId, courseDate,doctorMCR,eligibility,comments,date) {
    const sql = `INSERT INTO form (studentId,courseDate,doctorMCR,eligibility,comments,examinationDate) VALUES (?,?,?,?,?,?)`;
    return query(sql, [studentId, courseDate,doctorMCR,eligibility,comments,date])
    .catch(function (error) {
        console.error('Error in postFormInfo:', error);
        if (error.code === 'ER_DUP_ENTRY') {
          // Handle duplicate entry error
          throw new DUPLICATE_ENTRY_ERROR('Form Duplicate entry');
        } else {
          // Internal Server Error
          throw new Error('Database error');
        }
    });
};
