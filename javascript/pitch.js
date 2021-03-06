var canvas = document.body.appendChild(document.createElement('canvas')),
    shaders  = require('./shaders.js'),
    context  = require('./context.js')(canvas, shaders.shader),
    buffer   = require('./buffer.js')(context),
    mat4     = require('gl-matrix').mat4,
    dat      = require('dat-gui'),
    spatial  = require('./spatial.js');

var gl = context.gl,
    modelViewMatrixLocation = buffer.modelViewMatrixLocation,
    projectionMatrixLocation = buffer.projectionMatrixLocation;

var controls = {
    fov: 60,
    x: 0,
    y: 0,
    z: 0, // Dat gui workaround part 1: Does not handle initial negative values
    pitch: 0,
    bearing: 0
}

var gui = new dat.GUI();
gui.add(controls, 'fov', 1, 179).onChange(drawScene);
gui.add(controls, 'x', -1000, 1000).onChange(drawScene);
gui.add(controls, 'y', -1000, 1000).onChange(drawScene);
gui.add(controls, 'z', -3000, 0).listen().onChange(drawScene); // Dat gui workaround part 2: Listen
gui.add(controls, 'pitch', 0, 90).onChange(drawScene);
gui.add(controls, 'bearing', 0, 360).onChange(drawScene);

controls.z = -1000; // Dat gui workaround part 3: Set negative initial value.

gui.open();

function drawScene() {
    var fov = spatial.degToRad(controls.fov),
        pitch = spatial.degToRad(controls.pitch),
        bearing = spatial.degToRad(controls.bearing),
        aspect = canvas.clientWidth / canvas.clientHeight,

        width = gl.drawingBufferWidth,
        height = gl.drawingBufferHeight;

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, width, height)

    var mv = new Float32Array(16);
    mat4.fromTranslation(mv, [0, 0, controls.z]);
    mat4.rotateX(mv, mv, -pitch);
    mat4.rotateZ(mv, mv, bearing);
    mat4.translate(mv, mv, [-controls.x, controls.y, 0]);

    var s = new Float32Array(16);
    mat4.fromScaling(s, [-1, 1, 1]);
    mat4.mul(mv, s, mv);

    gl.uniformMatrix4fv(modelViewMatrixLocation, false, mv);

    var p = new Float32Array(16);
    mat4.perspective(p, fov, aspect, 1, 11000);
    gl.uniformMatrix4fv(projectionMatrixLocation, false, p);

    gl.drawArrays(gl.TRIANGLES, 0, 9 * 6);
};

require('./resize.js')(canvas, drawScene);
