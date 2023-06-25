const conn = require('../database');
const { query } = conn;

module.exports.retrieveAllSubmissions = function retrieveAllSubmissions() {
    const sql = `SELECT *
                    FROM form F
                    JOIN student S ON F.studentId = S.studentId
                    JOIN parentAcknowledgement PA ON F.studentId = PA.studentId
                    ;`;
    return query(sql)
        .then((result) => {
            if (result.length === 0) {
                throw new Error("No submissions found");
            }
            return result;
        })
        .catch((error) => {
            throw new Error(error);
        });
};

module.exports.retrieveSubmission = function retrieveSubmission(nameOfStudent) {
     const sql = `SELECT *
                  FROM form F
                  JOIN student S ON F.studentId = S.studentId
                  JOIN parentAcknowledgement PA ON F.studentId = PA.studentId
                  JOIN doctor D ON F.doctorMCR = D.doctorMCR
                  WHERE S.nameOfStudent= ?;`;
        return query(sql, [nameOfStudent])
            .then((result) => {
                if (result.length === 0) {
                    throw new Error(nameOfStudent + "'s submission not found");
                }
                return result;
            }
            )
            .catch((error) => {
                throw new Error(error);
            });
};

module.exports.retrieveSubmissionBySearch = function retrieveSubmissionBySearch(searchInput) {
    const sql = `SELECT *
    FROM form F
    JOIN student S ON F.studentId = S.studentId
    JOIN parentAcknowledgement PA ON F.studentId = PA.studentId
    JOIN doctor D ON F.doctorMCR = D.doctorMCR
    WHERE S.nameOfStudent LIKE ?`;
    return query(sql, `%${searchInput}%`)
        .then((result) => {
            if (result.length === 0) {
                throw new Error(searchInput + "'s submission not found");
            }
            return result;
        })
        .catch((error) => {
            throw new Error(error);
        })
}

module.exports.retrieveSubmissionBySchoolName= function retrieveSubmissionBySchoolName(schoolName) {
    const sql = `SELECT *
    FROM form F
    JOIN student S ON F.studentId = S.studentId
    JOIN parentAcknowledgement PA ON F.studentId = PA.studentId
    JOIN doctor D ON F.doctorMCR = D.doctorMCR
    WHERE S.school = ?`;
    return query(sql, [schoolName])
        .then((result) => {
            if (result.length === 0) {
                throw new Error("Submission not found");
            }
            return result;
        })
        .catch((error) => {
            throw new Error(error);
        })
}

module.exports.retrieveSubmissionByClassName= function retrieveSubmissionByClassName(className) {
    const sql = `SELECT *
    FROM form F
    JOIN student S ON F.studentId = S.studentId
    JOIN parentAcknowledgement PA ON F.studentId = PA.studentId
    JOIN doctor D ON F.doctorMCR = D.doctorMCR
    WHERE S.class = ?`;
    return query(sql, [className])
        .then((result) => {
            if (result.length === 0) {
                throw new Error("Submission not found");
            }
            return result;
        })
        .catch((error) => {
            throw new Error(error);
        })
}

module.exports.retrieveSubmissionByCourseDate= function retrieveSubmissionByCourseDate(courseDate) {
    const sql = `SELECT *
    FROM form F
    JOIN student S ON F.studentId = S.studentId
    JOIN parentAcknowledgement PA ON F.studentId = PA.studentId
    JOIN doctor D ON F.doctorMCR = D.doctorMCR
    WHERE F.courseDate = ?`;
    return query(sql, [courseDate])
        .then((result) => {
            if (result.length === 0) {
                throw new Error("Submission not found");
            }
            return result;
        })
        .catch((error) => {
            throw new Error(error);
        })
}

module.exports.retrieveSubmissionByEligibility= function retrieveSubmissionByEligibility(eligibility1, eligibility2) {
    const sql = `SELECT *
    FROM form F
    JOIN student S ON F.studentId = S.studentId
    JOIN parentAcknowledgement PA ON F.studentId = PA.studentId
    JOIN doctor D ON F.doctorMCR = D.doctorMCR
    WHERE F.eligibility IN (?, ?);`;
    return query(sql, [eligibility1, eligibility2])
        .then((result) => {
            if (result.length === 0) {
                throw new Error("Submission not found");
            }
            return result;
        })
        .catch((error) => {
            throw new Error(error);
        })
}

module.exports.updateSubmissionStatus = function updateSubmissionStatus(formStatus, studentId) {
    const sql = `UPDATE form 
                 SET formStatus = ?
                 WHERE studentId = ?;`;
       return query(sql, [formStatus, studentId])
           .then((result) => {
              
               return result;
           }
           )
           .catch((error) => {
               throw new Error(error);
           });
};



