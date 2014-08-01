var propTypes = require('../../index.js').propTypes;

var user = {};

// read a user info
user.GET = {
  handler: function(req, res, params){
    res.reply(200, {success: true});
  },
  schema : {
    id: propTypes.isAlpha
  }
};

module.exports = user;