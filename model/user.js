const conn = require('../database');
const { query } = conn;

module.exports.loginUser = function loginUser(credentials) {
    const sql = `SELECT * FROM user WHERE email = ? and password = ?`;
    return query(sql, [credentials.email, credentials.password])
        .then((result) => {
            const row = result[0];
            if (row.length === 0) {
                throw "Invalid email or password";
            }
            return row[0];
        })
        .catch((error) => {
            throw new Error(error);
        })
}