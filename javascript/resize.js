'use strict'

var fit = require('canvas-fit');

module.exports = resize;

function resize(canvas, cb) {
    window.addEventListener('resize', onResize, false)

    function onResize() {
        fit(canvas);
        cb();
    };

    onResize();
}