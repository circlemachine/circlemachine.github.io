function Vec(x, y) {
    if (typeof y === "undefined") {
        this.x = x.x;
        this.y = x.y;
    } else {
        this.x = x;
        this.y = y;
    }
}

Vec.prototype.add = function (v) {
    return new Vec(this.x + v.x, this.y + v.y);
};

Vec.prototype.sub = function (v) {
    return this.add(v.mul(-1));
};

Vec.prototype.mul = function (n) {
    return new Vec(this.x * n, this.y * n);
};

Vec.prototype.div = function (n) {
    return this.mul(1 / n);
};

Vec.prototype.mag = function () {
    return Math.hypot(this.x, this.y);
};
