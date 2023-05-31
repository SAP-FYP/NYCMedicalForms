const conn = require('../database');
const { query } = conn;

module.exports.retrieveAllSubmissions = function retrieveAllSubmissions() {
    const sql = `SELECT *
                 FROM form F
                 JOIN student S ON F.studentId = S.studentId
                 JOIN parentAcknowledgement PA ON F.studentId = PA.studentId;`;
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