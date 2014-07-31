// SETUP A LISTENING SERVER
var express = require('express');
var app = express();

var apiGate = require('../index.js');
var gate = new apiGate();

gate.guard('./test/endpoints/user');

app.use(gate.middleware);

app.listen(3131, function () {
  console.log('started listening on port 3131');
  require('api_test.js');
});

