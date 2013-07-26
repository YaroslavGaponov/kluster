/*
 * copyright (c) 2013 Yaroslav Gaponov <yaroslav.gaponov@gmail.com>
 */

var dgram = require("dgram");
var util = require("util");

var Kluster = module.exports = function(metadata, options) {
    var self = this;

    if (self instanceof Kluster) {
        
        self.metadata = metadata || {};
        if (!self.metadata._id) {
            self.metadata._id = Kluster.getRandomID();
        }
        
        options = options || {};
        self.options = {
            BROADCAST_HOST:     options.BROADCAST_HOST   || "224.2.2.4",
            BROADCAST_PORT:     options.BROADCAST_PORT   || 78787,
            REGISTRATOR_PORT:   options.REGISTRATOR_PORT || 78788,
            TTL:                options.TTL              || 3
        };
                
        self.listener = dgram.createSocket("udp4");
        self.listener.on("message", function (message, info) {
            var metadata = JSON.parse(message);
            if (metadata._id != self.metadata._id) {
                self._send(info.address, self.options.REGISTRATOR_PORT, self.metadata);
                if (self.handler && (typeof self.handler === "function")) {
                    var metadata = JSON.parse(message);
                    self.handler(metadata, info);
                }
            }
        });
        self.listener.on("listening", function () {
           self.listener.addMembership(self.options.BROADCAST_HOST);
           self.listener.setMulticastTTL(self.options.TTL);
        });


        self.registrator = dgram.createSocket("udp4");        
        self.registrator.on("message", function (message, info) {
            if (self.handler && (typeof self.handler === "function")) {
                var metadata = JSON.parse(message);
                self.handler(metadata, info);
            }            
        });        
        self.registrator.on("listening", function () {
            self.registrator.setMulticastTTL(self.options.TTL);
        });        
        self.registrator.bind(self.options.REGISTRATOR_PORT);
        
        
    } else {    
        return new Kluster(options);
    }
}

Kluster.prototype.onNewNodeMetadata = function(handler) {
    this.handler = handler;
}


Kluster.prototype._send = function(host, port, message, cb) {
    var self = this;
    
    if (!Buffer.isBuffer(message)) {
        if (typeof message === "object") {
            message = JSON.stringify(message);
        }
        message = new Buffer(message);
    }
    
    var client = dgram.createSocket("udp4");
    client.send(message, 0, message.length, port, host, function(err, bytes) {
        client.close();
    });
}

Kluster.prototype._broadcast = function(message, cb) {
    var self = this;
    
    if (!Buffer.isBuffer(message)) {
        if (typeof message === "object") {
            message = JSON.stringify(message);
        }        
        message = new Buffer(message);
    }
    
    var sendSocket = dgram.createSocket('udp4');

    sendSocket.bind(this.options.BROADCAST_PORT);
    sendSocket.on('listening', function () {
      sendSocket.setBroadcast(true);
      sendSocket.send(message, 0, message.length, self.options.BROADCAST_PORT, self.options.BROADCAST_HOST, function(err) {
            if (cb && (typeof cb === "function")) {
                cb(err);
            }
      });
    });    
}

Kluster.prototype.start = function() {
    this._broadcast(this.metadata);
    this.listener.bind(this.options.BROADCAST_PORT);
}

Kluster.prototype.stop = function() {
    this.listener.close();
}

Kluster.getRandomID = function(size) {
    size = size || 16;
    var abc = "abcdefghijklmnopqrstuvwxyz0123456789";
    var id = [];    
    for (var i=0; i<size; i++) {
        id.push(abc[Math.floor(Math.random() * abc.length)]);
    }
    return id.join("");
}

