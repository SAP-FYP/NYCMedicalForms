const conn = require('../database');
const { query, pool } = conn;

module.exports.cronSelectUsers = async function cronSelectUsers(today, interval) {
    const sql = `SELECT * FROM user WHERE invalidationDate <= DATE_SUB(?, INTERVAL ${interval}) AND isDeleted = 1;`

    return query(sql, [today])
        .then((result) => {
            const rows = result[0];
            if (rows.length === 0) {
                const error = new Error("No users found");
                error.status = 404;
                throw error;
            }
            return rows;
        })
        .catch((error) => {
            throw error;
        })
}

module.exports.cronDeleteUsers = async function cronDeleteUsers(today, interval) {
    const sql = `DELETE FROM user WHERE invalidationDate <= DATE_SUB(?, INTERVAL ${interval}) AND isDeleted = 1;`

    return query(sql, [today])
        .then((result) => {
            const affectedRows = result[0].affectedRows;

            if (affectedRows == 0) {
                const error = new Error("No users to delete");
                error.status = 404;
                throw error;
            }
            return affectedRows;

        }).catch((error) => {
            throw error;
        });
}