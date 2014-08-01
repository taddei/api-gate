api-gate
========
**This module is still under development. Please raise any issues for bugs of feature requests**

To install apiGate just add it to your package json
```
$ npm install --save api-gate
```

####How to use
Initialize a new apiGate instance and tell if what to guard. Give it a path to the endpoint module, that will be explained below, and watch a request.
```Javascript

// Require api-gate
var apiGate = require('api-gate');
var gate = apiGate();

// Tell it what to guard, by passing the path to the endpoint (see below)
gate.guard('./endpoints/user');

// now you can use it to guard a http request
var http = require('http');
var server = http.createServer(function (req, res) {
    if( gate.watch(req,res) === false ){
        res.end('try calling api.yourdomain.com:3000/user');
    }
});
server.listen(3000);
```

####Express middleware
ApiGate come also with a handy middleware for express. If the request is a valid api request no other script after this middleware will be called.
```Javascript
// To use it in an express app:
var express = require('express');
var app = express();

// like above, include api-gate and initialize it
var apiGate = require('api-gate');
var gate = apiGate();

// Tell it what to guard, by passing the path to the endpoint (see below)
gate.guard('./endpoints/user');

// Now use the ready-made middleware
app.use(gate.middleware);

app.listen(3000);
```

##Options
During initialization of the gate you can set some options like:
```Javascript
var apiGate = require('api-gate');
var options = {
    mergeParams: true,
    multiPart: false, // TODO
    subDomain: 'api'
};
var gate = apiGate(options);
```
**subdomain** (default: 'api') - The subdomain specific for your api

**mergeParams** (default: true) -
 If set to false, the params object will have the url and body params separated, otherwise they will be merged in one object
```
// Merge options
params = {urlParam: "foo", bodyParam1: "bar", otherUrlParam: "baz"};
// Disable merge options:
params = {
    URL: {
        urlParam: "foo",
        otherUrlParam: "baz"
    },
    BODY: {
        bodyParam1: "bar"
    }
}
```

##Endpoints
specifying an endpoint is quite straightforward. for each endpoint you can write handlers for each Http method and define a schema for it.
```Javascript
// user.js
var user = module.exports = {};

user.GET = {
    handler: function (req, res, params) {},
    schema: {}
};
```
#####Responses
apiGate has a small utility that help you reply to your api calls. Just use res.reply.
```Javascript
user.GET = {
    handler: function (req, res, params) {
        // reply with a success and 200 status code
        res.reply(200, {success: true});
    },
    schema: {}
};
```
#####Schema
Define the parameters that your endpoint needs and they will be parsed and verified for you beforehand. It uses **Validator** module and can be extended.
For more info visit the validator module https://www.npmjs.org/package/validator

```Javascript
var propTypes = require('api-gate').propTypes;

user.GET = {
    handler: function (req, res, params) {
        // Here params.id is a valid and tested parameter
        // reply with a success and 200 status code
        res.reply(200, {success: params.id});
    },
    schema: {
        id: propTypes.isAlphanumeric
    }
};
```