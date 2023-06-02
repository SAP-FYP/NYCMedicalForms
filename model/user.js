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

module.exports.updateAccountStatus = function disableUser(email, status) {
    const sql = `UPDATE user SET isDisabled = ? WHERE email = ?`;
    return query(sql, [status, email])
        .then((result) => {
            return result;
        })
        .catch((error) => {
            throw error;
        })
}

module.exports.deleteUser = function deleteUser(email) {
    const sql = `Update user SET isDeleted = 1 WHERE email = ?`;
    return query(sql, [email])
        .then((result) => {
            return result;
        })
        .catch((error) => {
            throw error;
        })
}

