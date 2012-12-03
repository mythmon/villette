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
