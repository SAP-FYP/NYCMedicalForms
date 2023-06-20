const conn = require('../database');
const { query } = conn;

module.exports.loginUser = function loginUser(credentials) {
    const sql = `SELECT * FROM user WHERE email = ?`;
    return query(sql, [credentials.email, credentials.password])
        .then((result) => {
            const row = result[0];
            if (row.length === 0) {
                const error = new Error("Invalid email or password");
                error.status = 401;
                throw error;
            }
            return row[0];
        })
        .catch((error) => {
            throw new Error(error);
        })
}

module.exports.parentLogin = function parentLogin(studentID) {
    const sql = `SELECT s.dateOfBirth, s.studentNRIC from form f INNER JOIN student s on f.studentId = s.studentId INNER JOIN parentAcknowledgement p on s.studentId = p.studentId WHERE f.studentID = ?`;
    return query(sql, [studentID])
        .then((result) => {
            const row = result[0];
            if (row.length === 0) {
                const error = new Error("Invalid URL or password");
                error.status = 401;
                throw error;
            }
            return row[0];
        })
        .catch((error) => {
            // TODO Error handling if studentID doesn't need parents acknowledgement
            throw new Error(error);
        })
}