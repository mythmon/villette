/* Class SpriteSheet */
function SpriteSheet(options) {
  _.extend(this, {
    src: null,
    image: null,
    tile_width: 32,
    tile_height: 32,
    callback: function(){}
  }, options);

  this.image = new Image();
  $(this.image).on('load', function() {
    async(this.callback);
  }.bind(this));
  this.image.src = this.src;
}
/* end SpriteSheet */

/* class Sprite */
function Sprite(options) {
  _.extend(this, {
    tx: 0, ty: 0,
    tw: 1, th: 1,
    cx: 0, cy: 0,
    sheet: null,
    sprites: []
  }, options);

  this.sx = this.tx * this.sheet.tile_width;
  this.sy = this.ty * this.sheet.tile_height;

  this.sw = this.tw * this.sheet.tile_width;
  this.sh = this.th * this.sheet.tile_height;
}

Sprite.prototype.draw = function(ctx, x, y) {
  x -= this.cx;
  y -= this.cy;
  ctx.drawImage(this.sheet.image, this.sx, this.sy, this.sw, this.sh, x, y, this.sw, this.sh);
};

Sprite.prototype.tile = function(tx, ty) {
  this.tx = tx;
  this.ty = ty;

  this.sx = this.tx * this.sheet.tile_width;
  this.sy = this.ty * this.sheet.tile_height;
};

Sprite.prototype.tick = function(){};
/* end class */

/* class Animation */
function Animation(options) {
  _.extend(this, {
    tw: 1, th: 1,
    cx: 0, cy: 0,
    sheet: null,
    frames: [],
    current: 0,
    animTime: 0
  }, options);

  var first = this.sheet.sprites[this.frames[this.current].name];

  this._sprite = new Sprite({
    sheet: this.sheet,
    tx: first.tx,
    ty: first.ty,
    tw: this.tw, th: this.th,
    cx: this.cx, cy: this.cy
  });
}

Animation.prototype.draw = function(ctx, x, y) {
  this._sprite.draw(ctx, x, y);
};

Animation.prototype.tick = function(dt){
  var changed = false;
  this.animTime += dt;

  while (this.animTime > this.frames[this.current].time) {
    this.animTime -= this.frames[this.current].time;
    this.current = (this.current + 1) % this.frames.length;
    changed = true;
  }
  if (changed) {
    var sprite = this.sheet.sprites[this.frames[this.current].name];
    this._sprite.tile(sprite.tx, sprite.ty);
  }
};
/* end Animation */

/* class AnimationSet */
function AnimationSet(opts) {
  _.extend(this, {
    animations: null,
    selector: null,
    animation: null
  }, opts);

  this.animation = this.animations[this.selector.format(this)];
  this._activeSelector = this.selector;
}

AnimationSet.prototype.tick = function(dt) {
  var state = this.selector.format(this);
  this.animation = this.animations[state];
  this.animation.tick(dt);
};

AnimationSet.prototype.draw = function(ctx, x, y) {
  this.animation.draw(ctx, x, y);
};
/* end AnimationSet */
