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