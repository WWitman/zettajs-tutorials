## Introduction

In the last Zetta tutorial, we expanded our Zetta project using an app to wire up interactions between devices. 

In this tutorial, we'll show you how to write a Device class that can accept and stream out user input given to transition functions. Finally, we'll test the code using the Zetta browser. 

When you complete this tutorial, you will know how to:

* Write a Device class that allows input to be provided to transition functions
* Use the Zetta browser to test the code

![Zetta Server](https://github.com/WWitman/zettajs-tutorials/blob/master/images/zetta-scout.png)


## Before you begin

This tutorial builds on the previous tutorial. So, the best approach is to finish `4-app` first, then jump to this tutorial.  

## Set up the project

We're going to begin by copying the completed code from the previous tutorial to a new project, and then we'll proceed to modify that code.

1. Create a project directory. You can name it anything you wish. In this tutorial, we'll call it `5-input`. 

2. cd to the directory.

3. Copy the `*.js` and `package.json` files from `4-app` into the new `5-input` directory. 

4. Install the Node.js dependencies:

    `npm install zetta`


## Test the server

1. Start the server, same as you did in the previous tutorial:

  `node index.js`

  Be sure you see the same output in the terminal window as you did before. 

  ```
      Jan-28-2016 09:08:06 [server] Server (State Machine Server) State Machine Server listening on http://127.0.0.1:1337
      Zetta is running at http://127.0.0.1:1337
      Jan-28-2016 09:08:07 [scout] Device (state_machine) ff4b29a4-46ef-477f-aa9c-82e5f1c5f9d8 was discovered
      Jan-28-2016 09:08:07 [scout] Device (state_machine) 99f66c15-ebea-4ef5-87be-91f176805f9e was discovered
      Jan-28-2016 09:08:07 [scout] Device (state_machine) 80ab84be-afee-49f6-9bc8-4782151b24ab was discovered
      State Machine came online: machine_1, machine_2, machine_3
  ```

## About the Device class

We're going to create a new Device class called Screen. You'll be familiar with how the class is created from previous tutorials. However, we'll take advantage of a couple of features we haven't seen yet.

First, we'll provide a third argument to the map() function. This argument allows you to pass input to the transition function. The argument is an object with two properties: `type` and `name`. 

Second, we'll use the Device.monitor() method. This method streams a property from your device instance out of Zetta. Zetta monitors the property for changes, and if they occur it will publish an event down the stream.

## Device code

You might want to take a look at the [reference documentation](https://github.com/zettajs/zetta/wiki/Device) for the Zetta Device class. There, you'll find information on the map() and monitor() methods. 

1. In an editor, open a file and call it `screen.js`. 

2. Copy the following code into the file. For the most part, it should look familiar. This is the standard pattern for creating Device classes. 

  ```js
    // screen.js

    Device = require('zetta').Device;
    var util = require('util');

    // Set up Screen class
    var Screen = module.exports = function() {
      Device.call(this);
    }

    util.inherits(Screen, Device);

    Screen.prototype.init = function(config) {

      // Class metadata
      config
        .type('screen')
        .name('state_machine_screen')
        .state('ready');

      // Set up state machine
      config
        .when('ready', { allow: ['write'] })
        .map('write', this.write, [{ type: 'text', name: 'textToWrite' }])
        .monitor('written');
    }

    Screen.prototype.write = function(textToWrite, cb) {
      this.written = textToWrite;
      cb();
    }
  ```

3. Save the file. 


## Add the app to the server

1. Open the server file, `index.js`. 

2. Add the following require statement at the beginning of the file:

     `var Screen = require('./screen.js');`

3. On the Zetta server object, add `.use(Screen)`:

    ```
     zetta()
        .name('State Machine Server')
        .use(StateMachineScout)
        .use(Screen)
        .use(StateMachineApp)
        .listen(1337, function(){
           console.log('Zetta is running at http://127.0.0.1:1337');
      });
    ```

## Test the device

1. Start the Zetta server: 

    `node index.js`

## Use the Zetta Browser to interact with the new device

Open a browser and hit this URL for the Zetta browser (assuming your Zetta server is running locally on port 1337):

`http://browser.zettajs.io/#/overview?url=http:%2F%2F127.0.0.1:1337`

You'll see the **state_machine_screen** UI. Enter some text in the input field:

![Zetta Server](https://github.com/WWitman/zettajs-tutorials/blob/master/images/zetta-write-1.png)

Then, click the **Write** button, and the text is written to the screen output.

![Zetta Server](https://github.com/WWitman/zettajs-tutorials/blob/master/images/zetta-write-2.png)

You can click the buttons to interact with the devices (turn them on and off). And in the Zetta server terminal, you'll also see output indicating the state changes. 

>Behind the scenes, this browser client is interacting directly with the Zetta REST APIs that we saw in the last tutorial. 

## Summary

In this topic, we write our first Scout class. The scout waits for devices to come online and "discovers" them. Zetta generates REST APIs for the discovered devices. Clients can consume the APIs, much like the Zetta browser does, allowing end users to interact with the devices through web apps, mobile devices, other connected machines, and so on. 





