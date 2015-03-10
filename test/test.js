var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;

var slate0 = require('../lib');
var Cursor = slate0.Cursor;
var Operations = slate0.Operations;
var m = slate0.model;
var type = slate0.type;

describe('Compose', function() {
	var doc = new m.Document(1,[new m.P(2,["This is some text."])]);
	var opA = new Operations().retain(6).insert(" really").end(doc.length).toOp();
	var opB = new Operations().retain(6+7).insert(" actually").end(doc.length+7).toOp();

	it('Can compose inverse', function() {
		var a = type.apply(doc, opA);
		var inv = type.invert(opA);
		var comp = type.compose(opA, inv);
		var b = type.apply(a, inv);		
		var c = type.apply(doc, comp);
		assert.equal(JSON.stringify(c),JSON.stringify(doc));
		assert.equal(JSON.stringify(b),JSON.stringify(doc));
	});

	it('Can compose inserts', function() {
		var a = type.apply(doc, opA);
		var comp = type.compose(opA, opB);
		var b = type.apply(a, opB);
		var c = type.apply(doc, comp);
		assert.equal(JSON.stringify(c),JSON.stringify(b));
	});

	it('Compose of inverse is inverse of compose', function() {
		var comp = type.compose(opA, opB);
		var ia = type.invert(opA);
		var ib = type.invert(opB);
		var icomp = type.invert(comp);
		var compi = type.compose(ib, ia);
		var dp = type.apply(doc, comp);
		var a = type.apply(dp, icomp);
		var b = type.apply(dp, compi);
		assert.equal(JSON.stringify(a),JSON.stringify(doc));
		assert.equal(JSON.stringify(b),JSON.stringify(doc));
	});
});

describe('Apply', function() {
	var doc = new m.Document(1,[new 
		m.Section(2,[new m.P(4,["This is some text."])]), 
		new m.Section(3,[])]);
	var opsB = new Operations()
		.retain(22)
		.insert({_type:'P'})
		.insert('This is some text')
		.insert({_type:'Section'})
		.insert({_type:'H3'})
		.insert('this is more text')
		.end(doc.length).toOp();

	it('Can insert text into string', function() {
		var ops = new Operations()
			.retain(13)
			.insert('mething aweso')
			.retain(9).toOp();
		var x = type.apply(doc, ops);
		assert.equal(JSON.stringify(x), 
			'{"type":"Document","id":1,"children":[{"type":"Section","id":2,"children":[{"type":"P","id":4,"children":["This is something awesome text."]}]},{"type":"Section","id":3,"children":[]}]}');
	});

	it('Can insert paragraph into empty section', function() {
		var y = type.apply(doc, opsB);
		assert.equal(JSON.stringify(y),
			'{"type":"Document","id":1,"children":[{"type":"Section","id":2,"children":[{"type":"P","id":4,"children":["This is some text."]}]},{"type":"Section","id":3,"children":[{"type":"P","id":5,"children":["This is some text"]}]},{"type":"Section","id":6,"children":[{"type":"H3","id":7,"children":["this is more text"]}]}]}');
		});

	it('Roundtrip apply and apply invert', function() {
		var y = type.apply(type.apply(doc, opsB), type.invert(opsB));
		assert.equal(JSON.stringify(y),JSON.stringify(doc));
	});
});

describe('From JSON', function() {
	var doc = new m.Document(1,[new 
		m.Section(2,[
			new m.P(4,["This is some text."],
				{note:"A note attached to the paragraph."})]), 
		new m.Section(3,[])], {note:"A note attached to the document."});

	it('Can deserialise from JSON', function(){
		var json = JSON.stringify(doc);
		var docD = m.fromJSON(JSON.parse(json));
		assert.equal(json, JSON.stringify(docD));
		assert.equal(doc.length, docD.length);
	});
});

describe('Cursor', function() {
	/*
	var table = new m.Table(1, [
		//m.attrib('alignments',['left','right']),
		new m.THead(2,[
			new m.Row(5,[
				new m.Cell(6,["Some text to go in the cell."]), 
				new m.Cell(15,["Header2"])])]), 
		new m.TBody(3,[
			new m.Row(7,[new m.Cell(8,[
		"Text that is not bold before",
		m.tag('strong',{}),
		"Some bold text to go in the ",
		m.tag('em',{}),"bold italic"," cell.",
		m.endtag('strong'), " and not bold after.",
		m.endtag('em')]),
				new m.Cell(17,[m.attrib('rowSpan',2),"99"])
			]),
			new m.Row(27,[new m.Cell(28,[
		"Text that is not bold before",
		m.tag('strong',{}),
		"Some bold text to go in the ",
		m.tag('em',{}),"bold italic"," cell.",
		m.endtag('strong'), " and not bold after.",
		m.endtag('em')])
			]),
			new m.Row(37,[new m.Cell(38,[m.attrib('colSpan',2),
		"Text that is not bold before",
		m.tag('strong',{}),
		"Some bold text to go in the ",
		m.tag('em',{}),"bold italic"," cell.",
		m.endtag('strong'), " and not bold after.",
		m.endtag('em')])
			])]), 
		new m.TFoot(4,[
			])]);

	var doc = new m.Document(10,[
	new m.Section(12,[
		new m.H1(16, ["Dummy document"]), 
		new m.P(14,["This is some text. Lorem ipsum dolor",m.endtag('strong')," sit amet, consectetur adipisicing elit. Corrupti ",m.tag('a',{href: "http://google.co.uk"}),"vitae",m.endtag('a'),", aliquid ex necessitatibus repellat",m.tag('sup',{}),"TM",m.endtag('sup')," a illo fuga dolore aperiam totam tempore nisi neque delectus labore, nihil quae dignissimos dolores mollitia? Vel sunt neque voluptatibus excepturi laboriosam possimus adipisci quidem dolores, omnis nemo dolore",m.tag('strong',{})," eligendi blanditiis, voluptatem in doloribus hic aperiam."])]), 
	new m.Section(13,[
		table, 
		new m.P(9,["This is a test"]),
		new m.Ulli(20,["First list item"]),
		new m.Ulli(21,["Second list item"]),
		new m.Olli(22,["First list item"]),
		new m.Olli(23,["Second list item"]),
		new m.Code(24,["Some code here"]),
		new m.Code(25,["Some more code here"]),
		new m.Quote(18,["This is a",m.tag('strong',{})," really ",m.endtag('strong'),"important quote."])])
	]);

	it('Can select in H1 with correct offset', function() {
		var toff = 12;
		var pos = doc.positionFromPath([16,12,10],toff);
		var cursor = doc.selectedNodes(pos, pos)[0];
		var textOff = cursor.node.textOffset(cursor.start);
		assert.equal(doc.children[0].children[0], cursor.node);
		assert.equal(toff, textOff);
	});
	it('Can select end of node', function() {
		var toff = 14;
		var pos = doc.positionFromPath([16,12,10],toff);
		var cursor = doc.selectedNodes(pos, pos)[0];
		var textOff = cursor.node.textOffset(cursor.start);
		assert.equal(doc.children[0].children[0], cursor.node);
		assert.equal(toff, textOff);
	});
	it('Can select end of document', function() {
		var toff = 33;
		var pos = doc.positionFromPath([18,13,10],toff);
		var cursor = doc.selectedNodes(pos, pos)[0];
		var textOff = cursor.node.textOffset(cursor.start);
		assert.equal(doc.children[1].children[8], cursor.node);
		assert.equal(toff, textOff);
	});
	it('Can select in table cell', function() {
		var toff = 7;
		var pos = doc.positionFromPath([8,7,3,1,13,10],toff);
		var cursor = doc.selectedNodes(pos, pos)[0];
		var textOff = cursor.node.textOffset(cursor.start);
		assert.equal(
			doc.children[1].children[0].children[2].children[0].children[0], 
			cursor.node);
		assert.equal(toff, textOff);
	});*/
})


describe('Commands', function() {
});

