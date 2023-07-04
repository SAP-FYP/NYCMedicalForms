const conn = require('../database');
const { query, pool } = conn;

module.exports.loginUser = async function loginUser(email) {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();
        const sql1 = `SELECT * FROM user WHERE email = ? AND isDeleted = 0`;
        const result1 = await connection.query(sql1, [email]);

        const userData = result1[0];
        if (userData.length === 0) {
            const error = new Error("No user found");
            error.status = 404;
            throw error;
        }

        if (userData[0].roleId != 1) {
            const sql2 = `SELECT permsId FROM groupPerm WHERE groupId = ?`;
            const result2 = await connection.query(sql2, [userData[0].groupId]);

            const permissions = result2[0];
            if (permissions.length === 0) {
                const error = new Error("No permissions found");
                error.status = 404;
                throw error;
            }

            let userPermission = [];
            permissions.forEach(i => {
                userPermission.push(i.permsId)
            });

            userData[0].permissions = userPermission;
        }

        return userData[0];

    } catch (error) {
        throw error;
    } finally {
        connection.release();
    }
}

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

