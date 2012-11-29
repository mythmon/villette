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
