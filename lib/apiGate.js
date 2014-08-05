var parsers = require('./parsers.js');
var responder = require('./responder.js');
var merge = require('utils-merge');

var path = require('path');
var url = require('url');

var bodyParser = require('body-parser');

var ApiGate = function ApiGate (options) {
  if(!(this instanceof ApiGate)){
    return new ApiGate(options);
  }
  // parse and merge options
  options = options || {};
  this.options = {
    mergeParams: options.mergeParams || true,
    multiPart: options.multiPart || false,
    subDomain: options.subDomain || 'api'
  };

  // gates to guard ( use gate.guard() )
  this.gates = {};

  /**
   * express library utility
   */
  this.middleware = function (req, res, next) {
    if(this.watch(req, res) === false) next();
  }.bind(this);

};

/**
 * Add endpoints to guard with the api-gate
 * @param {string} pathToEndpoint give the path to load the endpoint
 * @param {object=} options
 */
ApiGate.prototype.guard = function (pathToEndpoint, options) {
  options = options || {};
  try{
    var gatePath = require.resolve(path.join(process.cwd(), pathToEndpoint));
    var gateName = options.name || path.basename(gatePath).replace(path.extname(gatePath), "");
    this.gates[gateName] = require(gatePath);
  } catch (err) {
    console.log(err)
  }
};

/**
 * If you don't use the express middleware you can hook this dispatch function inside your server directly.
 * If its not detected as an api call, it will return false, else true.
 * If its a wrong api call it will respond directly to the client with a valid JSON
 * @param {*} req
 * @param {*} res
 * @returns {boolean}
 */
ApiGate.prototype.watch = function (req, res) {
  var that = this;

  // check if the subDomain is present
  var host = parsers.hostname(req.hostname);
  if (host.subDomain !== this.options.subDomain) return false;

  // setup body parser
  var reqParser = bodyParser({extended: true});
  reqParser(req, res, function (err){
    if(err) return res.reply(500, 'Server error parsing request body');
    // pass the ball onto the routing function
    that.route(req, res);
  });
  return true;
};

ApiGate.prototype.route = function (req, res) {

  // Ok, the request is an api request, decode the request object
  // Add a responder utility
  new responder(req, res);

  // Split the url to find out its components
  var parsedUrl = url.parse(req.url, true);
  var urlComponents = parsedUrl.pathname.split('/');
  urlComponents.shift();

  // get the url parts we need
  var section = urlComponents[0];

  // check if the first url component matches the api
  if(!section || !this.gates[section]){
    res.reply(404, 'api endpoint ('+urlComponents[0]+') does not exist');
    return true;
  }
  // check if the api section has a handler for the request method
  if(!this.gates[section][req.method] || !this.gates[section][req.method].handler){
    res.reply(405, 'This method is not supported ('+req.method+')');
    return true;
  }

  // merge together URL and BODY params
  var urlParams = parsedUrl.query;
  var bodyParams = req.body;
  var parsedParams = {};
  if(this.options.mergeParams){
    parsedParams = merge({}, urlParams, bodyParams);
  } else {
    parsedParams.URL = urlParams;
    parsedParams.BODY = bodyParams;
  }

  var params = {};
  var currentEndpoint = this.gates[section][req.method];
  var schema = currentEndpoint.schema || {};

  // parse params depending on schema
  var keys = Object.keys(schema);
  for(var i = 0, l = keys.length; i < l; ++i){
    var paramName = keys[i];
    var paramValue = parsedParams[paramName];
    // test if param is valid
    if(!schema[paramName](paramValue)) return  res.reply(400, 'Invalid param ' + paramName);
    params[paramName] = paramValue;
  }

  // DONE, dispatch call
  this.gates[section][req.method].handler(req, res, params);
  return true;
};

module.exports = ApiGate;
module.exports.propTypes = require('./validator');