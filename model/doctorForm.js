const conn = require('../database');
const { query, pool } = conn;

const {
  UserNotFoundError,
  DUPLICATE_ENTRY_ERROR,
  EMPTY_RESULT_ERROR,
  WRONG_VALUE_FOR_FIELD
} = require('../errors');

module.exports.matchDoctorInfo = function matchDoctorInfo(doctorMCR) {
  const sql = `SELECT * FROM doctor WHERE doctorMCR = ?;`;
  return query(sql, [doctorMCR])
    .then(result => {
      const rows = result[0];
      console.log(rows);
      if (rows.length === 0) {
        throw new UserNotFoundError('No doctor found with the provided MCR');
      }
      return rows;
    })
};

module.exports.postDoctorInfo = function postDoctorInfo(doctorMCR, physicianName, encryptedsignatureInfo, clinicName, clinicAddress, doctorContact) {
  const sql = `INSERT INTO doctor (doctorMCR, nameOfDoctor, signature, nameOfClinic, clinicAddress, contactNo) VALUES (?,?,?,?,?,?)`;
  return query(sql, [doctorMCR, physicianName, encryptedsignatureInfo, clinicName, clinicAddress, doctorContact])
    .then(result => {
      const affectedRows = result[0].affectedRows;
      if (affectedRows === 0) {
        throw new Error("No rows inserted");
      }
      return result;
    })
    .catch(error => {
      console.error('Error in postDoctorInfo:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        // Handle duplicate entry error
        throw new DUPLICATE_ENTRY_ERROR('Doctor Duplicate entry');
      }
      else if (error.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD') {
        throw new WRONG_VALUE_FOR_FIELD('Wrong value type for field');
      }
      else if (error.message === 'No rows inserted') {
        throw new Error('No rows inserted');
      }
      throw new Error('Database error');
    });
};

module.exports.postStudentInfo = function postStudentInfo(studentNRIC, studentName, dateOfBirth, studentClass, schoolName, dateOfVaccine) {
  const sql = `INSERT INTO student (studentNRIC,nameOfStudent,dateOfBirth,class,school,dateOfVaccination) VALUES (?,?,?,?,?,?)`;
  return query(sql, [studentNRIC, studentName, dateOfBirth, studentClass, schoolName, dateOfVaccine])
    .then(result => {
      const affectedRows = result[0].affectedRows;
      if (affectedRows === 0) {
        throw new Error("No rows inserted");
      }
      return result;
    })
    .catch(error => {
      console.error('Error in postFormInfo:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        // Handle duplicate entry error
        throw new DUPLICATE_ENTRY_ERROR('Form Duplicate entry');
      }
      else if (error.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD') {
        throw new WRONG_VALUE_FOR_FIELD('Wrong value type for field');
      }
      else if (error.message === 'No rows inserted') {
        throw new Error('No rows inserted');
      }
      throw new Error('Database error');
    });
};

module.exports.postFormInfo = function postFormInfo(studentId, courseDate, doctorMCR, eligibility, comments, date) {
  const sql = `INSERT INTO form (studentId,courseDate,doctorMCR,eligibility,comments,examinationDate) VALUES (?,?,?,?,?,?)`;
  return query(sql, [studentId, courseDate, doctorMCR, eligibility, comments, date])
    .then(result => {
      const affectedRows = result[0].affectedRows;
      if (affectedRows === 0) {
        throw new Error("No rows inserted");
      }
      return result;
    })
    .catch(error => {
      console.error('Error in postFormInfo:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        // Handle duplicate entry error
        throw new DUPLICATE_ENTRY_ERROR('Form Duplicate entry');
      }
      else if (error.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD') {
        throw new WRONG_VALUE_FOR_FIELD('Wrong value type for field');
      }
      else if (error.message === 'No rows inserted') {
        throw new Error('No rows inserted');
      }
      throw new Error('Database error');
    });
};

module.exports.updateFormStatus = function updateFormStatus(studentId) {
  const sql = `UPDATE form SET formStatus = 'Pending Parent' WHERE studentId = ?`;
  return query(sql, [studentId])
    .then(result => {
      const affectedRows = result[0];
      if (affectedRows === 0) {
        throw new Error("No rows updated");
      }
      return affectedRows;
    }).catch((error) => {
      if (error.code === 'ER_DUP_ENTRY') {
        // Handle duplicate entry error
        throw new DUPLICATE_ENTRY_ERROR('Student Duplicate entry');
      }
      else if (error.message === 'No rows updated') {
        throw new Error('No rows updated');
      }
      throw new Error('Database error');
    });
};

module.exports.getClasses = function getClasses() {
  const sql = `SELECT S.class
  FROM form F
  JOIN student S ON F.studentId = S.studentId
  JOIN doctor D ON F.doctorMCR = D.doctorMCR
  GROUP BY S.class
  ORDER BY S.class ASC;
  `;
  return query(sql).then(function (result) {
    const rows = result;
    // console.log(result);
    if (rows.length === 0) {
      throw new EMPTY_RESULT_ERROR('No Classes Found');
    }
    return rows;
  });
};

module.exports.getCourseDates = function getCourseDates() {
  const sql = `SELECT F.courseDate
  FROM form F
  JOIN student S ON F.studentId = S.studentId
  JOIN doctor D ON F.doctorMCR = D.doctorMCR
  GROUP BY F.courseDate
  ORDER BY F.courseDate ASC;
  `;
  return query(sql).then(function (result) {
    const rows = result;
    if (rows.length === 0) {
      throw new EMPTY_RESULT_ERROR('No Course Dates Found');
    }
    return rows;
  });
};

module.exports.getSchools = function getSchools() {
  const sql = `SELECT * FROM school`;
  return query(sql).then(function (result) {
    const rows = result;
    if (rows.length === 0) {
      throw new EMPTY_RESULT_ERROR('No Schools Found');
    }
    return rows;
  });
};

module.exports.getSchoolsFilter = function getSchoolsFilter(limit, offset) {
  const sql = `SELECT S.school
  FROM form F
  JOIN student S ON F.studentId = S.studentId
  JOIN doctor D ON F.doctorMCR = D.doctorMCR
  GROUP BY S.school
  ORDER BY S.school ASC;`
  return query(sql).then(function (result) {
    const rows = result;
    if (rows.length === 0) {
      throw new EMPTY_RESULT_ERROR('No Schools Found');
    }
    return rows;
  });
};

module.exports.getEligibility = function getEligibility(limit, offset) {
  const sql = `SELECT F.eligibility
  FROM form F
  JOIN student S ON F.studentId = S.studentId
  JOIN doctor D ON F.doctorMCR = D.doctorMCR
  GROUP BY F.eligibility
  ORDER BY F.eligibility ASC;
  `;
  return query(sql).then(function (result) {
    const rows = result;
    if (rows.length === 0) {
      throw new EMPTY_RESULT_ERROR('No Course Dates Found');
    }
    return rows;
  });
};

module.exports.getClassFilterBySchool = function getClassFilterBySchool(schoolName) {
  const sql = `SELECT S.class
  FROM form F
  JOIN student S ON F.studentId = S.studentId
  JOIN doctor D ON F.doctorMCR = D.doctorMCR
  WHERE S.school = ?
  GROUP BY S.class
  ORDER BY S.class ASC;
  `;
  return query(sql, [schoolName]).then(function (result) {
    const rows = result;
    if (rows.length === 0) {
      throw new EMPTY_RESULT_ERROR('No Course Dates Found');
    }
    return rows;
  });
}

module.exports.getCourseDateBySchool = function getCourseDateBySchool(schoolName) {
  const sql = `SELECT F.courseDate
  FROM form F
  JOIN student S ON F.studentId = S.studentId
  JOIN doctor D ON F.doctorMCR = D.doctorMCR
  WHERE S.school = ?
  GROUP BY F.courseDate
  ORDER BY F.courseDate ASC;
  `;
  return query(sql, [schoolName]).then(function (result) {
    const rows = result;
    if (rows.length === 0) {
      throw new EMPTY_RESULT_ERROR('No Course Dates Found');
    }
    return rows;
  });
}

module.exports.getCourseDateBySchoolAndClass = function getCourseDateBySchoolAndClass(schoolName, className) {
  const sql = `SELECT F.courseDate
  FROM form F
  JOIN student S ON F.studentId = S.studentId
  JOIN doctor D ON F.doctorMCR = D.doctorMCR
  WHERE S.school = ? AND S.class = ?
  GROUP BY F.courseDate
  ORDER BY F.courseDate ASC;
  `;
  return query(sql, [schoolName, className]).then(function (result) {
    const rows = result;
    if (rows.length === 0) {
      throw new EMPTY_RESULT_ERROR('No Course Dates Found');
    }
    return rows;
  });
}

module.exports.getSchoolsByClass = function getSchoolsByClass(className) {
  const sql = `SELECT S.school
  FROM form F
  JOIN student S ON F.studentId = S.studentId
  JOIN doctor D ON F.doctorMCR = D.doctorMCR
  WHERE S.class = ?
  GROUP BY S.school
  ORDER BY S.school ASC;
  `;
  return query(sql, [className]).then(function (result) {
    const rows = result;
    if (rows.length === 0) {
      throw new EMPTY_RESULT_ERROR('No Course Dates Found');
    }
    return rows;
  });
}

module.exports.getSchoolsByCourseDate = function getSchoolsByCourseDate(courseDate) {
  const sql = `SELECT S.school
  FROM form F
  JOIN student S ON F.studentId = S.studentId
  JOIN doctor D ON F.doctorMCR = D.doctorMCR
  WHERE F.courseDate = ?
  GROUP BY S.school
  ORDER BY S.school ASC;
  `;
  return query(sql, [courseDate]).then(function (result) {
    const rows = result;
    if (rows.length === 0) {
      throw new EMPTY_RESULT_ERROR('No Course Dates Found');
    }
    return rows;
  }
  );
}

module.exports.getSchoolsByCourseDateAndClass = function getSchoolsByCourseDateAndClass(courseDate, className) {
  const sql = `SELECT S.school
  FROM form F
  JOIN student S ON F.studentId = S.studentId
  JOIN doctor D ON F.doctorMCR = D.doctorMCR
  WHERE F.courseDate = ? AND S.class = ?
  GROUP BY S.school
  ORDER BY S.school ASC;
  `;
  return query(sql, [courseDate, className]).then(function (result) {
    const rows = result;
    if (rows.length === 0) {
      throw new EMPTY_RESULT_ERROR('No Course Dates Found');
    }
    return rows;
  }
  );
}




module.exports.getStudentFormStatus = function getStudentFormStatus(studentNRIC) {
  const sql = `
    SELECT s.studentId, f.formStatus
    FROM student s
    JOIN form f ON s.studentId = f.studentId
    WHERE s.studentNRIC = ?;

  `;
  return query(sql, [studentNRIC])
    .then(result => {
      const rows = result[0];
      if (rows.length === 0) {
        throw new EMPTY_RESULT_ERROR('No students Found');
      }
      return rows;
    });
}

module.exports.deleteStudentForm = async function deleteStudentForm(studentId, formStatus) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    if (formStatus === 'Pending Parent') {
      console.log('deleting parentAcknowledgement...')
      const sql0 = `DELETE FROM parentAcknowledgement WHERE studentId = ?`;
      const result0 = await connection.query(sql0, [studentId])
      const affectedRows0 = result0[0].affectedRows;
      if (affectedRows0 === 0) {
        throw new Error('Unable to delete parent acknowledgements');
      }
    }

    //delete students with id inside arr 
    console.log('deleting student...')
    const sql1 = `DELETE FROM student WHERE studentId = ?`;
    const result1 = await connection.query(sql1, studentId)
    const affectedRows1 = result1[0].affectedRows;
    if (affectedRows1 === 0) {
      throw new Error('Unable to delete student');
    }

    // delete form with student id in arr
    console.log('deleting form...')
    const sql2 = `DELETE FROM form WHERE studentId = ?`;
    const result2 = await connection.query(sql2, [studentId])
    const affectedRows2 = result2[0].affectedRows;
    if (affectedRows2 === 0) {
      throw new Error('Unable to delete form');
    }

    await connection.commit();
    return affectedRows2;
  }
  catch (error) {
    console.log(error)
    await connection.rollback();
    throw error;
  }
  finally {
    connection.release();
  };
};