// Define a series of responses that the endpoints can use
var respond = function respond(req, res) {
  this.req = req;
  this.res = res;
  // We hook this object to the res object
  res.apiRes = this;
};


respond.prototype = {
  /**
   * @param {object} data
   * @param {number=} statusCode
   */
  success: function (data, statusCode) {
    this.res.setHeader("Content-Type", "application/json");
    this.res.statusCode = statusCode ? statusCode : 200;
    try{
      this.res.end(JSON.stringify(data));
    } catch (e) {
      this.error('Error parsing response')
    }
  },
  /**
   * @param {string} msg
   * @param {number=} statusCode
   */
  error: function (msg, statusCode) {
    this.res.setHeader("Content-Type", "application/json");
    this.res.statusCode = statusCode ? statusCode : 500;
    this.res.end(JSON.stringify({
      error: msg.toString()
    }));
  }
};

module.exports = respond;