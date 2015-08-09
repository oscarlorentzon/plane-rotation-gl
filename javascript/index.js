var canvas = document.body.appendChild(document.createElement('canvas')),
    shaders  = require('./shaders.js'),
    context  = require('./context.js')(canvas, shaders.shader),
    tileData = require('./data/tiledata.js'),
    mat4     = require('gl-matrix').mat4,
    fit      = require('canvas-fit');

var gl = context.gl;
var program = context.program;

// look up where the vertex data needs to go.
var positionLocation = gl.getAttribLocation(program, "a_position");
var colorLocation = gl.getAttribLocation(program, "a_color");

// lookup uniforms
var modelViewMatrixLocation = gl.getUniformLocation(program, "u_modelViewMatrix");
var projectionMatrixLocation = gl.getUniformLocation(program, "u_projectionMatrix");

// Create a buffer for vertices.
var buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tileData.positions), gl.STATIC_DRAW);

// Create a buffer for colors.
var buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.enableVertexAttribArray(colorLocation);
gl.vertexAttribPointer(colorLocation, 3, gl.UNSIGNED_BYTE, true, 0, 0);
gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(tileData.colors), gl.STATIC_DRAW);

var fov = Math.PI / 3;
var translation = [0, 0, -1000];
var rotation = [0, 0, 0];

function updateFov(event, ui) {
    fov = degToRad(ui.value);
    drawScene();
};

function updateTranslation(index) {
    return function (event, ui) {
        translation[index] = ui.value;
        drawScene();
    }
};

function updateRotation(index) {
    return function (event, ui) {
        rotation[index] = degToRad(ui.value);
        drawScene();
    }
};

function radToDeg(r) {
    return r * 180 / Math.PI;
};

function degToRad(d) {
    return d * Math.PI / 180;
};

// Draw a the scene.
function drawScene() {
    var width = gl.drawingBufferWidth
    var height = gl.drawingBufferHeight

    // Clear the canvas.
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, width, height)

    var aspect = canvas.clientWidth / canvas.clientHeight;

    var mv = new Float32Array(16);
    mat4.fromTranslation(mv, [0, 0, translation[2]]);
    mat4.rotateX(mv, mv, -rotation[0]);
    mat4.rotateZ(mv, mv, rotation[2]);
    mat4.translate(mv, mv, [-translation[0], translation[1], 0]);

    var s = new Float32Array(16);
    mat4.fromScaling(s, [-1, 1, 1]);
    mat4.mul(mv, s, mv);

    gl.uniformMatrix4fv(modelViewMatrixLocation, false, mv);

    var p = new Float32Array(16);
    mat4.perspective(p, fov, aspect, 1, 11000);
    gl.uniformMatrix4fv(projectionMatrixLocation, false, p);

    // Draw the rectangle.
    gl.drawArrays(gl.TRIANGLES, 0, 9 * 6);
};

window.addEventListener('resize', onResize, false)

function onResize() {
    fit(canvas);
    drawScene();
};

onResize();
