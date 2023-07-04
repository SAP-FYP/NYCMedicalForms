const conn = require('../database');
const { query } = conn;

module.exports.updateSubmissionComment = function updateSubmissionComment(review, studentId) {
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