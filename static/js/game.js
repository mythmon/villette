(function() {

var WIDTH = 640, HEIGHT = 480, SCALE = 1;
var buffer, canvas, context;
var running = false;
var TWOPI = Math.PI * 2;
var actors = [];


/* class Actor */
function Actor(options) {
  _.extend(this, {
    x: 16, y: 16,
    w: 16, h: 16,
    vx: 0, vy: 0,
    color: '#fff'
  }, options);
}

Actor.prototype.tick = function(dt) {
  this.x += this.vx * dt;
  this.y += this.vy * dt;
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
    color: '#f00',
    speed: 100,
    goal: {x: WIDTH / 2, y: HEIGHT / 2}
  });
}

Denizen.prototype = new Actor();

Denizen.prototype._find_target = function() {
  var self = this;
  var closest = null;
  var closestDist = null;
  var targets = _.filter(actors, function(a) {
    return a.constructor === Actor && a.active;
  });

  _.each(targets, function(t) {
    var d = distance(self, t);
    if (d < closestDist || closest === null) {
      closest = t;
      closestDist = d;
    }
  });

  return closest;
};

Denizen.prototype.tick = function(dt) {
  Actor.prototype.tick.call(this, dt);

  var dx, dy, dist, scale;
  var target = this._find_target();

  if (target) {
    var w2 = (this.w + target.w) / 2;
    var h2 = (this.h + target.h) / 2;
    dx = Math.abs(this.x - target.x);
    dy = Math.abs(this.y - target.y);

    if (dx < w2 && dy < h2) {
      target.color = '#0f0';
      target.active = false;
    } else {
      // Adjust the goal point based on the current speed of the target.
      dist = distance(target, this);

      var timeToTarget = dist / this.speed;
      this.goal = {
        x: target.x + target.vx * timeToTarget,
        y: target.y + target.vy * timeToTarget
      };
    }
  } else {
    this.goal = {x: WIDTH / 2, y: HEIGHT / 2};
  }

  dx = this.goal.x - this.x;
  dy = this.goal.y - this.y;
  dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < 10) {
    this.vx = 0;
    this.vy = 0;
  } else {
    scale = this.speed / dist;
    this.vx = dx * scale;
    this.vy = dy * scale;
  }
};
/* end Denizen */


/* class Target */
function Target(options) {
  Actor.call(this, options);
  _.extend(this, {
    color: '#00f',
    active: true,
    vy: 10
  }, options);
}

Target.prototype = new Actor();

Target.prototype.tick = function(dt) {
  Actor.prototype.tick.call(this, dt);

  this.vy += 10 * dt;

  if (this.y - this.h > HEIGHT) {
    actors = _.without(actors, this);
  }
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
  $('#game').append('<span id="info"/>');

  actors.push(new Denizen());

  $(canvas).on('click', function(e) {
    var coords = relMouseCoords(e);
    coords.x = Math.round(coords.x / SCALE);
    coords.y = Math.round(coords.y / SCALE);
    actors.push(new Target(coords));
  });

  stats = new Stats();
  stats.setMode(0); // 0: fps, 1: ms

  $(stats.domElement).css({
    position: 'absolute',
    right: '8px',
    top: '8px',
    opacity: '0.1'
  }).appendTo('#game');

  start();
}

function start() {
  running = true;
  lastTick = +new Date();
  loop();
}

function loop() {
  stats.begin();

  tick();
  render();
  if (running) {
    requestFrame(loop, canvas);
  }

  stats.end();
}

function tick() {
  var newTick = +new Date();
  var dt = (newTick - lastTick) / 1000;

  $('#info').text(actors.length);

  _.each(_.clone(actors), function(actor) {
    actor.tick(dt);
  });

  lastTick = newTick;
}

function render() {
  context.fillStyle = '#fff';
  context.fillRect(0, 0, WIDTH * SCALE, HEIGHT * SCALE);

  _.each(_.clone(actors), function(actor) {
    actor.draw(context);
  });
}

function stop() {
  running = false;
}

$(init);
})();
