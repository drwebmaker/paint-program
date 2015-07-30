function pixelAt(cx, x, y) {
  var data = cx.getImageData(x, y, 1, 1).data;
  return "rgb(" + data[0] + ", " + data[1] + ", " + data[2] + ")";
}

module.exports = pixelAt;