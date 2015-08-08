var canvas = document.body.appendChild(document.createElement('canvas'));
var shaders  = require('./shaders.js');
var gl       = require('./context.js')(canvas, shaders.shader);