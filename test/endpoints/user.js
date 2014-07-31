var propType = require('../../index.js').propType;

var user = {};

// read a user info
user.GET = {
  handler: function(req, res, params){
    res.apiRes(200, {});
  },
  schema : {
    id: propType.isAlpha
  }
};

module.exports = user;