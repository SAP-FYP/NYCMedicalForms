const conn = require('../database');
const { query } = conn;

module.exports.retrieveAllSubmissions = function retrieveAllSubmissions() {
    const sql = `SELECT *
                    FROM form F
                    JOIN student S ON F.studentId = S.studentId
                    JOIN parentAcknowledgement PA ON F.studentId = PA.studentId
                    ;`;
    return query(sql)
        .then((result) => {
            if (result.length === 0) {
                throw new Error("No submissions found");
            }
            return result;
        })
        .catch((error) => {
            throw new Error(error);
        });
};

module.exports.retrieveSubmission = function retrieveSubmission(nameOfStudent) {
     const sql = `SELECT *
                  FROM form F
                  JOIN student S ON F.studentId = S.studentId
                  JOIN parentAcknowledgement PA ON F.studentId = PA.studentId
                  JOIN doctor D ON F.doctorMCR = D.doctorMCR
                  WHERE S.nameOfStudent= ?;`;
        return query(sql, [nameOfStudent])
            .then((result) => {
                if (result.length === 0) {
                    throw new Error(nameOfStudent + "'s submission not found");
                }
                return result;
            }
            )
            .catch((error) => {
                throw new Error(error);
            });
};

module.exports.updateSubmissionStatus = function updateSubmissionStatus(formStatus, studentId) {
    const sql = `UPDATE form 
                 SET formStatus = ?
                 WHERE studentId = ?;`;
       return query(sql, [formStatus, studentId])
           .then((result) => {
              
               return result;
           }
           )
           .catch((error) => {
               throw new Error(error);
           });
};