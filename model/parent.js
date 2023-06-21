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