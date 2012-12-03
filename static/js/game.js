(function() {

var WIDTH = 640, HEIGHT = 480;
var buffer, canvas, context;
var running = false;
var TWOPI = Math.PI * 2;
var actors = [];

var graph;
var denizen;


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
    navNext: null,
    navPath: []
  });
}

Denizen.prototype = new Actor();

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


/* class GraphVisualizer */
function GraphVisualizer(options) {
  Actor.call(this, options);

  var g = new Graph();
  var nodeCount = 10;
  var linkCount = 1;
  for (var i=0; i < nodeCount; i++) {
    g.nodes.push(new Node({
      x: Math.random() * WIDTH * 0.8 + WIDTH * 0.1,
      y: Math.random() * HEIGHT * 0.8 + HEIGHT * 0.1
    }));
  }
  _.each(g.nodes, function(n) {
    for (var i=0; i < linkCount; i++) {
      var index = Math.round(Math.random() * nodeCount);
      index %= nodeCount;
      n.links.push(g.nodes[index]);
    }
  });

  labels = {};
  _.each(g.nodes, function(node) {
    labels[node.id] = $('<label>').appendTo('.overlay');
    console.log(labels[node.id]);
  });

  _.extend(this, {
    graph: g,
    labels: labels
  }, options);
}

GraphVisualizer.prototype = new Actor();

GraphVisualizer.prototype.tick = function() {
  _.each(this.graph.nodes, function(node) {
    self.labels[node.id]
      .text('{id}'.format(node))
      .css({
        left: (node.x + 10) + 'px',
        top: (node.y + 10) + 'px'
      });
  });
};

GraphVisualizer.prototype.draw = function(ctx) {
  var links = {};

  _.each(this.graph.nodes, function(n1) {
    _.each(n1.links, function(n2) {
      var key;
      if (n1.id < n2.id) {
        key = [n1.id, n2.id];
      } else {
        key = [n2.id, n1.id];
      }
      if (!(key in links)) {
        links[key] = [n1, n2];
      }
    });
  });

  _.each(links, function(nodes) {
    ctx.beginPath();
    ctx.moveTo(nodes[0].x, nodes[0].y);
    ctx.lineTo(nodes[1].x, nodes[1].y);
    ctx.stroke();
  });

  _.each(this.graph.nodes, function(node) {
    ctx.beginPath();
    ctx.arc(node.x, node.y, 10, 0, 6.28);
    ctx.stroke();
  });
};
/* end GraphVisualizer */


function init() {
  canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  context = canvas.getContext('2d');
  context.mozImageSmoothingEnabled = false;

  $('#game').append(canvas);
  $('#game').append('<span id="info"/>');
  $('#game').append('<div class="overlay"/>');

  graph = new GraphVisualizer();
  denizen = new Denizen();
  denizen.navTo(graph.graph, graph.graph.nodes[0]);

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
