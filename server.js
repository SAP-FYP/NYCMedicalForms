require("dotenv").config();

const http = require("http");
const app = require(`./app`);
const server = http.createServer(app);

const port = process.env.PORT || 3000;

server.listen(port, function () {
    console.log(`App is listening to PORT ${port}`);
});