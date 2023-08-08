const conn = require("../database");
const { query } = conn;

module.exports.updateAcknowledgement = function updateAcknowledgement(data) {
    const sql = `UPDATE parentAcknowledgement 
  SET parentNRIC = ?, nameOfParent = ?, parentSignature = ?, dateOfAcknowledgement = ?, statusOfAcknowledgement = "Acknowledged"
   WHERE studentId = ? AND statusOfAcknowledgement = "Pending Parent" `;
    return query(sql, [
        data.parentNRIC, data.nameOfParent,
        data.parentSignature, data.dateOfAcknowledgement,
        data.studentID
    ])
        .then((result) => {
            const row = result[0];
            if (row.length === 0) {
                const error = new Error("Invalid URL");
                error.status = 401;
                throw error;
            }
            return row[0];
        }
        )
};

module.exports.postAcknowledgement = function postAcknowledgement(studentID, parentContactNo, parentEmail) {
    const sql = `INSERT INTO parentAcknowledgement (studentId,parentContactNo,parentEmail) VALUES (?,?,?)`;
    return query(sql, [studentID, parentContactNo, parentEmail])
        .then((result) => {
            const row = result[0];
            if (row.length === 0) {
                const error = new Error("Invalid URL");
                error.status = 401;
                throw error;
            }
            return row[0];
        });
};

module.exports.updateFormStatus = function updateFormStatus(studentID) {
    const sql = `UPDATE form SET formStatus = "Pending" WHERE studentId = ? AND formStatus = "Pending Parent"`;
    return query(sql, [studentID])
        .then((result) => {
            const row = result[0];
            if (row.length === 0) {
                const error = new Error("Invalid URL");
                error.status = 401;
                throw error;
            }
            return row[0];
        })
};

module.exports.verifyIfAcknowledged = function verifyIfAcknowledged(studentID) {
    const sql = `SELECT statusOfAcknowledgement FROM parentAcknowledgement WHERE studentId = ?`;
    return query(sql, [studentID])
        .then((result) => {
            const row = result[0];
            if (row.length === 0) {
                const error = new Error("Invalid URL");
                error.status = 401;
                throw error;
            }
            return row[0];
        })
}

module.exports.getAcknowledgement = function getAcknowledgement(studentID) {
    const sql = `SELECT parentNRIC, nameOfParent, parentSignature, dateOfAcknowledgement FROM parentAcknowledgement WHERE studentId = ?`;
    return query(sql, [studentID])
        .then((result) => {
            const row = result[0];
            if (row.length === 0) {
                const error = new Error("Invalid URL");
                error.status = 401;
                throw error;
            }
            return row[0];
        })
}

module.exports.getRaces = function getRaces() {
    const sql = `SELECT * FROM race ORDER BY raceName`;
    return query(sql).then(function (result) {
        const rows = result[0];
        if (rows.length === 0) {
            const error = new Error("No race found");
            error.status = 404;
            throw error;
        }
        return rows;
    }).catch((error) => {
        throw error;
    });
};