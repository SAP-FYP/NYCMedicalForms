const conn = require("../database");
const { query } = conn;

module.exports.retrieveAllSubmissions = function retrieveAllSubmissions() {
    const sql = `SELECT F.formId, S.studentId, S.studentNRIC, S.nameOfStudent, S.class, S.school, F.eligibility, F.courseDate, F.formStatus, F.comments, F.review
    FROM form F
    INNER JOIN student S ON F.studentId = S.studentId
    INNER JOIN doctor D ON F.doctorMCR = D.doctorMCR
    ORDER BY F.formId;
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

module.exports.retrieveSubmission = function retrieveSubmission(studentId) {
     const sql = `SELECT *
                  FROM form F
                  LEFT JOIN parentAcknowledgement PA ON F.studentId = PA.studentId
                  INNER JOIN student S ON F.studentId = S.studentId
                  INNER JOIN doctor D ON F.doctorMCR = D.doctorMCR
                  WHERE S.studentId= ?;`;
        return query(sql, [studentId])
            .then((result) => {
                if (result.length === 0) {
                    throw new Error("Student Id: " + studentId + " submission not found");
                }
                return result;
            }
            )
            .catch((error) => {
                throw new Error(error);
            });
};

module.exports.retrieveSubmissionBySearch = function retrieveSubmissionBySearch(searchInput) {
  const sql = `SELECT F.formId, S.studentId, S.studentNRIC, S.nameOfStudent, S.class, S.school, F.eligibility, F.courseDate, F.formStatus, F.comments, F.review
  FROM form F
  INNER JOIN student S ON F.studentId = S.studentId
  INNER JOIN doctor D ON F.doctorMCR = D.doctorMCR
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
    });
};

module.exports.updateSubmissionStatus = function updateSubmissionStatus(
  formStatus,
  studentId
) {
  const sql = `UPDATE form 
                 SET formStatus = ?
                 WHERE studentId = ?;`;
  return query(sql, [formStatus, studentId])
    .then((result) => {
      return result;
    })
    .catch((error) => {
      throw new Error(error);
    });
};

module.exports.getSubmissionByStatus = function getSubmissionByStatus(formStatus) {
  const sql = `SELECT F.formId, S.studentId, S.studentNRIC, S.nameOfStudent, S.class, S.school, F.eligibility, F.courseDate, F.formStatus, F.comments, F.review
  FROM form F
  INNER JOIN student S ON F.studentId = S.studentId
  INNER JOIN doctor D ON F.doctorMCR = D.doctorMCR
  WHERE F.formStatus = ?`;
  return query(sql, [formStatus])
    .then((result) => {
      return result;
    })
    .catch((error) => {
      throw new Error(error);
    });
};

module.exports.retrieveSubmissionByFilter = function retrieveSubmissionByFilter(
  filter
) {

  let conditions = "";
  let values = [];
  let count = 0;

  if (filter.school.length === 0 && filter.class.length === 0 &&filter.courseDate.length === 0 && filter.eligibility.length === 0) {
     conditions = "1=1";
    }

  if (filter.school.length !== 0) {
    conditions += "(S.school = ?";
    count += 1;
    if (filter.school.length > 1) {
      for (let i = 0; i < filter.school.length; i++) {
        if (i > 0) {
          conditions += " OR S.school = ?";
        }
        values.push(filter.school[i]);
      }
    } else {
      values.push(filter.school);
    }
    conditions += ")";
  }
  if (filter.class.length !== 0) {
    if (count > 0) {
      conditions += " AND ";
    }
    conditions += "(S.class = ?";
    count += 1;
    if (filter.class.length > 1) {
      for (let i = 0; i < filter.class.length; i++) {
        if (i > 0) {
          conditions += " OR S.class = ?";
        }
        values.push(filter.class[i]);
      }
    } else {
      values.push(filter.class);
    }
    conditions += ")";
  }
  if (filter.courseDate.length !== 0) {
    if (count > 0) {
      conditions += " AND ";
    }
    conditions += "(F.courseDate = ?";
    count += 1;
    if (filter.courseDate.length > 1) {
      for (let i = 0; i < filter.courseDate.length; i++) {
        if (i > 0) {
          conditions += " OR F.courseDate = ?";
        }
        values.push(filter.courseDate[i]);
      }
    } else {
      values.push(filter.courseDate);
    }
    conditions += ")";
  }
  if (filter.eligibility.length !== 0) {
    if (count > 0) {
      conditions += " AND ";
    }
    conditions += "(F.eligibility = ?";
    count += 1;
    if (filter.eligibility.length > 1) {
      for (let i = 0; i < filter.eligibility.length; i++) {
        if (i > 0) {
          conditions += " OR F.eligibility = ?";
        }
        values.push(filter.eligibility[i]);
      }
    } else {
      values.push(filter.eligibility);
    }
    conditions += ")";
  }

  const sql = `SELECT F.formId, S.studentId, S.studentNRIC, S.nameOfStudent, S.class, S.school, F.courseDate, F.eligibility, F.formStatus
                    FROM form F
                    JOIN student S ON F.studentId = S.studentId
                    JOIN doctor D ON F.doctorMCR = D.doctorMCR
                    WHERE ${conditions}`;
  // console.log(sql);
  // console.log(values);
  return query(sql, values)
    .then((result) => {
      if (result.length === 0) {
        throw new Error("Submission not found");
      }
      return result;
    }
    )
};
