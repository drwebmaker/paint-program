(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var elt = require('../Helpers/elt');
var loadImageURL = require('../Helpers/loadImageURL');
var tools = require('../Tools/tools');

var controls = Object.create(null);

controls.tool = function(cx) {
  var select = elt("select");
  for (var name in tools)
    select.appendChild(elt("option", null, name));

  cx.canvas.addEventListener("mousedown", function(event) {
    if (event.which == 1) {
      tools[select.value](event, cx);
      event.preventDefault();
    }
  });

  return elt("span", null, "Tool: ", select);
};

controls.color = function(cx) {
  var input = elt("input", {type: "color", id: "color"});
  input.addEventListener("change", function() {
    cx.fillStyle = input.value;
    cx.strokeStyle = input.value;
  });
  return elt("span", null, "Color: ", input);
};

controls.brushSize = function(cx) {
  var select = elt("select");
  var sizes = [1, 2, 3, 5, 8, 12, 25, 35, 50, 75, 100];
  sizes.forEach(function(size) {
    select.appendChild(elt("option", {value: size},
      size + " pixels"));
  });
  select.addEventListener("change", function() {
    cx.lineWidth = select.value;
  });
  return elt("span", null, "Brush size: ", select);
};

controls.save = function(cx) {
  var link = elt("a", {href: "/"}, "Save");
  function update() {
    try {
      link.href = cx.canvas.toDataURL();
    } catch (e) {
      if (e instanceof SecurityError)
        link.href = "javascript:alert(" +
          JSON.stringify("Can't save: " + e.toString()) + ")";
      else
        throw e;
    }
  }
  link.addEventListener("mouseover", update);
  link.addEventListener("focus", update);
  return link;
};


controls.openFile = function(cx) {
  var input = elt("input", {type: "file"});
  input.addEventListener("change", function() {
    if (input.files.length == 0) return;
    var reader = new FileReader();
    reader.addEventListener("load", function() {
      loadImageURL(cx, reader.result);
    });
    reader.readAsDataURL(input.files[0]);
  });
  return elt("div", null, "Open file: ", input);
};

controls.openURL = function(cx) {
  var input = elt("input", {type: "text"});
  var form = elt("form", null,
    "Open URL: ", input,
    elt("button", {type: "submit"}, "load"));
  form.addEventListener("submit", function(event) {
    event.preventDefault();
    loadImageURL(cx, form.querySelector("input").value);
  });
  return form;
};

module.exports = controls;
},{"../Helpers/elt":3,"../Helpers/loadImageURL":6,"../Tools/tools":11}],2:[function(require,module,exports){
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
},{"../Controls/controls":1,"./elt":3}],3:[function(require,module,exports){
function elt(name, attributes) {
  var node = document.createElement(name);
  if (attributes) {
    for (var attr in attributes)
      if (attributes.hasOwnProperty(attr))
        node.setAttribute(attr, attributes[attr]);
  }
  for (var i = 2; i < arguments.length; i++) {
    var child = arguments[i];
    if (typeof child == "string")
      child = document.createTextNode(child);
    node.appendChild(child);
  }
  return node;
}

module.exports = elt;
},{}],4:[function(require,module,exports){
function forAllNeighbors(point, fn) {
  fn({x: point.x, y: point.y + 1});
  fn({x: point.x, y: point.y - 1});
  fn({x: point.x + 1, y: point.y});
  fn({x: point.x - 1, y: point.y});
}

module.exports = forAllNeighbors;
},{}],5:[function(require,module,exports){
function isSameColor(data, pos1, pos2) {
  var offset1 = (pos1.x + pos1.y * data.width) * 4;
  var offset2 = (pos2.x + pos2.y * data.width) * 4;
  for (var i = 0; i < 4; i++) {
    if (data.data[offset1 + i] != data.data[offset2 + i])
      return false;
  }
  return true;
}

module.exports = isSameColor;
},{}],6:[function(require,module,exports){
function loadImageURL(cx, url) {
  var image = document.createElement("img");
  image.addEventListener("load", function() {
    var color = cx.fillStyle, size = cx.lineWidth;
    cx.canvas.width = image.width;
    cx.canvas.height = image.height;
    cx.drawImage(image, 0, 0);
    cx.fillStyle = color;
    cx.strokeStyle = color;
    cx.lineWidth = size;
  });
  image.src = url;
}

module.exports = loadImageURL;
},{}],7:[function(require,module,exports){
function pixelAt(cx, x, y) {
  var data = cx.getImageData(x, y, 1, 1).data;
  return "rgb(" + data[0] + ", " + data[1] + ", " + data[2] + ")";
}

module.exports = pixelAt;
},{}],8:[function(require,module,exports){
function randomPointInRadius(radius) {
  for (;;) {
    var x = Math.random() * 2 - 1;
    var y = Math.random() * 2 - 1;
    if (x * x + y * y <= 1)
      return {x: x * radius, y: y * radius};
  }
}

module.exports = randomPointInRadius;
},{}],9:[function(require,module,exports){
function relativePos(event, element) {
  var rect = element.getBoundingClientRect();
  return {x: Math.floor(event.clientX - rect.left),
    y: Math.floor(event.clientY - rect.top)};
}

module.exports = relativePos;
},{}],10:[function(require,module,exports){
function trackDrag(onMove, onEnd) {
  function end(event) {
    removeEventListener("mousemove", onMove);
    removeEventListener("mouseup", end);
    if (onEnd)
      onEnd(event);
  }
  addEventListener("mousemove", onMove);
  addEventListener("mouseup", end);
}

module.exports = trackDrag;
},{}],11:[function(require,module,exports){
var relativePos = require('../Helpers/relativePos');
var trackDrag = require('../Helpers/trackDrag');
var randomPointInRadius = require('../Helpers/randomPointInRadius');
var pixelAt = require('../Helpers/pixelAt');
var forAllNeighbors = require('../Helpers/forAllNeighbors');
var isSameColor = require('../Helpers/isSameColor');

var tools = Object.create(null);

tools.Line = function(event, cx, onEnd) {
  cx.lineCap = "round";

  var pos = relativePos(event, cx.canvas);
  trackDrag(function(event) {
    cx.beginPath();
    cx.moveTo(pos.x, pos.y);
    pos = relativePos(event, cx.canvas);
    cx.lineTo(pos.x, pos.y);
    cx.stroke();
  }, onEnd);
};

tools.Erase = function(event, cx) {
  cx.globalCompositeOperation = "destination-out";
  tools.Line(event, cx, function() {
    cx.globalCompositeOperation = "source-over";
  });
};

tools.Text = function(event, cx) {
  var text = prompt("Text:", "");
  if (text) {
    var pos = relativePos(event, cx.canvas);
    cx.font = Math.max(7, cx.lineWidth) + "px sans-serif";
    cx.fillText(text, pos.x, pos.y);
  }
};

tools.Spray = function(event, cx) {
  var radius = cx.lineWidth / 2;
  var area = radius * radius * Math.PI;
  var dotsPerTick = Math.ceil(area / 30);

  var currentPos = relativePos(event, cx.canvas);
  var spray = setInterval(function() {
    for (var i = 0; i < dotsPerTick; i++) {
      var offset = randomPointInRadius(radius);
      cx.fillRect(currentPos.x + offset.x,
        currentPos.y + offset.y, 1, 1);
    }
  }, 25);
  trackDrag(function(event) {
    currentPos = relativePos(event, cx.canvas);
  }, function() {
    clearInterval(spray);
  });
};

tools.Rectangle = function(event, cx) {

  function rectangleFromTo(from, to) {
    return {left: Math.min(from.x, to.x),
      top: Math.min(from.y, to.y),
      width: Math.abs(from.x - to.x),
      height: Math.abs(from.y - to.y)};
  }

  var relativeStart = relativePos(event, cx.canvas);
  var pageStart = {x: event.pageX, y: event.pageY};
  var trackingNode = document.createElement("div");

  trackingNode.style.position = "absolute";
  trackingNode.style.background = cx.fillStyle;
  document.body.appendChild(trackingNode);

  trackDrag(function(event) {
    var rect = rectangleFromTo(pageStart,
      {x: event.pageX, y: event.pageY});

    trackingNode.style.left = rect.left + "px";
    trackingNode.style.top = rect.top + "px";
    trackingNode.style.width = rect.width + "px";
    trackingNode.style.height = rect.height + "px";
  }, function(event) {
    var rect = rectangleFromTo(relativeStart,
      relativePos(event, cx.canvas));

    cx.fillRect(rect.left, rect.top, rect.width, rect.height);
    document.body.removeChild(trackingNode);
  });
};

tools["Pick color"] = function(event, cx) {
  var position = relativePos(event, cx.canvas);

  try {
    var color = pixelAt(cx, position.x, position.y);
  } catch (e) {
    if (e instanceof SecurityError) {
      alert("Unable to access your picture's pixel data");
      return;
    } else {
      throw e;
    }
  }

  cx.fillStyle = color;
  cx.strokeStyle = color;

  document.getElementById("color").value = cx.fillStyle;
};

tools["Flood fill"] = function(event, cx) {
  var startPos = relativePos(event, cx.canvas);
  var data = cx.getImageData(0, 0, cx.canvas.width,
    cx.canvas.height);

  var alreadyFilled = new Array(data.width * data.height);

  var workList = [startPos];
  while (workList.length) {
    var pos = workList.pop();
    var offset = pos.x + data.width * pos.y;
    if (alreadyFilled[offset]) continue;
    cx.fillRect(pos.x, pos.y, 1, 1);
    alreadyFilled[offset] = true;
    forAllNeighbors(pos, function(neighbor) {
      if (neighbor.x >= 0 && neighbor.x < data.width &&
        neighbor.y >= 0 && neighbor.y < data.height &&
        isSameColor(data, startPos, neighbor))
        workList.push(neighbor);
    });
  }
};

module.exports = tools;
},{"../Helpers/forAllNeighbors":4,"../Helpers/isSameColor":5,"../Helpers/pixelAt":7,"../Helpers/randomPointInRadius":8,"../Helpers/relativePos":9,"../Helpers/trackDrag":10}],12:[function(require,module,exports){
var createPaint = require('./Helpers/createPaint');

createPaint(document.body);
},{"./Helpers/createPaint":2}]},{},[12])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvQ29udHJvbHMvY29udHJvbHMuanMiLCJhcHAvSGVscGVycy9jcmVhdGVQYWludC5qcyIsImFwcC9IZWxwZXJzL2VsdC5qcyIsImFwcC9IZWxwZXJzL2ZvckFsbE5laWdoYm9ycy5qcyIsImFwcC9IZWxwZXJzL2lzU2FtZUNvbG9yLmpzIiwiYXBwL0hlbHBlcnMvbG9hZEltYWdlVVJMLmpzIiwiYXBwL0hlbHBlcnMvcGl4ZWxBdC5qcyIsImFwcC9IZWxwZXJzL3JhbmRvbVBvaW50SW5SYWRpdXMuanMiLCJhcHAvSGVscGVycy9yZWxhdGl2ZVBvcy5qcyIsImFwcC9IZWxwZXJzL3RyYWNrRHJhZy5qcyIsImFwcC9Ub29scy90b29scy5qcyIsImFwcC9hcHAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZJQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGVsdCA9IHJlcXVpcmUoJy4uL0hlbHBlcnMvZWx0Jyk7XHJcbnZhciBsb2FkSW1hZ2VVUkwgPSByZXF1aXJlKCcuLi9IZWxwZXJzL2xvYWRJbWFnZVVSTCcpO1xyXG52YXIgdG9vbHMgPSByZXF1aXJlKCcuLi9Ub29scy90b29scycpO1xyXG5cclxudmFyIGNvbnRyb2xzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcclxuXHJcbmNvbnRyb2xzLnRvb2wgPSBmdW5jdGlvbihjeCkge1xyXG4gIHZhciBzZWxlY3QgPSBlbHQoXCJzZWxlY3RcIik7XHJcbiAgZm9yICh2YXIgbmFtZSBpbiB0b29scylcclxuICAgIHNlbGVjdC5hcHBlbmRDaGlsZChlbHQoXCJvcHRpb25cIiwgbnVsbCwgbmFtZSkpO1xyXG5cclxuICBjeC5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgaWYgKGV2ZW50LndoaWNoID09IDEpIHtcclxuICAgICAgdG9vbHNbc2VsZWN0LnZhbHVlXShldmVudCwgY3gpO1xyXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICByZXR1cm4gZWx0KFwic3BhblwiLCBudWxsLCBcIlRvb2w6IFwiLCBzZWxlY3QpO1xyXG59O1xyXG5cclxuY29udHJvbHMuY29sb3IgPSBmdW5jdGlvbihjeCkge1xyXG4gIHZhciBpbnB1dCA9IGVsdChcImlucHV0XCIsIHt0eXBlOiBcImNvbG9yXCIsIGlkOiBcImNvbG9yXCJ9KTtcclxuICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgY3guZmlsbFN0eWxlID0gaW5wdXQudmFsdWU7XHJcbiAgICBjeC5zdHJva2VTdHlsZSA9IGlucHV0LnZhbHVlO1xyXG4gIH0pO1xyXG4gIHJldHVybiBlbHQoXCJzcGFuXCIsIG51bGwsIFwiQ29sb3I6IFwiLCBpbnB1dCk7XHJcbn07XHJcblxyXG5jb250cm9scy5icnVzaFNpemUgPSBmdW5jdGlvbihjeCkge1xyXG4gIHZhciBzZWxlY3QgPSBlbHQoXCJzZWxlY3RcIik7XHJcbiAgdmFyIHNpemVzID0gWzEsIDIsIDMsIDUsIDgsIDEyLCAyNSwgMzUsIDUwLCA3NSwgMTAwXTtcclxuICBzaXplcy5mb3JFYWNoKGZ1bmN0aW9uKHNpemUpIHtcclxuICAgIHNlbGVjdC5hcHBlbmRDaGlsZChlbHQoXCJvcHRpb25cIiwge3ZhbHVlOiBzaXplfSxcclxuICAgICAgc2l6ZSArIFwiIHBpeGVsc1wiKSk7XHJcbiAgfSk7XHJcbiAgc2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICBjeC5saW5lV2lkdGggPSBzZWxlY3QudmFsdWU7XHJcbiAgfSk7XHJcbiAgcmV0dXJuIGVsdChcInNwYW5cIiwgbnVsbCwgXCJCcnVzaCBzaXplOiBcIiwgc2VsZWN0KTtcclxufTtcclxuXHJcbmNvbnRyb2xzLnNhdmUgPSBmdW5jdGlvbihjeCkge1xyXG4gIHZhciBsaW5rID0gZWx0KFwiYVwiLCB7aHJlZjogXCIvXCJ9LCBcIlNhdmVcIik7XHJcbiAgZnVuY3Rpb24gdXBkYXRlKCkge1xyXG4gICAgdHJ5IHtcclxuICAgICAgbGluay5ocmVmID0gY3guY2FudmFzLnRvRGF0YVVSTCgpO1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICBpZiAoZSBpbnN0YW5jZW9mIFNlY3VyaXR5RXJyb3IpXHJcbiAgICAgICAgbGluay5ocmVmID0gXCJqYXZhc2NyaXB0OmFsZXJ0KFwiICtcclxuICAgICAgICAgIEpTT04uc3RyaW5naWZ5KFwiQ2FuJ3Qgc2F2ZTogXCIgKyBlLnRvU3RyaW5nKCkpICsgXCIpXCI7XHJcbiAgICAgIGVsc2VcclxuICAgICAgICB0aHJvdyBlO1xyXG4gICAgfVxyXG4gIH1cclxuICBsaW5rLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW92ZXJcIiwgdXBkYXRlKTtcclxuICBsaW5rLmFkZEV2ZW50TGlzdGVuZXIoXCJmb2N1c1wiLCB1cGRhdGUpO1xyXG4gIHJldHVybiBsaW5rO1xyXG59O1xyXG5cclxuXHJcbmNvbnRyb2xzLm9wZW5GaWxlID0gZnVuY3Rpb24oY3gpIHtcclxuICB2YXIgaW5wdXQgPSBlbHQoXCJpbnB1dFwiLCB7dHlwZTogXCJmaWxlXCJ9KTtcclxuICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKGlucHV0LmZpbGVzLmxlbmd0aCA9PSAwKSByZXR1cm47XHJcbiAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcclxuICAgIHJlYWRlci5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgbG9hZEltYWdlVVJMKGN4LCByZWFkZXIucmVzdWx0KTtcclxuICAgIH0pO1xyXG4gICAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoaW5wdXQuZmlsZXNbMF0pO1xyXG4gIH0pO1xyXG4gIHJldHVybiBlbHQoXCJkaXZcIiwgbnVsbCwgXCJPcGVuIGZpbGU6IFwiLCBpbnB1dCk7XHJcbn07XHJcblxyXG5jb250cm9scy5vcGVuVVJMID0gZnVuY3Rpb24oY3gpIHtcclxuICB2YXIgaW5wdXQgPSBlbHQoXCJpbnB1dFwiLCB7dHlwZTogXCJ0ZXh0XCJ9KTtcclxuICB2YXIgZm9ybSA9IGVsdChcImZvcm1cIiwgbnVsbCxcclxuICAgIFwiT3BlbiBVUkw6IFwiLCBpbnB1dCxcclxuICAgIGVsdChcImJ1dHRvblwiLCB7dHlwZTogXCJzdWJtaXRcIn0sIFwibG9hZFwiKSk7XHJcbiAgZm9ybS5hZGRFdmVudExpc3RlbmVyKFwic3VibWl0XCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgbG9hZEltYWdlVVJMKGN4LCBmb3JtLnF1ZXJ5U2VsZWN0b3IoXCJpbnB1dFwiKS52YWx1ZSk7XHJcbiAgfSk7XHJcbiAgcmV0dXJuIGZvcm07XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNvbnRyb2xzOyIsInZhciBlbHQgPSByZXF1aXJlKCcuL2VsdCcpO1xyXG52YXIgY29udHJvbHMgPSByZXF1aXJlKCcuLi9Db250cm9scy9jb250cm9scycpO1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlUGFpbnQocGFyZW50KSB7XHJcbiAgdmFyIGNhbnZhcyA9IGVsdChcImNhbnZhc1wiLCB7d2lkdGg6IDUwMCwgaGVpZ2h0OiAzMDB9KTtcclxuICB2YXIgY3ggPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xyXG4gIHZhciB0b29sYmFyID0gZWx0KFwiZGl2XCIsIHtjbGFzczogXCJ0b29sYmFyXCJ9KTtcclxuICBmb3IgKHZhciBuYW1lIGluIGNvbnRyb2xzKVxyXG4gICAgdG9vbGJhci5hcHBlbmRDaGlsZChjb250cm9sc1tuYW1lXShjeCkpO1xyXG5cclxuICB2YXIgcGFuZWwgPSBlbHQoXCJkaXZcIiwge2NsYXNzOiBcInBpY3R1cmVwYW5lbFwifSwgY2FudmFzKTtcclxuXHJcbiAgcGFyZW50LmFwcGVuZENoaWxkKGVsdChcImRpdlwiLCBudWxsLCBwYW5lbCwgdG9vbGJhcikpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZVBhaW50OyIsImZ1bmN0aW9uIGVsdChuYW1lLCBhdHRyaWJ1dGVzKSB7XHJcbiAgdmFyIG5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KG5hbWUpO1xyXG4gIGlmIChhdHRyaWJ1dGVzKSB7XHJcbiAgICBmb3IgKHZhciBhdHRyIGluIGF0dHJpYnV0ZXMpXHJcbiAgICAgIGlmIChhdHRyaWJ1dGVzLmhhc093blByb3BlcnR5KGF0dHIpKVxyXG4gICAgICAgIG5vZGUuc2V0QXR0cmlidXRlKGF0dHIsIGF0dHJpYnV0ZXNbYXR0cl0pO1xyXG4gIH1cclxuICBmb3IgKHZhciBpID0gMjsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xyXG4gICAgdmFyIGNoaWxkID0gYXJndW1lbnRzW2ldO1xyXG4gICAgaWYgKHR5cGVvZiBjaGlsZCA9PSBcInN0cmluZ1wiKVxyXG4gICAgICBjaGlsZCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNoaWxkKTtcclxuICAgIG5vZGUuYXBwZW5kQ2hpbGQoY2hpbGQpO1xyXG4gIH1cclxuICByZXR1cm4gbm9kZTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBlbHQ7IiwiZnVuY3Rpb24gZm9yQWxsTmVpZ2hib3JzKHBvaW50LCBmbikge1xyXG4gIGZuKHt4OiBwb2ludC54LCB5OiBwb2ludC55ICsgMX0pO1xyXG4gIGZuKHt4OiBwb2ludC54LCB5OiBwb2ludC55IC0gMX0pO1xyXG4gIGZuKHt4OiBwb2ludC54ICsgMSwgeTogcG9pbnQueX0pO1xyXG4gIGZuKHt4OiBwb2ludC54IC0gMSwgeTogcG9pbnQueX0pO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZvckFsbE5laWdoYm9yczsiLCJmdW5jdGlvbiBpc1NhbWVDb2xvcihkYXRhLCBwb3MxLCBwb3MyKSB7XHJcbiAgdmFyIG9mZnNldDEgPSAocG9zMS54ICsgcG9zMS55ICogZGF0YS53aWR0aCkgKiA0O1xyXG4gIHZhciBvZmZzZXQyID0gKHBvczIueCArIHBvczIueSAqIGRhdGEud2lkdGgpICogNDtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IDQ7IGkrKykge1xyXG4gICAgaWYgKGRhdGEuZGF0YVtvZmZzZXQxICsgaV0gIT0gZGF0YS5kYXRhW29mZnNldDIgKyBpXSlcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuICByZXR1cm4gdHJ1ZTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBpc1NhbWVDb2xvcjsiLCJmdW5jdGlvbiBsb2FkSW1hZ2VVUkwoY3gsIHVybCkge1xyXG4gIHZhciBpbWFnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XHJcbiAgaW1hZ2UuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgY29sb3IgPSBjeC5maWxsU3R5bGUsIHNpemUgPSBjeC5saW5lV2lkdGg7XHJcbiAgICBjeC5jYW52YXMud2lkdGggPSBpbWFnZS53aWR0aDtcclxuICAgIGN4LmNhbnZhcy5oZWlnaHQgPSBpbWFnZS5oZWlnaHQ7XHJcbiAgICBjeC5kcmF3SW1hZ2UoaW1hZ2UsIDAsIDApO1xyXG4gICAgY3guZmlsbFN0eWxlID0gY29sb3I7XHJcbiAgICBjeC5zdHJva2VTdHlsZSA9IGNvbG9yO1xyXG4gICAgY3gubGluZVdpZHRoID0gc2l6ZTtcclxuICB9KTtcclxuICBpbWFnZS5zcmMgPSB1cmw7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gbG9hZEltYWdlVVJMOyIsImZ1bmN0aW9uIHBpeGVsQXQoY3gsIHgsIHkpIHtcclxuICB2YXIgZGF0YSA9IGN4LmdldEltYWdlRGF0YSh4LCB5LCAxLCAxKS5kYXRhO1xyXG4gIHJldHVybiBcInJnYihcIiArIGRhdGFbMF0gKyBcIiwgXCIgKyBkYXRhWzFdICsgXCIsIFwiICsgZGF0YVsyXSArIFwiKVwiO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHBpeGVsQXQ7IiwiZnVuY3Rpb24gcmFuZG9tUG9pbnRJblJhZGl1cyhyYWRpdXMpIHtcclxuICBmb3IgKDs7KSB7XHJcbiAgICB2YXIgeCA9IE1hdGgucmFuZG9tKCkgKiAyIC0gMTtcclxuICAgIHZhciB5ID0gTWF0aC5yYW5kb20oKSAqIDIgLSAxO1xyXG4gICAgaWYgKHggKiB4ICsgeSAqIHkgPD0gMSlcclxuICAgICAgcmV0dXJuIHt4OiB4ICogcmFkaXVzLCB5OiB5ICogcmFkaXVzfTtcclxuICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gcmFuZG9tUG9pbnRJblJhZGl1czsiLCJmdW5jdGlvbiByZWxhdGl2ZVBvcyhldmVudCwgZWxlbWVudCkge1xyXG4gIHZhciByZWN0ID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICByZXR1cm4ge3g6IE1hdGguZmxvb3IoZXZlbnQuY2xpZW50WCAtIHJlY3QubGVmdCksXHJcbiAgICB5OiBNYXRoLmZsb29yKGV2ZW50LmNsaWVudFkgLSByZWN0LnRvcCl9O1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHJlbGF0aXZlUG9zOyIsImZ1bmN0aW9uIHRyYWNrRHJhZyhvbk1vdmUsIG9uRW5kKSB7XHJcbiAgZnVuY3Rpb24gZW5kKGV2ZW50KSB7XHJcbiAgICByZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIG9uTW92ZSk7XHJcbiAgICByZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCBlbmQpO1xyXG4gICAgaWYgKG9uRW5kKVxyXG4gICAgICBvbkVuZChldmVudCk7XHJcbiAgfVxyXG4gIGFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgb25Nb3ZlKTtcclxuICBhZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCBlbmQpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHRyYWNrRHJhZzsiLCJ2YXIgcmVsYXRpdmVQb3MgPSByZXF1aXJlKCcuLi9IZWxwZXJzL3JlbGF0aXZlUG9zJyk7XHJcbnZhciB0cmFja0RyYWcgPSByZXF1aXJlKCcuLi9IZWxwZXJzL3RyYWNrRHJhZycpO1xyXG52YXIgcmFuZG9tUG9pbnRJblJhZGl1cyA9IHJlcXVpcmUoJy4uL0hlbHBlcnMvcmFuZG9tUG9pbnRJblJhZGl1cycpO1xyXG52YXIgcGl4ZWxBdCA9IHJlcXVpcmUoJy4uL0hlbHBlcnMvcGl4ZWxBdCcpO1xyXG52YXIgZm9yQWxsTmVpZ2hib3JzID0gcmVxdWlyZSgnLi4vSGVscGVycy9mb3JBbGxOZWlnaGJvcnMnKTtcclxudmFyIGlzU2FtZUNvbG9yID0gcmVxdWlyZSgnLi4vSGVscGVycy9pc1NhbWVDb2xvcicpO1xyXG5cclxudmFyIHRvb2xzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcclxuXHJcbnRvb2xzLkxpbmUgPSBmdW5jdGlvbihldmVudCwgY3gsIG9uRW5kKSB7XHJcbiAgY3gubGluZUNhcCA9IFwicm91bmRcIjtcclxuXHJcbiAgdmFyIHBvcyA9IHJlbGF0aXZlUG9zKGV2ZW50LCBjeC5jYW52YXMpO1xyXG4gIHRyYWNrRHJhZyhmdW5jdGlvbihldmVudCkge1xyXG4gICAgY3guYmVnaW5QYXRoKCk7XHJcbiAgICBjeC5tb3ZlVG8ocG9zLngsIHBvcy55KTtcclxuICAgIHBvcyA9IHJlbGF0aXZlUG9zKGV2ZW50LCBjeC5jYW52YXMpO1xyXG4gICAgY3gubGluZVRvKHBvcy54LCBwb3MueSk7XHJcbiAgICBjeC5zdHJva2UoKTtcclxuICB9LCBvbkVuZCk7XHJcbn07XHJcblxyXG50b29scy5FcmFzZSA9IGZ1bmN0aW9uKGV2ZW50LCBjeCkge1xyXG4gIGN4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9IFwiZGVzdGluYXRpb24tb3V0XCI7XHJcbiAgdG9vbHMuTGluZShldmVudCwgY3gsIGZ1bmN0aW9uKCkge1xyXG4gICAgY3guZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gXCJzb3VyY2Utb3ZlclwiO1xyXG4gIH0pO1xyXG59O1xyXG5cclxudG9vbHMuVGV4dCA9IGZ1bmN0aW9uKGV2ZW50LCBjeCkge1xyXG4gIHZhciB0ZXh0ID0gcHJvbXB0KFwiVGV4dDpcIiwgXCJcIik7XHJcbiAgaWYgKHRleHQpIHtcclxuICAgIHZhciBwb3MgPSByZWxhdGl2ZVBvcyhldmVudCwgY3guY2FudmFzKTtcclxuICAgIGN4LmZvbnQgPSBNYXRoLm1heCg3LCBjeC5saW5lV2lkdGgpICsgXCJweCBzYW5zLXNlcmlmXCI7XHJcbiAgICBjeC5maWxsVGV4dCh0ZXh0LCBwb3MueCwgcG9zLnkpO1xyXG4gIH1cclxufTtcclxuXHJcbnRvb2xzLlNwcmF5ID0gZnVuY3Rpb24oZXZlbnQsIGN4KSB7XHJcbiAgdmFyIHJhZGl1cyA9IGN4LmxpbmVXaWR0aCAvIDI7XHJcbiAgdmFyIGFyZWEgPSByYWRpdXMgKiByYWRpdXMgKiBNYXRoLlBJO1xyXG4gIHZhciBkb3RzUGVyVGljayA9IE1hdGguY2VpbChhcmVhIC8gMzApO1xyXG5cclxuICB2YXIgY3VycmVudFBvcyA9IHJlbGF0aXZlUG9zKGV2ZW50LCBjeC5jYW52YXMpO1xyXG4gIHZhciBzcHJheSA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkb3RzUGVyVGljazsgaSsrKSB7XHJcbiAgICAgIHZhciBvZmZzZXQgPSByYW5kb21Qb2ludEluUmFkaXVzKHJhZGl1cyk7XHJcbiAgICAgIGN4LmZpbGxSZWN0KGN1cnJlbnRQb3MueCArIG9mZnNldC54LFxyXG4gICAgICAgIGN1cnJlbnRQb3MueSArIG9mZnNldC55LCAxLCAxKTtcclxuICAgIH1cclxuICB9LCAyNSk7XHJcbiAgdHJhY2tEcmFnKGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICBjdXJyZW50UG9zID0gcmVsYXRpdmVQb3MoZXZlbnQsIGN4LmNhbnZhcyk7XHJcbiAgfSwgZnVuY3Rpb24oKSB7XHJcbiAgICBjbGVhckludGVydmFsKHNwcmF5KTtcclxuICB9KTtcclxufTtcclxuXHJcbnRvb2xzLlJlY3RhbmdsZSA9IGZ1bmN0aW9uKGV2ZW50LCBjeCkge1xyXG5cclxuICBmdW5jdGlvbiByZWN0YW5nbGVGcm9tVG8oZnJvbSwgdG8pIHtcclxuICAgIHJldHVybiB7bGVmdDogTWF0aC5taW4oZnJvbS54LCB0by54KSxcclxuICAgICAgdG9wOiBNYXRoLm1pbihmcm9tLnksIHRvLnkpLFxyXG4gICAgICB3aWR0aDogTWF0aC5hYnMoZnJvbS54IC0gdG8ueCksXHJcbiAgICAgIGhlaWdodDogTWF0aC5hYnMoZnJvbS55IC0gdG8ueSl9O1xyXG4gIH1cclxuXHJcbiAgdmFyIHJlbGF0aXZlU3RhcnQgPSByZWxhdGl2ZVBvcyhldmVudCwgY3guY2FudmFzKTtcclxuICB2YXIgcGFnZVN0YXJ0ID0ge3g6IGV2ZW50LnBhZ2VYLCB5OiBldmVudC5wYWdlWX07XHJcbiAgdmFyIHRyYWNraW5nTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcblxyXG4gIHRyYWNraW5nTm9kZS5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcclxuICB0cmFja2luZ05vZGUuc3R5bGUuYmFja2dyb3VuZCA9IGN4LmZpbGxTdHlsZTtcclxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRyYWNraW5nTm9kZSk7XHJcblxyXG4gIHRyYWNrRHJhZyhmdW5jdGlvbihldmVudCkge1xyXG4gICAgdmFyIHJlY3QgPSByZWN0YW5nbGVGcm9tVG8ocGFnZVN0YXJ0LFxyXG4gICAgICB7eDogZXZlbnQucGFnZVgsIHk6IGV2ZW50LnBhZ2VZfSk7XHJcblxyXG4gICAgdHJhY2tpbmdOb2RlLnN0eWxlLmxlZnQgPSByZWN0LmxlZnQgKyBcInB4XCI7XHJcbiAgICB0cmFja2luZ05vZGUuc3R5bGUudG9wID0gcmVjdC50b3AgKyBcInB4XCI7XHJcbiAgICB0cmFja2luZ05vZGUuc3R5bGUud2lkdGggPSByZWN0LndpZHRoICsgXCJweFwiO1xyXG4gICAgdHJhY2tpbmdOb2RlLnN0eWxlLmhlaWdodCA9IHJlY3QuaGVpZ2h0ICsgXCJweFwiO1xyXG4gIH0sIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICB2YXIgcmVjdCA9IHJlY3RhbmdsZUZyb21UbyhyZWxhdGl2ZVN0YXJ0LFxyXG4gICAgICByZWxhdGl2ZVBvcyhldmVudCwgY3guY2FudmFzKSk7XHJcblxyXG4gICAgY3guZmlsbFJlY3QocmVjdC5sZWZ0LCByZWN0LnRvcCwgcmVjdC53aWR0aCwgcmVjdC5oZWlnaHQpO1xyXG4gICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZCh0cmFja2luZ05vZGUpO1xyXG4gIH0pO1xyXG59O1xyXG5cclxudG9vbHNbXCJQaWNrIGNvbG9yXCJdID0gZnVuY3Rpb24oZXZlbnQsIGN4KSB7XHJcbiAgdmFyIHBvc2l0aW9uID0gcmVsYXRpdmVQb3MoZXZlbnQsIGN4LmNhbnZhcyk7XHJcblxyXG4gIHRyeSB7XHJcbiAgICB2YXIgY29sb3IgPSBwaXhlbEF0KGN4LCBwb3NpdGlvbi54LCBwb3NpdGlvbi55KTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICBpZiAoZSBpbnN0YW5jZW9mIFNlY3VyaXR5RXJyb3IpIHtcclxuICAgICAgYWxlcnQoXCJVbmFibGUgdG8gYWNjZXNzIHlvdXIgcGljdHVyZSdzIHBpeGVsIGRhdGFcIik7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRocm93IGU7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjeC5maWxsU3R5bGUgPSBjb2xvcjtcclxuICBjeC5zdHJva2VTdHlsZSA9IGNvbG9yO1xyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbG9yXCIpLnZhbHVlID0gY3guZmlsbFN0eWxlO1xyXG59O1xyXG5cclxudG9vbHNbXCJGbG9vZCBmaWxsXCJdID0gZnVuY3Rpb24oZXZlbnQsIGN4KSB7XHJcbiAgdmFyIHN0YXJ0UG9zID0gcmVsYXRpdmVQb3MoZXZlbnQsIGN4LmNhbnZhcyk7XHJcbiAgdmFyIGRhdGEgPSBjeC5nZXRJbWFnZURhdGEoMCwgMCwgY3guY2FudmFzLndpZHRoLFxyXG4gICAgY3guY2FudmFzLmhlaWdodCk7XHJcblxyXG4gIHZhciBhbHJlYWR5RmlsbGVkID0gbmV3IEFycmF5KGRhdGEud2lkdGggKiBkYXRhLmhlaWdodCk7XHJcblxyXG4gIHZhciB3b3JrTGlzdCA9IFtzdGFydFBvc107XHJcbiAgd2hpbGUgKHdvcmtMaXN0Lmxlbmd0aCkge1xyXG4gICAgdmFyIHBvcyA9IHdvcmtMaXN0LnBvcCgpO1xyXG4gICAgdmFyIG9mZnNldCA9IHBvcy54ICsgZGF0YS53aWR0aCAqIHBvcy55O1xyXG4gICAgaWYgKGFscmVhZHlGaWxsZWRbb2Zmc2V0XSkgY29udGludWU7XHJcbiAgICBjeC5maWxsUmVjdChwb3MueCwgcG9zLnksIDEsIDEpO1xyXG4gICAgYWxyZWFkeUZpbGxlZFtvZmZzZXRdID0gdHJ1ZTtcclxuICAgIGZvckFsbE5laWdoYm9ycyhwb3MsIGZ1bmN0aW9uKG5laWdoYm9yKSB7XHJcbiAgICAgIGlmIChuZWlnaGJvci54ID49IDAgJiYgbmVpZ2hib3IueCA8IGRhdGEud2lkdGggJiZcclxuICAgICAgICBuZWlnaGJvci55ID49IDAgJiYgbmVpZ2hib3IueSA8IGRhdGEuaGVpZ2h0ICYmXHJcbiAgICAgICAgaXNTYW1lQ29sb3IoZGF0YSwgc3RhcnRQb3MsIG5laWdoYm9yKSlcclxuICAgICAgICB3b3JrTGlzdC5wdXNoKG5laWdoYm9yKTtcclxuICAgIH0pO1xyXG4gIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gdG9vbHM7IiwidmFyIGNyZWF0ZVBhaW50ID0gcmVxdWlyZSgnLi9IZWxwZXJzL2NyZWF0ZVBhaW50Jyk7XHJcblxyXG5jcmVhdGVQYWludChkb2N1bWVudC5ib2R5KTsiXX0=
