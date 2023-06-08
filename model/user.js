const conn = require('../database');
const { query } = conn;

module.exports.getUser = function getUser(email) {
    const sql = `SELECT * FROM user WHERE email = ?`;
    return query(sql, [email])
        .then((result) => {
            const row = result[0];
            if (row.length === 0) {
                const error = new Error("No user found");
                error.status = 404;
                throw error;
            }
            return row[0];
        })
        .catch((error) => {
            throw error;
        })
}