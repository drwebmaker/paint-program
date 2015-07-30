var elt = require('./elt');
var controls = require('../Controls/controls');

function createPaint(parent) {
  var canvas = elt("canvas", {width: 500, height: 300});
  var cx = canvas.getContext("2d");
  var toolbar = elt("div", {class: "toolbar"});
  for (var name in controls)
    toolbar.appendChild(controls[name](cx));

  var panel = elt("div", {class: "picturepanel"}, canvas);

  parent.appendChild(elt("div", null, panel, toolbar));
}

module.exports = createPaint;