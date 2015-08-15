var canvas = document.body.appendChild(document.createElement('canvas')),
    shaders  = require('./shaders.js'),
    context  = require('./context.js')(canvas, shaders.shader),
    buffer   = require('./buffer.js')(context),
    mat4     = require('gl-matrix').mat4,
    vec3     = require('gl-matrix').vec3,
    dat      = require('dat-gui'),
    spatial  = require('./spatial.js');

var gl = context.gl,
    modelViewMatrixLocation = buffer.modelViewMatrixLocation,
    projectionMatrixLocation = buffer.projectionMatrixLocation;

var controls = {
    fov: 60,
    positionX: 0,
    positionY: 0,
    positionZ: 1000,
    lookatX: 0.1, // Dat gui workaround part 1:
    lookatY: 0.1, // Slider values are only shown as floats
    lookatZ: 0.1  // when initialized to positive number.
}

var gui = new dat.GUI();
gui.add(controls, 'fov', 1, 179).onChange(drawScene);
gui.add(controls, 'positionX', -1000, 1000).onChange(drawScene);
gui.add(controls, 'positionY', -1000, 1000).onChange(drawScene);
gui.add(controls, 'positionZ', -1000, 1000).onChange(drawScene);
gui.add(controls, 'lookatX', -1, 1).listen().onChange(drawScene); // Dat gui workaround part 2:
gui.add(controls, 'lookatY', -1, 1).listen().onChange(drawScene); // Listen to changes.
gui.add(controls, 'lookatZ', -1, 1).listen().onChange(drawScene);

controls.lookatX = 0  // Dat gui workaround part 3:
controls.lookatY = 0  // Set correct initial values.
controls.lookatZ = -1

gui.open();

function drawScene() {
    var fov = spatial.degToRad(controls.fov),
        position = [controls.positionX, controls.positionY, controls.positionZ],
        target = [
          controls.positionX + controls.lookatX,
          controls.positionY + controls.lookatY,
          controls.positionZ + controls.lookatZ
        ],
        aspect = canvas.clientWidth / canvas.clientHeight,

        width = gl.drawingBufferWidth,
        height = gl.drawingBufferHeight;

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, width, height)

    var v = new Float32Array(3);
    vec3.subtract(v, target, position);
    vec3.cross(v, v, [0, 0, 1]);

    var up = vec3.squaredLength(v) < 0.00001 ? [0, -1, 0] : [0, 0, -1];

    var mv = new Float32Array(16);
    mat4.lookAt(mv, position, target, up);

    var s = new Float32Array(16);
    mat4.fromScaling(s, [1, -1, 1]);
    mat4.mul(mv, s, mv);

    gl.uniformMatrix4fv(modelViewMatrixLocation, false, mv);

    var p = new Float32Array(16);
    mat4.perspective(p, fov, aspect, 1, 11000);
    gl.uniformMatrix4fv(projectionMatrixLocation, false, p);

    gl.drawArrays(gl.TRIANGLES, 0, 9 * 6);
};

require('./resize.js')(canvas, drawScene);
