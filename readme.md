
Info
========

Kluster - library for create cluster solution base on weakly connected nodes.

Example
========

```javascript

var Kluster = require("./index");

var metadata = {
    url: "http://nodejs.com",
    version: "1.3.5.6",
    enable: true,
    entryPoints:  ["http://123.11.23.1:8787", "http://123.11.23.1:8788", "http://123.11.23.1:8789"]
};

var kluster = new Kluster(metadata);
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

```