var canvas = document.body.appendChild(document.createElement('canvas')),
    shaders  = require('./shaders.js'),
    context  = require('./context.js')(canvas, shaders.shader),
    buffer   = require('./buffer.js')(context),
    mat4     = require('gl-matrix').mat4,
    dat      = require('dat-gui'),
    fit      = require('canvas-fit');

var gl = context.gl,
    modelViewMatrixLocation = buffer.modelViewMatrixLocation,
    projectionMatrixLocation = buffer.projectionMatrixLocation;

var controls = {
    fov: 60,
    x: 0,
    y: 0,
    z: -1000,
    pitch: 0,
    bearing: 0
}

var gui = new dat.GUI();
gui.add(controls, 'fov', 1, 179).onChange(drawScene);
gui.add(controls, 'x', -1000, 1000).onChange(drawScene);
gui.add(controls, 'y', -1000, 1000).onChange(drawScene);
gui.add(controls, 'z', -10000, -2).onChange(drawScene);
gui.add(controls, 'pitch', 0, 90).onChange(drawScene);
gui.add(controls, 'bearing', 0, 360).onChange(drawScene);
gui.open();

// Draw a the scene.
function drawScene() {
    var width = gl.drawingBufferWidth
    var height = gl.drawingBufferHeight

    // Clear the canvas.
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, width, height)

    var aspect = canvas.clientWidth / canvas.clientHeight;

    var mv = new Float32Array(16);
    mat4.fromTranslation(mv, [0, 0, controls.z]);
    mat4.rotateX(mv, mv, -degToRad(controls.pitch));
    mat4.rotateZ(mv, mv, degToRad(controls.bearing));
    mat4.translate(mv, mv, [-controls.x, controls.y, 0]);

    var s = new Float32Array(16);
    mat4.fromScaling(s, [-1, 1, 1]);
    mat4.mul(mv, s, mv);

    gl.uniformMatrix4fv(modelViewMatrixLocation, false, mv);

    var p = new Float32Array(16);
    mat4.perspective(p, degToRad(controls.fov), aspect, 1, 11000);
    gl.uniformMatrix4fv(projectionMatrixLocation, false, p);

    // Draw the rectangle.
    gl.drawArrays(gl.TRIANGLES, 0, 9 * 6);
};

function degToRad(d) {
    return d * Math.PI / 180;
};

window.addEventListener('resize', onResize, false)

function onResize() {
    fit(canvas);
    drawScene();
};

onResize();
