var Scout = require('zetta').Scout;
var util = require('util');
var BeagleBoneLedDevice = require('./device.js');
var bonescript = require('./bonescript');

var pins = [];

BeagleBoneLedScout = module.exports = function() {

    this.pins =  Array.prototype.slice.call(arguments);

    Scout.call(this);
}

util.inherits(BeagleBoneLedScout, Scout);

BeagleBoneLedScout.prototype.init = function(next) {

    var self = this;

    bonescript.getPlatform(function(x) {
        self.pins.forEach(function(pin) {
            var query = self.server.where({type: 'beaglebone_led', pin: pin});
            self.server.find(query, function(err, results) {
              if (results[0]) {
                self.provision(results[0], BeagleBoneLedDevice, pin);
              } else {
                // Construct a new device with specified pin
                self.discover(BeagleBoneLedDevice, pin);
              }
            });
        });
    })  

    next();

}