/* class Graph */
function Graph(options) {
  _.extend(this, {
    nodes: []
  }, options);
}

/* A* implemenation to find a path from start to goal. */
Graph.prototype.findPath = function(start, goal) {
  var current;
  var minF;
  var index;
  var closed = [];
  var open = [start];
  var cameFrom = {};
  var gScore = {};
  var fScore = {};
  var foundPath = false;

  gScore[start.id] = 0;
  fScore[start.id] = gScore[start.id] + distance(start, goal);

  while (open.length) {
    // Get the node with the lowest score in fScore.
    minF = null;
    _.each(open, function(n, i) {
      if (minF === null || fScore[n.id] < minF) {
        minF = fScore[n.id];
        index = i;
      }
    });
    current = open.splice(index, 1)[0];

    if (current === goal) {
      return this._reconstructPath(cameFrom, goal);
    }
    closed.push(current);

    _.each(current.links, function(n) {
      if (closed.indexOf(n) >= 0) {
        return;
      } else {
        var tentativeGScore = gScore[current.id] + distance(current, n);

        if (isNaN(gScore[n.id]) || tentativeGScore <= gScore[n.id] || open.indexOf(n) === -1) {
          cameFrom[n.id] = current;
          gScore[n.id] = tentativeGScore;
          fScore[n.id] = tentativeGScore + distance(n, goal);

          if (open.indexOf(n) === -1) {
            open.push(n);
          }
        }
      }
    });
  }

  return null;
};

Graph.prototype.findClosest = function(x, y) {
  var closest, closestDist;
  _.each(this.nodes, function(node) {
    var dist = distance(node, {x: x, y: y});
    if (dist < closestDist || closestDist === undefined) {
      closest = node;
      closestDist = dist;
    }
  });
  return closest;
};

Graph.prototype._reconstructPath = function(cameFrom, current) {
  /*
     if cameFrom[current_node] in set
         p := reconstruct_path(cameFrom, cameFrom[current_node])
         return (p + current_node)
     else
         return current_node
    */
  if (cameFrom[current.id]) {
    var p = this._reconstructPath(cameFrom, cameFrom[current.id]);
    return p.concat([current]);
  } else {
    return [current];
  }
};
/* end Graph */

/* class Node */
function Node(options) {
  _.extend(this, {
    x: 0, y: 0,
    links: []
  }, options);

  addId(this);
}
/* end Node */


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
      g.nodes[index].links.push(n);
    }
  });

  labels = {};
  _.each(g.nodes, function(node) {
    labels[node.id] = $('<label>').appendTo('.overlay');
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
