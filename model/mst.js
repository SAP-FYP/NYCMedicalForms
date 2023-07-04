const conn = require('../database');
const { query } = conn;

module.exports.updateSubmissionComment = function updateSubmissionComment(comment, studentId) {
    const sql = `UPDATE form 
                 SET review = ?
                 WHERE studentId = ?;`;
       return query(sql, [comment, studentId])
           .then((result) => {
              
               return result;
           }
           )
           .catch((error) => {
               throw new Error(error);
           });
};