## Introduction

In the last Zetta tutorial, implemented a basic Scout class. In this tutorial, we'll explore Zetta apps. Apps let you query for devices and wire up interactions between them in JavaScript.

When you complete this tutorial, you will know how to:

* Write a simple Zetta app
* Use the app to coordinate interaction between devices 
* Use the Zetta browser to test the app

![Zetta Server](https://github.com/WWitman/zettajs-tutorials/blob/master/images/zetta-app.png)


## Before you begin

This tutorial builds on the previous tutorial. So, the best approach is to finish `3-scout` first, then jump to this tutorial.  

## Set up the project

We're going to begin by copying the completed code from the previous tutorial to a new project, and then we'll proceed to modify that code.

1. Create a project directory. You can name it anything you wish. In this tutorial, we'll call it `4-app`. 

2. cd to the directory.

3. Copy the `*.js` and `package.json` files from `3-scout` into the new `4-app` directory. 

4. Install the Node.js dependencies:

    `npm install zetta`


## Test the server

1. Start the server, same as you did in the previous tutorial:

  `node index.js`

  Be sure you see the same output in the terminal window as you did before. 

  ```
      Jan-27-2016 12:34:00 [scout] Device (state_machine) f9920348-bf55-4c47-b1a9-1c2587620458 was discovered
      Jan-27-2016 12:34:00 [scout] Device (state_machine) 45aa8603-f923-4271-9e89-dcd5684b0656 was discovered
      Jan-27-2016 12:34:00 [scout] Device (state_machine) af55810b-8894-4d91-9af0-126cfdc8ad25 was discovered
  ```

## About the app

Our app will be designed to wire up interactions between multiple State Machine devices. When one State Machine is on, they all turn on. When one is turned off, they all turn off. 

## Begin coding the app

The first thing to do is take a look at the [reference documentation](https://github.com/zettajs/zetta/wiki/Apps) for the Zetta apps. 

1. In an editor, create a new file in the `4-app` directory and call it `app.js`. 

2. Copy this code into the file. It queries for a device type, then waits until device(s) of that type come online.

>The code uses the where() method to form a query. The query specifies a name/value pair where the name is a device property and value is its value. The observe() method is a listener that waits until the queried device comes online, and then its callback is executed. 

  ```
    module.exports = function(server) {
     
      // Look up devices based on a property value
      var StateMachineQuery = server.where({type: 'state_machine'});
     
      // Wait for devices that fulfill the queries to come online
      server.observe([StateMachineQuery], function(state_machine) {
        console.log("State Machine came online");
      });
    }
  ```

3. Save the file. 


## Add the app to the server

1. Open the server file, `index.js`. 

2. Add the following require statement at the beginning of the file:

     `var StateMachineApp = require('./app.js');`

3. On the Zetta server object, add `.use(StateMachineApp)`:

    ```
     zetta()
        .name('State Machine Server')
        .use(StateMachineScout)
        .use(StateMachineApp)
        .listen(1337, function(){
           console.log('Zetta is running at http://127.0.0.1:1337');
      });
    ```

## Test the app

1. Start the Zetta server: 

    `node index.js`

2. The server output is shown below.

>Note that the console log statement is printed each time a device comes online.

    ```
    Jan-28-2016 08:13:19 [server] Server (State Machine Server) State Machine Server listening on http://127.0.0.1:1337
    Zetta is running at http://127.0.0.1:1337
    Jan-28-2016 08:13:20 [scout] Device (state_machine) 6016e9e8-552d-404f-802b-41e487353962 was discovered
    State Machine came online
    Jan-28-2016 08:13:20 [scout] Device (state_machine) be7ea1de-f0b9-4738-9196-09ae5f99dbfd was discovered
    State Machine came online
    Jan-28-2016 08:13:20 [scout] Device (state_machine) 131cbb89-13a0-49c8-aba7-463917cd2789 was discovered
    State Machine came online
    ```


## Quick review

At this point, we have the following Zetta components coded and working:

* Device -- Our device class models a state machine, where it is either on or off.
* Scout -- Our scout class is designed to wait one second, then discover three state machine devices. 
* App -- Our app module queries for devices of type state_machine, and listens for when they come online. When the appear, a callback function prints a message to the console. 
* Server -- The Zetta server uses all of these components. It generates REST APIs that allow users to interact with the devices. 

## Add a name property to the device class

We need a way for the app to be able to distinguish between the multiple State Machine devices. To do this, we'll add a name property to the StatMachineDevice object. 

1. In the `device.js` file, pass a parameter to the device constructor, then set the property in the class:

   ```
     var StateMachineDevice = module.exports = function(name) {
       Device.call(this);
       this.assignedName = name;
     }
   ```

2. Next, change the hard-coded name to the new name property that we added to the class:

    ```js
      config
          .type('state_machine')
          .state('off')
          .name(this.assignedName);
    ```

3. Now, open the `scout.js` file, and pass a name argument to each discover() function. This tells the function to pass the name to the constructor of each device when it is discovered and instantiated by Zetta.

   ```js
       StateMachineScout.prototype.init = function(next) {
          var self = this;
          setTimeout(function() {
            self.discover(StateMachine, 'machine_1');
            self.discover(StateMachine, 'machine_2');
            self.discover(StateMachine, 'machine_3');
          }, 1000);
          next();
        }
   ```




## Modify the app to query for named devices

Now, we'll create a separate query for each device, and then tell Zetta to listen for when those devices appear online. 

>The observe() method can take an array of queries. This allows Zetta to wait for all three devices with the specified properties to come online. The callback will not fire if only machine 1 is online. It won't be called until all three are online. 

```js
    module.exports = function(server) {

      var StateMachine_1_Query = server.where({type: 'state_machine', name: 'machine_1'});
      var StateMachine_2_Query = server.where({type: 'state_machine', name: 'machine_2'});
      var StateMachine_3_Query = server.where({type: 'state_machine', name: 'machine_3'});

      server.observe([StateMachine_1_Query, StateMachine_2_Query, StateMachine_3_Query], function(state_machine) {
        console.log("State Machine came online: " + machine_1.name + ", " + machine_2.name + ", " + machine_3.name);
      });
    }
```

If you run the server, you can verify that the callback is called after all three devices have been discovered:

```
Jan-28-2016 09:08:06 [server] Server (State Machine Server) State Machine Server listening on http://127.0.0.1:1337
Zetta is running at http://127.0.0.1:1337
Jan-28-2016 09:08:07 [scout] Device (state_machine) ff4b29a4-46ef-477f-aa9c-82e5f1c5f9d8 was discovered
Jan-28-2016 09:08:07 [scout] Device (state_machine) 99f66c15-ebea-4ef5-87be-91f176805f9e was discovered
Jan-28-2016 09:08:07 [scout] Device (state_machine) 80ab84be-afee-49f6-9bc8-4782151b24ab was discovered
State Machine came online: machine_1, machine_2, machine_3
```

## Use the emitter pattern to connect the devices

Our goal is to turn all the machines off when one is off, and turn all on when one is turned on. 

>The following code is similar to the EventEmitter pattern in Node.js. In Zetta, state transitions are emitted as Node.js events on objects. So, when we call 'turn-off' on a device object, that transition is emitted as an event that we can capture and use to manipulate other devices. 

Here is the finished app.js code:

```
    module.exports = function(server) {

      var StateMachine_1_Query = server.where({type: 'state_machine', name: 'machine_1'});
      var StateMachine_2_Query = server.where({type: 'state_machine', name: 'machine_2'});
      var StateMachine_3_Query = server.where({type: 'state_machine', name: 'machine_3'});

      server.observe([StateMachine_1_Query, StateMachine_2_Query, StateMachine_3_Query], function(machine_1, machine_2, machine_3) {
        console.log("State Machine came online: " + machine_1.name + ", " + machine_2.name + ", " + machine_3.name);

            machine_1.on('turn-off', function() {
              machine_2.call('turn-off');
              machine_3.call('turn-off');
            });

            machine_1.on('turn-on', function() {
              machine_2.call('turn-on');
              machine_3.call('turn-on');
            });
      });
    }
```

## TODO

add a timer to demonstrate how the scout listens perpetually.

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





