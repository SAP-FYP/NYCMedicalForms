const conn = require('../database');
const { query, pool } = conn;

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

module.exports.getPermissionGroups = async function getPermissionGroups(searchInput) {

    const sql = `SELECT g.groupId, g.groupName, GROUP_CONCAT(gp.permsId) AS permsId, GROUP_CONCAT(p.permsName) AS permsName
    FROM \`group\` AS g
    LEFT JOIN groupPerm AS gp ON g.groupId = gp.groupId
    LEFT JOIN permission AS p ON gp.permsId = p.permsId
    WHERE g.groupName LIKE ?
    GROUP BY g.groupId`

    return query(sql, `%${searchInput}%`)
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
        return groupInsertId

    } catch (error) {
        await connection.rollback()
        connection.release()
        throw error
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
        return affectedRows1

    } catch (error) {
        await connection.rollback()
        connection.release()
        throw error
    }
}

module.exports.deletePermissionGroup = async function getPermissions(groupId) {
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

        await connection.commit();
        return affectedRows2

    } catch (error) {
        await connection.rollback()
        connection.release()
        throw error
    }
}

module.exports.getAllUsers = function getAllUsers(email, searchInput) {
    // const sql = `SELECT u.email, u.nameOfUser, u.contactNo, u.groupId, u.roleId, u.picUrl, u.isDisabled, r.roleName
    // FROM user u
    // LEFT JOIN role r ON u.roleId = r.roleId
    // WHERE u.isDeleted = 0 AND
    // u.email != ? AND
    // (u.nameOfUser LIKE ? OR
    // u.email LIKE ?)`;

    const sql = `SELECT u.email, u.nameOfUser, u.contactNo, u.groupId, u.roleId, u.picUrl, u.isDisabled, r.roleName
    FROM user u
    LEFT JOIN role r ON u.roleId = r.roleId
    WHERE u.isDeleted = 0 AND
    u.email != ? AND
    u.nameOfUser LIKE ?;`;

    return query(sql, [email, `%${searchInput}%`])
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