var ot = require('ot-slate0');
var model = require('./model').Document;

var type = ot(model);

module.export = {
	type: type,
	model: model
};