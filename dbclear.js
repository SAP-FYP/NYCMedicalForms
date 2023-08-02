const { query } = require('./database'); // Import from db.js
//////////////////////////////////////////////////////
// DROP ALL TABLES
//////////////////////////////////////////////////////
const DROP_TABLE_SQL = `
DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS \`group\`;
DROP TABLE IF EXISTS groupPerm;
DROP TABLE IF EXISTS permission;
DROP TABLE IF EXISTS doctor;
DROP TABLE IF EXISTS student;
DROP TABLE IF EXISTS parentAcknowledgement;
DROP TABLE IF EXISTS form;
DROP TABLE IF EXISTS registrationForm;
DROP TABLE IF EXISTS race;
DROP TABLE IF EXISTS school;
`;


return query(DROP_TABLE_SQL)
.then(function (result) {
    console.log('Tables dropped');
})
.catch(function (error) {
    if (error.code === 'ER_TABLE_EXISTS_ERROR') {
        throw new Error('Table already exists');
    }
    
    throw error;
});