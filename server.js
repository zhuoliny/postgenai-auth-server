const fs = require('fs');
const express = require('express');
const path = require("path");
const http = require('http');
const https = require('https');

const app = express();
app.use(express.static("."));
const port = process.env.PORT || 8080;

// sendFile will go here
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '/index.html'));
});

app.listen(port);
console.log('Server started at http://localhost:' + port);

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let userID;
let weekID;
app.post('/', function(req, res) {
    var query = req.body.params;

    userID = query['userID'];
    weekID = query['weekID'];
    res.send("params received.");
});

app.post('/finishPuzzle', function(req, res) {
    var category = req.body.response;
    fs.writeFile(path.join(__dirname, `/userdata/${userID}/category_week${weekID}.json`), category, 'utf8', function(err) {
        if (err) throw err;
        console.log('category updated');
    });
    res.send("a response received.");
});

app.get('/getCategory', function(req, res, next) {
    fs.readFile(path.join(__dirname, `/userdata/${userID}/category_week${weekID}.json`), 'utf8', (error, data) => {
        // if the reading process failed, throwing the error
        if (error) {
          // logging the error
          console.error(error);
          throw err;
        }
        res.json(JSON.parse(data));
    });
});