

function Cursor(anchor, focus) {
	this.anchor = anchor;
	this.focus  = focus;
}
Cursor.prototype.isInverted = function() {
	return this.focus < this.anchor;
};
Cursor.prototype.isCollapsed = function() {
	return this.focus === this.anchor;
};
Cursor.prototype.transform = function(ops) {
	var newAnchor = transformIndex(this.anchor, ops);
	if (this.isCollapsed())
		return new Cursor(newAnchor, newAnchor);
	return new Cursor(newAnchor, transformIndex(this.focus, ops));
};
Cursor.prototype.start = function() {
	return Math.min(this.anchor, this.focus);
};
Cursor.prototype.end = function() {
	return Math.max(this.anchor, this.focus);
};

function transformIndex(_index, _ops) {
	var ops = _ops;
	var index = _index;
	var newIndex = index;
	var l = ops.length;
	for (var i = 0; i < l; i++) {
		var op = ops[i];
		if (typeof op === 'number') {
			index -= op;
		} else if (op.i !== undefined) {
			newIndex += (typeof op.i === 'string') ? op.i.length : 1;
		} else {
			var n = (typeof op.d === 'string') ? op.d.length : 1;
			//remove
			newIndex -= Math.min(index, n);
			index -= n;
		}
		if (index < 0) { break; }
	}
	return newIndex;
}

//TODO: represent a Cursor as multiple ranges not just one.

module.exports = Cursor;