const conn = require("../database");
const { query } = conn;

module.exports.getFormDetails = function getFormDetails(studentID) {
  const sql = `
  SELECT s.nameOfStudent, s.studentNRIC as studentNRIC, s.dateOfBirth, s.class, s.school, s.dateOfVaccination, 
  f.eligibility, f.comments, f.courseDate, f.examinationDate, 
  d.nameOfDoctor, d.doctorMCR, d.nameOfClinic, d.clinicAddress, d.contactNo, d.signature,
  p.parentContactNo, p.parentEmail
  FROM student s 
  INNER JOIN form f ON s.studentID = f.studentID 
  INNER JOIN doctor d ON f.doctorMCR = d.doctorMCR
  INNER JOIN parentAcknowledgement p ON s.studentID = p.studentID
  WHERE s.studentID = ?`;
    return query(sql, [studentID])
        .then((result) => {
            const row = result[0];
            if (row.length === 0) {
                // TODO ERROR HANDLING
                const error = new Error("Invalid URL");
                error.status = 401;
                throw error;
            }
            return row[0];
        })
};
