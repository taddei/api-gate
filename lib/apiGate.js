var parsers = require('./parsers.js');
var responder = require('./responder.js');
var merge = require('lodash.merge');

var path = require('path');
var url = require('url');
var fs = require('fs');

var formidable = require('formidable');

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


  // clean files created
  var filesMovedToTmp = {};
  var cleanFilesCreated = function () {
    for(var prop in filesMovedToTmp){
      var fileToDel = filesMovedToTmp[prop];
      try {
        fs.unlinkSync(fileToDel.path);
      } catch (e){
        // do nothing, maybe moved somewhere else
      }
    }
  };
  res.on('close', cleanFilesCreated);
  res.on('finish', cleanFilesCreated);


  // Add a form parser
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    filesMovedToTmp = files;

    // Attach the fields to the body
    req.body = fields;
    // Add also the files in the same object
    for(var prop in filesMovedToTmp){
      req.body[prop] = filesMovedToTmp[prop];
    }

    that.route(req, res);
  });
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
    res.apiError('api endpoint ('+urlComponents[0]+') does not exist', 404);
    return true;
  }
  // check if the api section has a handler for the request method
  if(!this.gates[section][req.method] || !this.gates[section][req.method].handler){
    res.apiError('This method is not supported ('+req.method+')', 405);
    return true;
  }

  // merge together URL and BODY params
  var urlParams = parsedUrl.query;
  var bodyParams = req.body;
  var parsedParams = merge({}, urlParams, bodyParams);

  var params = {};
  var currentEndpoint = this.gates[section][req.method];
  var schema = currentEndpoint.schema || {};

  // parse params depending on schema
  var keys = Object.keys(schema);
  for(var i = 0, l = keys.length; i < l; ++i){
    var paramName = keys[i];
    var paramValue = parsedParams[paramName];
    // test if param is valid
    if(!schema[paramName](paramValue)) return  res.apiError('Invalid param ' + paramName, 400);
    params[paramName] = paramValue;
  }

  // DONE, dispatch call
  this.gates[section][req.method].handler(req, res, params);
  return true;
};

module.exports = ApiGate;
module.exports.propTypes = require('./validator');