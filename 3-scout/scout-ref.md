## Scout class reference

A Scout is a Zetta class that finds devices connected to a Zetta server. When the Zetta server starts up, it's possible that not all of its devices are online. A Scout runs perpetually in the background, constantly searching for devices, and discovering when they are available. 

### What you need to know

This is a class you inherit from when writing custom device drivers. Scouts are used to search for devices with external node modules, or protocols.
It's used by `require('zetta-scout')`. You must inherit from the `Scout` class when building custom Zetta modules.

### Usage

To use a Scout, you must add it to the Zetta server following this pattern:

```javascript
// server.js
var zetta = require('zetta');
var MyScout = require('./scout.js');

  zetta()
    .name('My Server')
    .use(MyScout)
    .listen(1337);
  });
```


### Sample implementation

When developing a Scout, follow this general pattern:

1. Add required modules. You must require the Scout class itself. The `util` module provides useful functions for doing inheritance. And at least one module of type Device is required. 
2. Construct a Scout object.
3. Implement the `init()` function. 

>This implementation is contrived, in that the init() function simply discovers the device after a one second interval. In a real use case, you could add code to init() that indicates the state of a real device on your network. 

```javascript
// scout.js
var Scout = require('zetta').Scout;
var util = require('util');
var MyDevice = require('./device.js');

// constructor
MyScout = module.exports = function() {
  Scout.call(this);
}

util.inherits(MyScout, Scout);

// init()
MyScout.prototype.init = function(next) {
    var self = this;

    setTimeout(function() {
      self.discover(MyDevice)
      self.discover(MyDevice)
      self.discover(MyDevice)
    }, 1000);

    next();
}
```

### Methods

#### Scout.init(next)

The `init()` function lets you to initialize any resources needed to look for devices. For example, you could add code to access Bluetooth devices, devices attached to a Beaglebone or Arduino processor, serial ports, or vendor modules. 

**Arguments**

* **next** The `next` argument is a callback function that is called after the Scout has been intitialized. The callback notifies Zetta that the Scout is started, and Zetta can move on to initialize another Scout if needed or to perform another task. 

**Example**

```js
DeviceScout.prototype.init = function(next) {
  var connection = Serial.connect(function(){
  });

  connection.on('start', function(){
    next();
  });
};

```

#### Scout.discover(constructor, [arguments])

Call this method when a device has been found. 

**Arguments**

* `constructor` An object of type Device. This is the device that you wish the Scout to discover. 

* `arguments` List of objects to pass as parameters to the Device constructor. 


```js
DeviceScout.prototype.init = function(next) {
  this.discover(DeviceDriver, foo, bar, 'baz');
};
```



#### Scout.provision(deviceObj, constructor)

Persists device data to an internal registry. The registry is a small database that lives in the Zetta server context, and holds information about devices connected to the server itself.

Using an object retrieved from this registry you can initialize a device that Zetta already knows about. 

**Arguments**

* **deviceObj** - An object with device data to be persisted in the database.

* **constructor** - An object of type Device that specifies the type of device object to create. 


```js
DeviceScout.prototype.init = function(next) {
  var deviceObject = {
    name:'testObject',
    id: '123',
    foo: 'bar'
  };
  this.provision(deviceObject, DeviceDriver);
};
```

### Properties

#### Scout.server

Provides access to the Zetta runtime. Allows you to issue queries and lookup devices that Zetta already knows about.

**Example**

```js
DeviceScout.prototype.init = function(next) {
  var self = this;

  // query registry for any device that has type led and an id that we know of.
  var query = this.server.where({ type: 'lcd', id: 'some-id' });
  this.server.find(query, function(err, results) {
    if (results.length > 0) {
      // found in registry, tell zetta it came online
      self.provision(results[0], DeviceDriver, foo, bar, 'baz');
    } else {
      // does not exist in registry, discover a new one.
      self.discover(DeviceDriver, foo, bar, 'baz');
    }
  });
};

```