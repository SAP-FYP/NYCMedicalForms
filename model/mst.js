const conn = require('../database');
const { query } = conn;

module.exports.updateSubmissionReview = function updateSubmissionReview(review, studentId) {
    const sql = `UPDATE form 
                 SET review = ?
                 WHERE studentId = ?;`;
       return query(sql, [review, studentId])
           .then((result) => {
              
               return result;
           }
           )
           .catch((error) => {
               throw new Error(error);
           });
};