//Document considered to be

// ["text",{object taking up one character},"more text", etc]

// ... This works except for range based things like bold, link, comment
// etc. Especially if you can have an overlapping range of things.
// --- actually it works for those so long as the individual clients
// --- didn't try to delete half a pair.

function Retain(n) {
	this.n = n;
	this.inputLen = n;
	this.targetLength = n;
}
function Remove(str_or_obj) {
	this.str = str_or_obj;
	this.n = (typeof str_or_obj === 'string') ? str_or_obj.length : 1;
	this.inputLen = this.n;
	this.targetLength = 0;
}
function Insert(str_or_obj) {
	this.str = str_or_obj;
	this.n = (typeof str_or_obj === 'string') ? str_or_obj.length : 1;
	this.inputLen = 0;
	this.targetLength = this.n;
}

Retain.prototype.invert = function() { return this; };
Remove.prototype.invert = function() { return new Insert(this.str); };
Insert.prototype.invert = function() { return new Remove(this.str); };


Retain.prototype.toOp = function() { return this.n; };
Remove.prototype.toOp = function() { return {d:this.str}; };
Insert.prototype.toOp = function() { return {i:this.str}; };


Retain.prototype.slice = function(s, e) {
	var real_end = (e === undefined ? this.n : e);
	var ret = new Retain(real_end - s);
	return ret;
};
Remove.prototype.slice = function(s, e) {
	if (typeof this.str === 'string')
		return new Remove(this.str.slice(s, e));
	return this;
};
Insert.prototype.slice = function(s, e) {
	if (typeof this.str === 'string')
		return new Insert(this.str.slice(s, e));
	return this;
};

function _invert(op) { return op.invert(); }
function _toOp(op) { return op.toOp(); }
function _fromOp(op) {
	if (typeof op === 'number') return new Retain(op);
	if (op.i !== undefined) return new Insert(op.i);
	return new Remove(op.d);
}

function Operations(ops) {
	this.ops = ops || [];
	this.inputLen = 0;
	this.targetLength = 0;
	for (var i = this.ops.length - 1; i >= 0; i--) {
		this.inputLen += this.ops[i].inputLen;
		this.targetLength += this.ops[i].targetLength;
	};
}

Operations.fromOp = function(op) {
	return new Operations(op.map(_fromOp));
};

function _type(op) {
	if (op instanceof Retain) return 'retain';
	if (op instanceof Remove && typeof op.str === 'string') return 'remove';
	if (op instanceof Insert && typeof op.str === 'string') return 'insert';
	return 'object';
}

Operations.prototype.push = function(op) { 
	this.inputLen += op.inputLen;
	this.targetLength += op.targetLength;
	if (this.ops.length > 0) {
		var nt = _type(op);
		var ot = _type(this.ops[this.ops.length - 1]);
		if (nt === ot && nt !== 'object') {
			var oop = this.ops.pop();
			switch(nt) {
				case 'retain':
					op = new Retain(op.n + oop.n);
					break;
				case 'remove':
					op = new Remove(oop.str + op.str);
					break;
				case 'insert':
					op = new Insert(oop.str + op.str);
					break;
			}
		}
	}
	this.ops.push(op);
};
Operations.prototype.pushs = function(ops) {
	ops.forEach(this.push, this);
};
Operations.prototype.retain = function(n) { 
	this.push(new Retain(n)); 
	return this;
};
Operations.prototype.remove = function(str) { 
	this.push(new Remove(str)); 
	return this;
};
Operations.prototype.insert = function(str) { 
	this.push(new Insert(str)); 
	return this;
};
Operations.prototype.end = function(len) { 
	this.push(new Retain(len - this.inputLen)); 
	return this;
};
Operations.prototype.invert = function() {
	return new Operations(this.ops.map(_invert));
};
Operations.prototype.toOp = function() {
	return this.ops.map(_toOp);
};

Operations.isRetain = function(op) { return (op instanceof Retain); };
Operations.isRemove = function(op) { return (op instanceof Remove); };
Operations.isInsert = function(op) { return (op instanceof Insert); };

Operations.prototype.isRetain = Operations.isRetain;
Operations.prototype.isRemove = Operations.isRemove;
Operations.prototype.isInsert = Operations.isInsert;

module.exports = Operations;