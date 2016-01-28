## Introduction

In the last Zetta tutorial, created a simple Zetta state machine device. In this tutorial, we'll introduce you to the Scout class and write a simple Scout. 

When you complete this tutorial, you will know how to:

* Write a simple Scout module
* Use the Scout to discover multiple devices 
* Use the Zetta browser to interact with devices

![Zetta Server](https://github.com/WWitman/zettajs-tutorials/blob/master/images/zetta-scout.png)

## What is a Scout?

A Scout is a Zetta class that finds devices connected to a Zetta server. When the Zetta server starts up, it's possible that not all of its devices are online. A Scout runs perpetually in the background, constantly searching for devices, and discovering when they are available. 

Zetta makes it easy to create Scouts that discover devices that communicate over a variety of protocols, such as Bluetooth, Zigby, or plain old HTTP. 

## Before you begin

This tutorial builds on the previous tutorial. So, the best approach is to finish `2-state-machine` first, then jump to this tutorial.  

## Set up the project

We're going to begin by copying the completed code from the second tutorial to a new project, and then we'll proceed to modify that code.

1. Create a project directory. You can name it anything you wish. In this tutorial, we'll call it `2-scout`. 

2. cd to the directory.

3. Copy the `*.js` and `package.json` files from `2-state-machine` into the new `3-scout` directory. 

4. Install the Node.js dependencies:

    `npm install zetta`


## Test the server

1. Start the server, same as you did in the previous tutorial:

  `node index.js`

  Be sure you see the same output in the terminal window as you did before. 

  ```
      Jan-22-2016 15:34:18 [scout] Device (state_machine) 7cbf5759-4106-4985-83aa-e970fe13490d was discovered
      Jan-22-2016 15:34:18 [server] Server (State Machine Server) State Machine Server listening on http://127.0.0.1:1337
      Zetta is running at http://127.0.0.1:1337
  ```


## Quick review

You may have noticed in the output that a scout discovered a device:

```
Jan-22-2016 15:34:18 [scout] Device (state_machine) 7cbf5759-4106-4985-83aa-e970fe13490d was discovered
```

This is because Zetta has a default, built-in Scout. It's designed to find devices that are registered with the server. But the built-in Scout is limited. There's much, much more you can do by building your own Scouts. That's why it's important to learn to develop your own Scouts.

## Begin coding the Scout class

The first thing to do is take a look at the [reference documentation](https://github.com/zettajs/zetta/wiki/Scout) for the Zetta Scout class. Writing a Scout class is a lot like writing a Device. You create a JavaScript class that inherits from Scout and write an init() function. 

1. In an editor, create a new file in the `3-scout` directory and call it `scout.js`. 

2. Require these modules. 

  ```
  var Scout = require('zetta').Scout;
  var util = require('util');
  var StateMachine = require('./device.js');
  ```

3. Add code to construct the Scout class:

  ```
    StateMachineScout = module.exports = function() {
      Scout.call(this);
    }
    util.inherits(StateMachineScout, Scout);
  ```

4. Next, we'll implement the `init()` function. You need to add code to this function that "listens" for a device. When the device shows up as ready, you call the `discover()` function and pass in the Device object. 

>In this simple Scout, we're faking the discovery process with a setTimeout function, which executes the discover() method after one second. In a real situation, you'd put code in init() that is capable of finding and interacting with actual devices on your network. 

```
   StateMachineScout.prototype.init = function(next) {
      var self = this;
      setTimeout(function() {
        self.discover(StateMachine)
      }, 1000);
      next();
    }
```



## Add the Scout to the server

1. Open the server file, `index.js`. 
2. Remove the statement requiring the `device.js` module. That is, remove this line:

     `var StateMachineDevice = require('./device.js');`

3. Now, require the Scout module you just implemented. The require statements should look like this:
    ```
    var zetta = require('zetta');
    var StateMachineScout = require('./scout.js');
    ```

3. Likewise, on the Zetta server object, remove the `.use(StateMachineDevice)`call and replace it with `.use(StateMachineScout)`:

    ```
     zetta()
        .name('State Machine Server')
        .use(StateMachineScout)
        .listen(1337, function(){
           console.log('Zetta is running at http://127.0.0.1:1337');
      });
    ```

## Test the device

1. Start the Zetta server: 

    `node index.js`

2. The server output should look like this.  

    ```
    Jan-27-2016 12:28:27 [server] Server (State Machine Server) State Machine Server listening on http://127.0.0.1:1337
    Zetta is running at http://127.0.0.1:1337
    Jan-27-2016 12:28:28 [scout] Device (state_machine) 7983819f-59e8-4b5c-a9cc-bcfe73d72c8b was discovered
    ```

>Notice the output has some new information that we didn't see before -- the State Machine device we added to the server was discovered by something called a "scout". We'll discuss scouts in detail in another topic. For now, just note that the device was discovered. This means that Zetta found the device and has generated APIs for it.

## Modify the Scout to find multiple Devices

For fun, let's tell the Scout to find more StateMachine devices. Just add more discover() methods to the init() function in scout.js, like this:

```
StateMachineScout.prototype.init = function(next) {
    var self = this;

    setTimeout(function() {
      self.discover(StateMachine)
      self.discover(StateMachine)
      self.discover(StateMachine)
    }, 1000);

    next();
}
```

Now, stop the server and restart it. You'll see that Zetta has discovered three StateMachine devices.

```
Jan-27-2016 12:34:00 [scout] Device (state_machine) f9920348-bf55-4c47-b1a9-1c2587620458 was discovered
Jan-27-2016 12:34:00 [scout] Device (state_machine) 45aa8603-f923-4271-9e89-dcd5684b0656 was discovered
Jan-27-2016 12:34:00 [scout] Device (state_machine) af55810b-8894-4d91-9af0-126cfdc8ad25 was discovered
```


## Use the Zetta Browser to interact with the devices

Zetta has a browser client that you can simply point at an instance of the Zetta server, and interact with whatever devices are available. It's a great tool for running and debugging Zetta projects. 

It's simple. Open a browser and hit this URL (assuming your Zetta server is running locally on port 1337):

`http://browser.zettajs.io/#/overview?url=http:%2F%2F127.0.0.1:1337`

And you'll see this UI:

![Zetta Server](https://github.com/WWitman/zettajs-tutorials/blob/master/images/zetta-browser.png)

You can click the buttons to interact with the devices (turn them on and off). And in the Zetta server terminal, you'll also see output indicating the state changes. 

>Behind the scenes, this browser client is interacting directly with the Zetta REST APIs that we saw in the last tutorial. 

## Summary

In this topic, we write our first Scout class. The scout waits for devices to come online and "discovers" them. Zetta generates REST APIs for the discovered devices. Clients can consume the APIs, much like the Zetta browser does, allowing end users to interact with the devices through web apps, mobile devices, other connected machines, and so on. 





