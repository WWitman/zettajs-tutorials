var Device = require('zetta').Device;
var util = require('util');
var bone = require('bonescript');

var BeagleBoneLedDevice = module.exports = function(pin) {
     this.assignedPin = pin;
     Device.call(this);
    }

util.inherits(BeagleBoneLedDevice, Device);


BeagleBoneLedDevice.prototype.init = function(config) {

      var self = this;
      // everything is off to start
      bone.pinMode(self.assignedPin, 'out');
      bone.digitalWrite(self.assignedPin, 0);
      
      // Set up the state machine 
      config
        .type('beaglebone_led')
        .state('off')
        .name(self.assignedPin);

      config
        // Define the transitions allowed by the state machine
        .when('off', {allow: ['turn-on']})
        .when('on', {allow: ['turn-off']})

        // Map the transitions to JavaScript methods
        .map('turn-off', this.turnOff)
        .map('turn-on', this.turnOn)
    }


    BeagleBoneLedDevice.prototype.turnOff = function(cb) {
      var self = this;
      this.state = 'off';
      bone.digitalWrite(self.assignedPin, 0);
      cb();
    }

    BeagleBoneLedDevice.prototype.turnOn = function(cb) {
      var self = this;
      this.state = 'on';
      bone.digitalWrite(self.assignedPin, 1);
      cb();
    }