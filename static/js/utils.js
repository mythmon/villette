var requestFrame = (function() {
  return window.requestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.oRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         function(callback) {
             setTimeout(callback, 30);
         };
})();

function relMouseCoords(event){
  var totalOffsetX = 0;
  var totalOffsetY = 0;
  var canvasX = 0;
  var canvasY = 0;
  var currentElement = event.currentElement || event.currentTarget;

  while(currentElement.offsetParent) {
    totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
    totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
    currentElement = currentElement.offsetParent;
  }

  canvasX = event.pageX - totalOffsetX;
  canvasY = event.pageY - totalOffsetY;

  return {x:canvasX, y:canvasY};
}

function distance(o1, o2) {
  var dx = o1.x - o2.x;
  var dy = o1.y - o2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

var _nextObjId = 1;
function addId(obj) {
  if (obj.id) {
    return obj.id;
  }
  obj.id = _nextObjId;
  _nextObjId++;
  return obj.id;
}

String.prototype.format = function(obj) {
  var args = arguments;
  var str = this;
  // Support either an object, or a series.
  return str.replace(/\{[\w\d_-]+\}/g, function(part) {
    // Strip off {}.
    part = part.slice(1, -1);
    var index = parseInt(part, 10);
    if (isNaN(index)) {
      return obj[part];
    } else {
      return args[index];
    }
  });
};

function async(func, args) {
  args = Array.prototype.slice.call(arguments, 1);
  setTimeout(function() {
    func.apply(this, args);
  }, 0);
}
