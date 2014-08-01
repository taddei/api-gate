api-gate
========
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
*mergeParams* (default: true) -
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