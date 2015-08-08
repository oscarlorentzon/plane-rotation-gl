"use strict"

$(function () {
    main();
});

var main = function () {
    // Get A WebGL context
    var canvas = document.getElementById("canvas");
    var gl = getWebGLContext(canvas);
    if (!gl) {
        return;
    }

    // setup GLSL program
    var program = createProgramFromScripts(gl, ["2d-vertex-shader", "2d-fragment-shader"]);
    gl.useProgram(program);

    // look up where the vertex data needs to go.
    var positionLocation = gl.getAttribLocation(program, "a_position");
    var colorLocation = gl.getAttribLocation(program, "a_color");

    // lookup uniforms
    var modelViewMatrixLocation = gl.getUniformLocation(program, "u_modelViewMatrix");
    var projectionMatrixLocation = gl.getUniformLocation(program, "u_projectionMatrix");

    // Create a buffer.
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    setTiles(gl);

    // Create a buffer for colors.
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(colorLocation);
    gl.vertexAttribPointer(colorLocation, 3, gl.UNSIGNED_BYTE, true, 0, 0);

    // Set Colors.
    setColors(gl);

    var fov = Math.PI / 3;
    var translation = [0, 0, -1000];
    var rotation = [0, 0, 0];

    // Setup a ui.
    $("#fov").gmanSlider({ value: radToDeg(fov), slide: updateFov, min: 1, max: 179 });
    $("#x").gmanSlider({ slide: updateTranslation(0), min: -canvas.width, max: canvas.width });
    $("#y").gmanSlider({ slide: updateTranslation(1), min: -canvas.height, max: canvas.height });
    $("#z").gmanSlider({ value: translation[2], slide: updateTranslation(2), min: -10000, max: -2 });
    $("#pitch").gmanSlider({ slide: updateRotation(0), max: 90 });
    $("#bearing").gmanSlider({ slide: updateRotation(2), max: 360 });

    function updateFov(event, ui) {
        fov = degToRad(ui.value);
        drawScene();
    }

    function updateTranslation(index) {
        return function (event, ui) {
            translation[index] = ui.value;
            drawScene();
        }
    }

    function updateRotation(index) {
        return function (event, ui) {
            rotation[index] = degToRad(ui.value);
            drawScene();
        }
    }

    function radToDeg(r) {
        return r * 180 / Math.PI;
    }

    function degToRad(d) {
        return d * Math.PI / 180;
    }

    // Draw a the scene.
    function drawScene() {
        // Clear the canvas.
        gl.clear(gl.COLOR_BUFFER_BIT);

        var aspect = canvas.clientWidth / canvas.clientHeight;

        var mv = new Float32Array(16);
        mat4.fromTranslation(mv, translation);
        mat4.rotateX(mv, mv, -rotation[0]);
        mat4.rotateZ(mv, mv, -rotation[2]);
        gl.uniformMatrix4fv(modelViewMatrixLocation, false, mv);

        var p = new Float32Array(16);
        mat4.perspective(p, fov, aspect, 1, 11000);
        gl.uniformMatrix4fv(projectionMatrixLocation, false, p);

        // Draw the rectangle.
        gl.drawArrays(gl.TRIANGLES, 0, 9 * 6);
    }

    function setColors(gl, value) {

        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Uint8Array(TileData.colors),
            gl.STATIC_DRAW);
    }

    // Fill the buffer with the values that define a rectangle.
    function setTiles(gl) {
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(TileData.positions),
            gl.STATIC_DRAW);
    }

    drawScene()
}