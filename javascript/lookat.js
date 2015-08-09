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
    cameraX: 0,
    cameraY: 0,
    cameraZ: 1000,
    targetX: 0,
    targetY: 0,
    targetZ: 0,
}

var gui = new dat.GUI();
gui.add(controls, 'fov', 1, 179).onChange(drawScene);
gui.add(controls, 'cameraX', -1000, 1000).onChange(drawScene);
gui.add(controls, 'cameraY', -1000, 1000).onChange(drawScene);
gui.add(controls, 'cameraZ', -3000, 3000).onChange(drawScene);
gui.add(controls, 'targetX', -1000, 1000).onChange(drawScene);
gui.add(controls, 'targetY', -1000, 1000).onChange(drawScene);
gui.add(controls, 'targetZ', -1000, 1000).onChange(drawScene);
gui.open();

// Draw a the scene.
function drawScene() {
    var fov = spatial.degToRad(controls.fov),
        position = [controls.cameraX, controls.cameraY, controls.cameraZ],
        target = [controls.targetX, controls.targetY, controls.targetZ],
        aspect = canvas.clientWidth / canvas.clientHeight,

        width = gl.drawingBufferWidth,
        height = gl.drawingBufferHeight;

    // Clear the canvas.
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

    // Draw the tiles.
    gl.drawArrays(gl.TRIANGLES, 0, 9 * 6);
};

require('./resize.js')(canvas, drawScene);
