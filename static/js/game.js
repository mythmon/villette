/*global SpriteSheet, Sprite, Actor*/
(function() {

WIDTH = 640, HEIGHT = 480;
var buffer, canvas, context;
var running = false;
var actors = [];

var graph;
var denizen;


/* class Denizen */
function Denizen(options) {
  Actor.call(this, options);
  _.extend(this, {
    speed: 100,
    navNext: null,
    navPath: [],
    sprite: null
  }, options);
}

Denizen.prototype = new Actor();

function getDir(x, y) {
  if (Math.abs(x) < Math.abs(y)) {
    if (y < 0) {
      return 'north';
    } else {
      return 'south';
    }
  } else {
    if (x > 0) {
      return 'east';
    } else {
      return 'west';
    }
  }
}

Denizen.prototype.tick = function(dt) {
  Actor.prototype.tick.call(this, dt);

  if (this.navNext === null && this.navPath.length) {
    this.navNext = this.navPath.splice(0, 1)[0];
    if (this.navNext === undefined) {
      this.navNext = null;
    }
  }

  if (this.navNext) {
    var dx, dy, dist, scale;

    dx = this.navNext.x - this.x;
    dy = this.navNext.y - this.y;
    dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < this.speed * dt) {
      this.vx = 0;
      this.vy = 0;
      this.x = this.navNext.x;
      this.y = this.navNext.y;
      this.navNext = null;
    } else {
      scale = this.speed / dist;
      this.vx = dx * scale;
      this.vy = dy * scale;
    }
  }

  if (Math.abs(this.vx) > 0 || Math.abs(this.vy) > 0) {
    this.image.dir = getDir(this.vx, this.vy);
    this.image.state = 'walk';
  } else {
    this.image.state = 'stand';
  }
};

Denizen.prototype.navTo = function(graph, destination) {
  var start = graph.findClosest(this.x, this.y);
  this.navPath = graph.findPath(start, destination);
  if (this.navPath === null) {
    this.navPath = [];
  }
  this.navNext = null;
  //graph.graph.findPath(graph.graph.nodes[2], graph.graph.nodes[6]);
};
/* end Denizen */




function init() {
  canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  context = canvas.getContext('2d');
  context.mozImageSmoothingEnabled = false;

  $('#game').append(canvas);
  $('#game').append('<span id="info"/>');
  $('#game').append('<div class="overlay"/>');

  var sprites = {};
  for (i=0; i < 9; i++) {
    sprites['north' + i] = {tx: i, ty: 0};
    sprites['west' + i] = {tx: i, ty: 1};
    sprites['south' + i] = {tx: i, ty: 2};
    sprites['east' + i] = {tx: i, ty: 3};
  }
  var denizenSpriteSheet = new SpriteSheet({
    src: 'img/sheets/princess.png',
    tile_width: 64,
    tile_height: 64,
    sprites: sprites,
    callback: start
  });

  var frames;
  var animations = {};
  var dirs = ['north', 'west', 'south', 'east'];
  for (i = 0; i < dirs.length; i++) {
    var dir = dirs[i];
    frames = [];
    for (j=0; j < 9; j++) {
      frames.push({name: dir + j, time: 0.16});
    }
    var anim = new Animation({
      cx: 32, cy: 56,
      sheet: denizenSpriteSheet,
      frames: frames
    });
    animations[dir + '_walk'] = anim;

    animations[dir + '_stand'] = new Animation({
      cx: 32, cy: 56,
      sheet: denizenSpriteSheet,
      frames: [{name: dir + '0', time: '100'}]
    });
  }
  var denizenAnimationSet = new AnimationSet({
    animations: animations,
    dir: 'south',
    state: 'stand',
    selector: '{dir}_{state}'
  });

  graph = new GraphVisualizer();
  denizen = new Denizen({
    x: graph.graph.nodes[0].x,
    y: graph.graph.nodes[0].y,
    image: denizenAnimationSet
  });

  actors.push(graph);
  actors.push(denizen);

  $(canvas).on('click', function(e) {
    var coords = relMouseCoords(e);
    denizen.navTo(graph.graph, graph.graph.findClosest(coords.x, coords.y));
  });

  stats = new Stats();
  stats.setMode(0); // 0: fps, 1: ms

  $(stats.domElement).css({
    position: 'absolute',
    right: '8px',
    top: '8px',
    opacity: '0.1'
  }).appendTo('#game');

  ready = true;
}

function start() {
  console.log('start');
  running = true;
  lastTick = +new Date();
  loop();
}

function loop() {
  if (stats !== undefined) stats.begin();

  tick();
  render();
  if (running) {
    requestFrame(loop, canvas);
  }

  if (stats !== undefined) stats.end();
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
  context.fillRect(0, 0, WIDTH, HEIGHT);

  _.each(_.clone(actors), function(actor) {
    actor.draw(context);
  });
}

function stop() {
  running = false;
}

$(init);
})();
