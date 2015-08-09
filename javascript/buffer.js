'use strict'

var tileData = require('./data/tiledata.js');

module.exports = createBuffer;

function createBuffer(context) {
    var gl = context.gl,
        program = context.program;

    // look up where the vertex data needs to go.
    var positionLocation = gl.getAttribLocation(program, "a_position");
    var colorLocation = gl.getAttribLocation(program, "a_color");

    // lookup uniforms
    var modelViewMatrixLocation = gl.getUniformLocation(program, "u_modelViewMatrix");
    var projectionMatrixLocation = gl.getUniformLocation(program, "u_projectionMatrix");

    // Create a buffer for vertices.
    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tileData.positions), gl.STATIC_DRAW);

    // Create a buffer for colors.
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.enableVertexAttribArray(colorLocation);
    gl.vertexAttribPointer(colorLocation, 3, gl.UNSIGNED_BYTE, true, 0, 0);
    gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(tileData.colors), gl.STATIC_DRAW);

    return {
      modelViewMatrixLocation: modelViewMatrixLocation,
      projectionMatrixLocation: projectionMatrixLocation
    }
}

