const conn = require("../database");
const { query } = conn;

module.exports.updateAcknowledgement = function updateAcknowledgement(data) {
  const sql = `UPDATE parentAcknowledgement 
  SET parentNRIC = ?, nameOfParent = ?, parentSignature = ?, dateOfAcknowledgement = ?, statusOfAcknowledgement = "Acknowledged"
   WHERE studentId = ?`;
    return query(sql, [
        data.parentNRIC, data.nameOfParent, 
        data.parentSignature, data.dateOfAcknowledgement, 
         data.studentID
    ])
        .then((result) => {
            const row = result[0];
            if (row.length === 0) {
                // TODO ERROR HANDLING
                const error = new Error("Invalid URL");
                error.status = 401;
                throw error;
            }
            return row[0];
        }
        )
};

module.exports.postAcknowledgement = function postAcknowledgement(studentID, parentContactNo, parentEmail) {
    const sql = `INSERT INTO parentAcknowledgement (studentId,parentContactNo,parentEmail) VALUES (?,?,?)`;
      return query(sql, [studentID, parentContactNo, parentEmail])
    .then((result) => {
        const row = result[0];
        if (row.length === 0) {
            // TODO ERROR HANDLING
            const error = new Error("Invalid URL");
            error.status = 401;
            throw error;
        }
        return row[0];
    });
};

module.exports.updateFormStatus = function updateFormStatus(studentID) {
    const sql = `UPDATE form SET formStatus = "Pending" WHERE studentId = ?`;
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
