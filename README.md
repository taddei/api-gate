api-gate
========

###How to install
To install apiGate just add it to your package json
```
$ npm install --save api-gate
```

###How to use
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
        res.end('try calling api.yourdomain.com/user');
    }
});

```


###Express middleware
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

