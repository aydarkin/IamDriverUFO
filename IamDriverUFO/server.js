'use strict';
//--scripts-prepend-node-pat для npm
var port = process.env.PORT || 80;
var http = require('http');
var express = require('express');
var app = express();

app.use(express.static("game"));

app.listen(port, '0.0.0.0')

app.get('/', function (req, res) {
    res.sendFile(__dirname + "/index.html");

});