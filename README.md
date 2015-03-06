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