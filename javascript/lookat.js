"use strict"

$(function () {
    main();
});

var main = function () {
    // Get A WebGL context    // Get A WbGL context
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
    var cameraPosition = [0, 0, 1000];
    var target = [0, 0, 0];

    // Setup a ui.
    $("#fov").gmanSlider({ value: radToDeg(fov), slide: updateFov, min: 1, max: 179 });

    $("#cameraPositionX").gmanSlider({ value: cameraPosition[0], slide: updateCameraPosition(0), min: -1000, max: 1000 });
    $("#cameraPositionY").gmanSlider({ value: cameraPosition[1], slide: updateCameraPosition(1), min: -1000, max: 1000 });
    $("#cameraPositionZ").gmanSlider({ value: cameraPosition[2], slide: updateCameraPosition(2), min: -1000, max: 1000 });

    $("#targetX").gmanSlider({ value: target[0], slide: updateTarget(0), min: -1000, max: 1000 });
    $("#targetY").gmanSlider({ value: target[1], slide: updateTarget(1), min: -1000, max: 1000 });
    $("#targetZ").gmanSlider({ value: target[2], slide: updateTarget(2), min: -1000, max: 1000 });

    function updateFov(event, ui) {
        fov = degToRad(ui.value);
        drawScene();
    }

    function updateCameraPosition(index) {
        return function (event, ui) {
            cameraPosition[index] = ui.value;
            drawScene();
        }
    }

    function updateTarget(index) {
        return function (event, ui) {
            target[index] = ui.value;
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

        var v = new Float32Array(3);
        vec3.subtract(v, target, cameraPosition);
        vec3.cross(v, v, [0, 0, 1]);

        var up = vec3.squaredLength(v) < 0.00001 ? [0, -1, 0] : [0, 0, -1];

        var mv = new Float32Array(16);
        mat4.lookAt(mv, cameraPosition, target, up);

        var s = new Float32Array(16);
        mat4.fromScaling(s, [1, -1, 1]);
        mat4.mul(mv, s, mv);

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