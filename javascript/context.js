'use strict'

module.exports = context;

function context(canvas, shaders) {
    function loadShader(gl, shaderSource, shaderType) {
        var shader = gl.createShader(shaderType);

        gl.shaderSource(shader, shaderSource);
        gl.compileShader(shader);

        return shader;
    }

    var gl = canvas.getContext('webgl') ||
             canvas.getContext('experimental-webgl');

    var program = gl.createProgram();

    for (var key in shaders) {
        if (Object.prototype.hasOwnProperty.call(shaders, key)) {

            var shaderType = key === 'vertex' ?
                gl.VERTEX_SHADER :
                gl.FRAGMENT_SHADER;

            var shader = loadShader(gl, shaders[key], shaderType)

            gl.attachShader(program, shader);
        }
    }

    gl.linkProgram(program);
    gl.useProgram(program);

    return gl;
};