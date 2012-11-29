(function() {

var WIDTH = 320, HEIGHT = 240, SCALE = 2;
var buffer, canvas, context;
var running = false;
var TWOPI = Math.PI * 2;
var actors = [];


/* class Actor */
function Actor(options) {
  console.log('Actor: ' + JSON.stringify(options));
  _.extend(this, {
    x: 16, y: 16,
    w: 16, h: 16,
    vx: 10, vy: 15,
    color: '#fff'
  }, options);
}

Actor.prototype.tick = function(dt) {
};

Actor.prototype.draw = function(ctx) {
  ctx.fillStyle = this.color;
  var x = Math.round(this.x - this.w / 2);
  var y = Math.round(this.y - this.h / 2);
  ctx.fillRect(x, y, Math.round(this.w), Math.round(this.h));
};
/* end Actor */


/* class Denizen */
function Denizen(options) {
  Actor.call(this, options);
  _.extend(this, {
    color: '#f00'
  });
}

Denizen.prototype = new Actor();

Denizen.prototype.tick = function(dt) {
  Actor.prototype.tick.call(this, dt);
};
/* end Denizen */


/* class Target */
function Target(options) {
  console.log('Target');
  Actor.call(this, options);
  _.extend(this, {
    color: '#00f'
  });
}

Target.prototype = new Actor();

Target.prototype.tick = function(dt) {
  Actor.prototype.tick.call(this, dt);
  this.y += dt * 10;
};
/* end Target */


function init() {
  canvas = document.createElement('canvas');
  canvas.width = WIDTH * SCALE;
  canvas.height = HEIGHT * SCALE;

  context = canvas.getContext('2d');
  context.mozImageSmoothingEnabled = false;
  context.scale(SCALE, SCALE);

  $('#game').append(canvas);

  actors.push(new Denizen());

  $(canvas).on('click', function(e) {
    var coords = relMouseCoords(e);
    coords.x = Math.round(coords.x / SCALE);
    coords.y = Math.round(coords.y / SCALE);
    console.log(coords);
    actors.push(new Target(coords));
  });

  start();
}

function start() {
  running = true;
  lastTick = +new Date();
  loop();
}

function loop() {
  tick();
  render();
  if (running) {
    requestFrame(loop, canvas);
  }
}

function tick() {
  var newTick = +new Date();
  var dt = (newTick - lastTick) / 1000;

  _.each(actors, function(actor) {
    actor.tick(dt);
  });

  lastTick = newTick;
}

function render() {
  context.fillStyle = '#888';
  context.fillRect(0, 0, WIDTH * SCALE, HEIGHT * SCALE);

  _.each(actors, function(actor) {
    actor.draw(context);
  });
}

function stop() {
  running = false;
}

$(init);
})();
