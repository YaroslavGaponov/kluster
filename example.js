/*
 * copyright (c) 2013 Yaroslav Gaponov <yaroslav.gaponov@gmail.com>
 */

var Kluster = require("./index");

var kluster = new Kluster({ url: "http://nodejs.com" });
kluster.onNewNodeMetadata(
    function(metadata, info) {
        console.log(metadata);
    }
);
kluster.start();

process.on("exit", function() {
    if (kluster) {
        kluster.stop();
        kluster = null;
    }
});