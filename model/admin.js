const conn = require('../database');
const { query } = conn;

module.exports.createUser = function createUser(newuser) {
    const sql = `INSERT INTO user (Email, nameOfUser, password, contactNo, groupId, created_at, isDisabled, isDeleted, passwordUpdated, roleId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    return query(sql, [newuser.email, newuser.name, newuser.password, newuser.contact, newuser.permissionGroup, newuser.created_at, 0, 0, newuser.passwordUpdated, newuser.role])
        .then((result) => {
            const affectedRows = result[0].affectedRows;

            if (affectedRows == 0) {
                const error = new Error("Unable to create account");
                error.status = 500;
                throw error;
            }
            return affectedRows;
        })
        .catch((error) => {
            console.log(error)
            throw error;
        })
}

module.exports.getPermissionGroups = function getPermissionGroups() {
    const sql = 'SELECT * FROM `group` ORDER BY groupId ASC';
    return query(sql)
        .then((result) => {
            const rows = result[0];
            if (rows.length === 0) {
                const error = new Error("No permission groups found");
                error.status = 404;
                throw error;
            }
            return rows;
        })
        .catch((error) => {
            throw error;
        })
}

module.exports.getUserRoles = function getUserRoles() {
    const sql = 'SELECT * FROM role ORDER BY roleId ASC';
    return query(sql)
        .then((result) => {
            const rows = result[0];
            if (rows.length === 0) {
                const error = new Error("No user roles found");
                error.status = 404;
                throw error;
            }
            return rows;
        })
        .catch((error) => {
            throw error;
        })
}