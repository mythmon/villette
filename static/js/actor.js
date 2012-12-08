/* class Actor */
function Actor(options) {
  _.extend(this, {
    x: 16, y: 16,
    w: 32, h: 32,
    vx: 0, vy: 0,
    image: null
  }, options);
}

Actor.prototype.tick = function(dt) {
  this.x += this.vx * dt;
  this.y += this.vy * dt;
  this.image.tick(dt);
};

Actor.prototype.draw = function(ctx) {
  var x = Math.round(this.x);
  var y = Math.round(this.y);
  this.image.draw(ctx, x, y);
};
/* end Actor */


