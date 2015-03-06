var ot = require('ot-slate0');
var model = require('./model');

var type = ot(model);

module.exports = {
	type: type,
	model: model,
	Cursor: require('./cursor'),
	Operations: require('./operations')
};