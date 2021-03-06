// Define a series of responses that the endpoints can use
var responder = function responder(req, res) {
  this.req = req;
  this.res = res;
  // We hook this object to the res object
  res.reply = function (statusCode, data) {
    res.setHeader("Content-Type", "application/json");
    res.statusCode = statusCode ? statusCode : 200;
    try{
      res.end(JSON.stringify(data));
    } catch (e) {
      this.error('Error parsing response')
    }
  };

  res.apiSuccess = function (data, statusCode) {
    res.reply(statusCode, data);
  };
  res.apiError = function (msg, statusCode) {
    res.reply(( statusCode || 500 ), {'error': msg});
  };
};
module.exports = responder;