const { locale } = require('moment');
const conn = require('../database');
const { query, pool } = conn;

module.exports.createUser = function createUser(newuser) {
    const sql = `INSERT INTO user (Email, nameOfUser, password, contactNo, groupId, created_at, isDisabled, isDeleted, roleId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    return query(sql, [newuser.email, newuser.name, newuser.password, newuser.contact, newuser.permissionGroup, newuser.created_at, 0, 0, newuser.role])
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

module.exports.getPermissionGroups = async function getPermissionGroups(searchInput, limit, offset) {

    const sql = `SELECT g.groupId, g.groupName, GROUP_CONCAT(gp.permsId) AS permsId, GROUP_CONCAT(p.permsName) AS permsName
    FROM \`group\` AS g
    LEFT JOIN groupPerm AS gp ON g.groupId = gp.groupId
    LEFT JOIN permission AS p ON gp.permsId = p.permsId
    WHERE g.groupName LIKE ?
    GROUP BY g.groupId 
    LIMIT ? OFFSET ?`

    return query(sql, [`%${searchInput}%`, limit, offset])
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

module.exports.getPermissions = function getPermissions() {
    const sql = 'SELECT * FROM permission ORDER BY permsId ASC';
    return query(sql)
        .then((result) => {
            const rows = result[0];
            if (rows.length === 0) {
                const error = new Error("No permissions found");
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

module.exports.createPermGroup = async function createPermGroup(newPermGroup) {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const sql1 = 'INSERT INTO `group` (groupName) VALUES (?)';
        const result1 = await connection.query(sql1, [newPermGroup.permGroupName]);
        const affectedRows1 = result1[0].affectedRows;
        const groupInsertId = result1[0].insertId;

        if (affectedRows1 == 0) {
            const error = new Error("Unable to create permission group");
            error.status = 500;
            throw error;
        }

        let bulkInsert = []
        newPermGroup.permissions.forEach(i => {
            bulkInsert.push([`${groupInsertId}`, i])
        });

        const sql2 = 'INSERT INTO groupPerm (groupId, permsId) VALUES ?';
        const result2 = await connection.query(sql2, [bulkInsert]);
        const affectedRows2 = result2[0].affectedRows;

        if (affectedRows2 == 0) {
            const error = new Error("Unable to create permission group");
            error.status = 500;
            throw error;
        }

        await connection.commit();
        return groupInsertId;

    } catch (error) {
        await connection.rollback();
        throw error
    } finally {
        connection.release();
    }
}

module.exports.editPermGroup = async function createPermGroup(permGroup) {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Update group name
        const sql1 = 'UPDATE `group` SET groupName = ? WHERE groupId = ?';
        const result1 = await connection.query(sql1, [permGroup.permGroupName, permGroup.permGroupId]);
        const affectedRows1 = result1[0].affectedRows;

        if (affectedRows1 == 0) {
            const error = new Error("Unable to edit permission group");
            error.status = 500;
            throw error;
        }

        // Delete group permissions
        const sql2 = 'DELETE FROM groupPerm WHERE groupId = ?';
        const result2 = await connection.query(sql2, [permGroup.permGroupId]);
        const affectedRows2 = result2[0].affectedRows;

        if (affectedRows2 == 0) {
            const error = new Error("Unable to edit permission group");
            error.status = 500;
            throw error;
        }

        // Add updated group permissions
        let bulkInsert = []
        permGroup.permissions.forEach(i => {
            bulkInsert.push([`${permGroup.permGroupId}`, i])
        });

        const sql3 = 'INSERT INTO groupPerm (groupId, permsId) VALUES ?';
        const result3 = await connection.query(sql3, [bulkInsert]);
        const affectedRows3 = result3[0].affectedRows;

        if (affectedRows3 == 0) {
            const error = new Error("Unable to edit permission group");
            error.status = 500;
            throw error;
        }

        await connection.commit();
        return affectedRows1;

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

module.exports.deletePermissionGroup = async function getPermissions(groupId, invalidationDate) {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Delete group permissions
        const sql1 = 'DELETE FROM groupPerm WHERE groupId = ?';
        const result1 = await connection.query(sql1, [groupId]);
        const affectedRows1 = result1[0].affectedRows;

        if (affectedRows1 == 0) {
            const error = new Error("Unable to delete permission group");
            error.status = 500;
            throw error;
        }

        // Delete group
        const sql2 = 'DELETE FROM `group` WHERE groupId = ?';
        const result2 = await connection.query(sql2, [groupId]);
        const affectedRows2 = result2[0].affectedRows;

        if (affectedRows2 == 0) {
            const error = new Error("Unable to delete permission group");
            error.status = 500;
            throw error;
        }

        // Move users to default group
        const sql3 = 'UPDATE user SET groupId = ?, invalidationDate = ? WHERE groupId = ?';
        await connection.query(sql3, [155, invalidationDate, groupId]);

        await connection.commit();
        return affectedRows2;

    } catch (error) {
        await connection.rollback();
        throw error
    } finally {
        connection.release();
    }
}

module.exports.bulkDeletePermissionGroup = async function bulkDeletePermissionGroup(groupIds, invalidationDate) {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Delete group permissions
        const sql1 = 'DELETE FROM groupPerm WHERE groupId IN (?)';
        const result1 = await connection.query(sql1, [groupIds]);
        const affectedRows1 = result1[0].affectedRows;

        if (affectedRows1 < groupIds.length) { // at least 1 permission deleted from each group aka Read permissions
            const error = new Error("Unable to delete permission group");
            error.status = 500;
            throw error;
        }

        const sql2 = 'DELETE FROM `group` WHERE groupId IN (?)';
        const result2 = await connection.query(sql2, [groupIds]);
        const affectedRows2 = result2[0].affectedRows;

        if (affectedRows2 != groupIds.length) { // if deleted groups # not same as given groups #
            const error = new Error("Unable to delete permission group");
            error.status = 500;
            throw error;
        }

        // Move users to default group
        const sql3 = 'UPDATE user SET groupId = ?, invalidationDate = ? WHERE groupId IN (?)';
        await connection.query(sql3, [155, invalidationDate, groupIds]);

        await connection.commit();
        return affectedRows2;

    } catch (error) {
        await connection.rollback();
        throw error
    } finally {
        connection.release();
    }
}

module.exports.getAllUsers = function getAllUsers(email, searchInput, limit, offset) {
    // const sql = `SELECT u.email, u.nameOfUser, u.contactNo, u.groupId, u.roleId, u.picUrl, u.isDisabled, r.roleName
    // FROM user u
    // LEFT JOIN role r ON u.roleId = r.roleId
    // WHERE u.isDeleted = 0 AND
    // u.email != ? AND
    // (u.nameOfUser LIKE ? OR
    // u.email LIKE ?)
    // ORDER BY u.nameOfUser 
    // LIMIT ? OFFSET ?`;

    const sql = `SELECT u.email, u.nameOfUser, u.contactNo, u.groupId, u.roleId, u.picUrl, u.isDisabled, r.roleName
    FROM user u
    LEFT JOIN role r ON u.roleId = r.roleId
    WHERE u.isDeleted = 0 AND
    u.email != ? AND
    u.nameOfUser LIKE ? 
    ORDER BY u.nameOfUser 
    LIMIT ? OFFSET ?`;

    return query(sql, [email, `%${searchInput}%`, limit, offset])
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

module.exports.editUser = function editUser(user) {
    const sql = 'UPDATE user SET nameOfUser = ?, contactNo = ?, groupId = ?, invalidationDate = ?, roleId = ? WHERE email = ?';
    return query(sql, [user.name, user.contact, user.group, user.invalidationDate, user.role, user.email])
        .then((result) => {
            const affectedRows = result[0].affectedRows;

            if (affectedRows == 0) {
                const error = new Error("Unable to update account");
                error.status = 500;
                throw error;
            }
            return affectedRows;
        }).catch((error) => {
            console.log(error)
            throw error;
        })
}

module.exports.deleteUser = function deleteUser(user) {
    const sql = 'UPDATE user SET isDeleted = 1, invalidationDate = ? WHERE email = ?';
    return query(sql, [user.invalidationDate, user.email])
        .then((result) => {
            const affectedRows = result[0].affectedRows;

            if (affectedRows == 0) {
                const error = new Error("Unable to delete account");
                error.status = 500;
                throw error;
            }
            return affectedRows;
        }).catch((error) => {
            console.log(error)
            throw error;
        })
}

module.exports.bulkDeleteUser = async function bulkDeleteUser(users, invalidationDate) {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();
        const sql = 'UPDATE user SET isDeleted = 1, invalidationDate = ? WHERE email IN (?)';
        const result = await connection.query(sql, [invalidationDate, users]);
        const affectedRows = result[0].affectedRows;
        if (affectedRows < users.length) {
            const error = new Error("Unable to delete accounts");
            error.status = 500;
            throw error;
        }

        await connection.commit();
        return affectedRows;

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

module.exports.disableUser = function disableUser(user) {
    const sql = 'UPDATE user SET isDisabled = ?, invalidationDate = ? WHERE email = ?';
    return query(sql, [user.status, user.invalidationDate, user.email])
        .then((result) => {
            const affectedRows = result[0].affectedRows;

            if (affectedRows == 0) {
                const error = new Error("Unable to disable/enable account");
                error.status = 500;
                throw error;
            }
            return affectedRows;
        }).catch((error) => {
            console.log(error)
            throw error;
        })
}

module.exports.bulkDisableUser = async function bulkDisableUser(users, status, invalidationDate) {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const sql = 'UPDATE user SET isDisabled = ?, invalidationDate = ? WHERE email IN (?)';
        const result = await connection.query(sql, [status, invalidationDate, users]);
        const affectedRows = result[0].affectedRows;

        if (affectedRows < users.length) {
            const error = new Error("Unable to disable/enable accounts");
            error.status = 500;
            throw error;
        }

        await connection.commit();
        return affectedRows;

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

module.exports.updateUserPassword = function updateUserPassword(email, password, invalidationDate, passwordUpdated) {
    const sql = 'UPDATE user SET password = ?, invalidationDate = ?, passwordUpdated = ? WHERE email = ?';
    return query(sql, [password, invalidationDate, passwordUpdated, email])
        .then((result) => {
            const affectedRows = result[0].affectedRows;

            if (affectedRows == 0) {
                const error = new Error("Unable to update account");
                error.status = 500;
                throw error;
            }
            return affectedRows;
        }).catch((error) => {
            console.log(error)
            throw error;
        })
}

module.exports.updateUserProfile = function updateUserProfile(email, name, contact, invalidationDate, picUrl) {

    const sql = picUrl
        ? 'UPDATE user SET nameOfUser = ?, contactNo = ?, invalidationDate = ?, picUrl = ? WHERE email = ?'
        : 'UPDATE user SET nameOfUser = ?, contactNo = ?, invalidationDate = ? WHERE email = ?';

    const params = picUrl ? [name, contact, invalidationDate, picUrl, email] : [name, contact, invalidationDate, email];

    return query(sql, params)
        .then((result) => {
            const affectedRows = result[0].affectedRows;

            if (affectedRows == 0) {
                const error = new Error("Unable to update account");
                error.status = 500;
                throw error;
            }
            return affectedRows;
        }).catch((error) => {
            console.log(error)
            throw error;
        })
}

module.exports.getUserInfo = function getUserInfo(email) {
    const sql = `SELECT * FROM user WHERE email = ?`;

    return query(sql, [email])
        .then((result) => {
            const row = result[0];
            if (!row) {
                const error = new Error("User does not exist");
                error.status = 404;
                throw error;
            }
            return row[0];
        })
        .catch((error) => {
            throw error;
        })
}