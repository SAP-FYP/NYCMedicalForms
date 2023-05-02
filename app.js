const express = require("express");
const bodyParser = require('body-parser');

const app = express();

const port = process.env.PORT || 3000;

const pool = require('./database'); //Import from db.js

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get('/', (req, res) => {
    res.send(`Server running on port ${port}`)

});

//////////////////////////////////////////////////////
// POST GET METHODS
// http://localhost:3000/api/
// Use Postman to test
//////////////////////////////////////////////////////
app.get('/api', async (req, res, next) => {
    console.log(req.query);

    res.json(req.query);
});

app.post('/api', async (req, res, next) => {
    console.log(req.body);

    res.json(req.body);
});
module.exports = app;