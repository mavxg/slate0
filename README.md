# slate0

Document model for operational transform based editor SlateJS

## Usage Client Side

    var slate0 = require('slate0');
    var sharejs = require('share').client;
    sharejs.registerType(slate0.type);

## Usage Server Side

    var slate0 = require('slate0');
    var livedb = require('livedb');
    livedb.ot.registerType(slate0.type);

# TODO

* [ ] Add move operation
* [ ] Zero width refs (idea, can we use inital offset as ref label to make compose trivial?)
* [ ] Reinstate Attribute class
* [ ] Ensure ids not sent in operation (except create)
* [ ] New acyclic table model

Each TODO item includes tests before it is done.