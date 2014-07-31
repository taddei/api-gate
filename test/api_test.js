var http = require('http');
var assert = require('assert');

describe("Test connection", function () {
  it("call the api endpoint", function (done) {
    http.get('http://api.pheemo.com:3131', function (res){
      var response = [];
      res.on('data', function (chunk) {
        response.push(chunk);
      });
      res.on('end', function () {
        var result = Buffer.concat(response).toString();
        console.log(result);
        done();
      });
      res.on('error', function (err) {
        throw err;
      })
    })
  });
});