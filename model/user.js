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
            throw error;
        })
}

module.exports.updateUserPermission = function updateUserPermission(email, groupId) {
    const sql = `UPDATE user SET groupID = ? WHERE email = ?`;
    return query(sql, [groupId, email])
        .then((result) => {
            return result;
        })
        .catch((error) => {
            throw error;
        })
}
