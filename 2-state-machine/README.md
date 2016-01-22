## Introduction


In the first Zetta tutorial, we set up a Zetta project, configured a Zetta server, and called its API.

In this tutorial, we'll create a simple Zetta device that models a state machine. When you complete this tutorial, you will know how to:

* Create a Zetta device
* Configure the Zetta server to discover the device
* Use the Zetta API to toggle the state of the device on and off

![Zetta Server](https://github.com/WWitman/zettajs-tutorials/blob/master/images/zetta-device.png)


## Before you begin

To complete this tutorial, you must have Node.js installed on your system. We assume you understand the basics of Node.js and can create and run simple Node.js programs. See [About the Zetta Tutorials](https://github.com/WWitman/zettajs-tutorials/blob/master/README.md) for details. 

## What is a Zetta device

In Zetta, a device is software that models the behavior of a physical device. In this example, the device models a simple state machine. Through the Zetta APIs, you'll be able to switch the state on and off. In later tutorials, we'll apply the same patterns to allow Zetta to interact with physical devices. 

## About the state machine

The following diagram illustrates how our state machine works. When the state is `off` it can only transition to the `on` state, and conversely when the state is `on` it can only transition to `off`.

![State Device](http://www.zettajs.org/images/projects/security_system/state_machine.png)


## Create the Zetta project

1. Create a project directory. You can name it anything you wish. In this tutorial, we'll call it `2-state-machine`. 

2. cd to the directory.

3. Execute this command to create a new Node.js project: 

    `npm init`

4. Hit return several times to accept all the defaults. This step creates a `package.json` file, which contains meta information about the project and its dependencies. 

5. Install the `zetta` Node.js module. The `--save` option adds `zetta` to the `package.json` dependencies list. 

    `npm install zetta --save`


You now have a bare-bones Zetta project containing a `node_modules` directory and a `package.json` file. Next, we'll set up the Zetta server.


## Set up the Zetta server

Let's set up the Zetta server and run it locally. 

1. If it's still running, top the Zetta server with `Control-c`. 
2. Be sure you're in the `2-state-machine` directory.

3. In a text editor, create a new file called `index.js`, and copy this code into it:

  ```js
  var zetta = require('zetta');

  zetta()
    .name('State Machine Server')
    .listen(1337, function(){
       console.log('Zetta is running at http://127.0.0.1:1337');
  });
  ```


4. Save the file.

You now have a minimally configured Zetta server. 

## Test the server

In the `2-state-machine` directory, enter this command: 

`node index.js`

You'll see output like the following. The output confirms that the server is running on port 1337 and tells you the name of the server (State Machine Server).

```
Jan-22-2016 10:18:36 [server] Server (State Machine Server) State Machine Server listening on http://127.0.0.1:1337
Zetta is running at http://127.0.0.1:1337
```


## Write the device code

Now, we'll create a new JavaScript file for our device driver code.

1. If you're not there, cd to the `2-state-machine` directory. 
2. Create a new file device.js:

    `touch device.js`

3. Open the file in an editor.
4. Require these libraries:

    ```
    var Device = require('zetta').Device;
    var util = require('util');
    ```

5. Create a generic JavaScript class and inherit from the Zetta Device class. This is a basic JavaScript object inheritance pattern that you will use consistently in Zetta projects:

    ```
    var StateMachineDevice = module.exports = function() {
      Device.call(this);
    }

    util.inherits(StateMachineDevice, Device);
    ```

6. Implement the `init()` function. This function is used by Zetta to configure and initialize the Device object. All Zetta devices must implement `init()`. 

    ```
    StateMachineDevice.prototype.init = function(config) {
      
      // Set up the state machine 
      config
        .type('state_machine')
        .state('off')
        .name("State Machine Device");

      config
        // Define the transitions allowed by the state machine
        .when('off', {allow: ['turn-on']})
        .when('on', {allow: ['turn-off']})

        // Map the transitions to JavaScript methods
        .map('turn-off', this.turnOff)
        .map('turn-on', this.turnOn)
    }
    ```

7. Implement the state machine transition methods. The pattern is straightforward asynchronous Node.js programming. The callback function is called when the requested transition is completed. 

    ```
    StateMachineDevice.prototype.turnOff = function(cb) {
      this.state = 'off';
      cb();
    }

    StateMachineDevice.prototype.turnOn = function(cb) {
      this.state = 'on';
      cb();
    }
    ```

8. Save the device file. 


## Add the device to the server

1. Open the server file, `index.js`. 
2. Require the device module you just implemented:

    ```
    var zetta = require('zetta');
    var StateMachineDevice = require('./device.js');
    ```

3. Call the use method on the Zetta server, as follows. This statement is telling the Zetta server to search for this device and generate a set of APIs for it. 

    ```
     zetta()
        .name('State Machine Server')
        .use(StateMachineDevice)
        .listen(1337, function(){
           console.log('Zetta is running at http://127.0.0.1:1337');
      });
    ```

## Test the device

1. Start the Zetta server: 

    `node index.js`

2. The server output should look like this. Notice the output has some new information that we didn't see before -- the State Machine device we added to the server was discovered by something called a "scout". We'll discuss scouts in detail in another topic. For now, just note that the device was discovered. This means that Zetta found the device and has generated APIs for it. 

    ```
    node index.js
    Jan-22-2016 15:34:18 [scout] Device (state_machine) 7cbf5759-4106-4985-83aa-e970fe13490d was discovered
    Jan-22-2016 15:34:18 [server] Server (State Machine Server) State Machine Server listening on http://127.0.0.1:1337
    Zetta is running at http://127.0.0.1:1337
    ```


## Call the device API

1. Using cURL or in a REST app like Postman or Advanced REST client, call the root URL:

    `curl http://127.0.0.1:1337`

2. Then, in the response, locate the `http://127.0.0.1:1337/servers/State%20Machine%20Server` URL and call it:

    `curl http://127.0.0.1:1337/servers/State%20Machine%20Server`

3. Notice that the `entities` element lists a device. This is the state machine device we added to the server. The current state (reflected in the `properties` attribute of the JSON response) is `off`.

```json
{
  "class": [
    "server"
  ],
  "properties": {
    "name": "State Machine Server"
  },
  "entities": [
    {
      "class": [
        "device",
        "state_machine"
      ],
      "rel": [
        "http://rels.zettajs.io/device"
      ],
      "properties": {
        "id": "7cbf5759-4106-4985-83aa-e970fe13490d",
        "type": "state_machine",
        "name": "State Machine Device",
        "state": "off"
      },
      "links": [
        {
          "rel": [
            "self",
            "edit"
          ],
          "href": "http://127.0.0.1:1337/servers/State%20Machine%20Server/devices/7cbf5759-4106-4985-83aa-e970fe13490d"
        },
        {
          "rel": [
            "http://rels.zettajs.io/type",
            "describedby"
          ],
          "href": "http://127.0.0.1:1337/servers/State%20Machine%20Server/meta/state_machine"
        },
        {
          "title": "State Machine Server",
          "rel": [
            "up",
            "http://rels.zettajs.io/server"
          ],
          "href": "http://127.0.0.1:1337/servers/State%20Machine%20Server"
        }
      ]
    }
  ],
  "actions": [
    {
      "name": "query-devices",
      "method": "GET",
      "href": "http://127.0.0.1:1337/servers/State%20Machine%20Server",
      "type": "application/x-www-form-urlencoded",
      "fields": [
        {
          "name": "ql",
          "type": "text"
        }
      ]
    }
  ],
  "links": [
    {
      "rel": [
        "self"
      ],
      "href": "http://127.0.0.1:1337/servers/State%20Machine%20Server"
    },
    {
      "rel": [
        "http://rels.zettajs.io/metadata"
      ],
      "href": "http://127.0.0.1:1337/servers/State%20Machine%20Server/meta"
    },
    {
      "rel": [
        "monitor"
      ],
      "href": "ws://127.0.0.1:1337/servers/State%20Machine%20Server/events?topic=logs"
    }
  ]
}
```

##Query the device capabilities

Now, let's follow the URL to the device itself. It looks something like this:

```
 "http://127.0.0.1:1337/servers/State%20Machine%20Server/devices/7cbf5759-4106-4985-83aa-e970fe13490d"
```

Here we can discover what actions the actual device is capable of performing. This device has a "transition" action that lets you change its state. Because the current state, as we saw previously, is `off`, the available action is `turn-on`.

```json
{
  "class": [
    "server"
  ],
  "properties": {
    "name": "State Machine Server"
  },
  "entities": [
    {
      "class": [
        "device",
        "state_machine"
      ],
      "rel": [
        "http://rels.zettajs.io/device"
      ],
      "properties": {
        "id": "7cbf5759-4106-4985-83aa-e970fe13490d",
        "type": "state_machine",
        "name": "State Machine Device",
        "state": "off"
      },
      "links": [
        {
          "rel": [
            "self",
            "edit"
          ],
          "href": "http://127.0.0.1:1337/servers/State%20Machine%20Server/devices/7cbf5759-4106-4985-83aa-e970fe13490d"
        },
        {
          "rel": [
            "http://rels.zettajs.io/type",
            "describedby"
          ],
          "href": "http://127.0.0.1:1337/servers/State%20Machine%20Server/meta/state_machine"
        },
        {
          "title": "State Machine Server",
          "rel": [
            "up",
            "http://rels.zettajs.io/server"
          ],
          "href": "http://127.0.0.1:1337/servers/State%20Machine%20Server"
        }
      ]
    }
  ],
  "actions": [
    {
      "name": "query-devices",
      "method": "GET",
      "href": "http://127.0.0.1:1337/servers/State%20Machine%20Server",
      "type": "application/x-www-form-urlencoded",
      "fields": [
        {
          "name": "ql",
          "type": "text"
        }
      ]
    }
  ],
  "links": [
    {
      "rel": [
        "self"
      ],
      "href": "http://127.0.0.1:1337/servers/State%20Machine%20Server"
    },
    {
      "rel": [
        "http://rels.zettajs.io/metadata"
      ],
      "href": "http://127.0.0.1:1337/servers/State%20Machine%20Server/meta"
    },
    {
      "rel": [
        "monitor"
      ],
      "href": "ws://127.0.0.1:1337/servers/State%20Machine%20Server/events?topic=logs"
    }
  ]
}

```

## Change the device state

The transition action includes an `href` link. The link is an HTTP POST command that you can use to change the machine's state. To "turn the machine on", you simply form the correct POST request. 

```json
{
  "class": [
    "server"
  ],
  "properties": {
    "name": "State Machine Server"
  },
  "entities": [
    {
      "class": [
        "device",
        "state_machine"
      ],
      "rel": [
        "http://rels.zettajs.io/device"
      ],
      "properties": {
        "id": "7cbf5759-4106-4985-83aa-e970fe13490d",
        "type": "state_machine",
        "name": "State Machine Device",
        "state": "off"
      },
      "links": [
        {
          "rel": [
            "self",
            "edit"
          ],
          "href": "http://127.0.0.1:1337/servers/State%20Machine%20Server/devices/7cbf5759-4106-4985-83aa-e970fe13490d"
        },
        {
          "rel": [
            "http://rels.zettajs.io/type",
            "describedby"
          ],
          "href": "http://127.0.0.1:1337/servers/State%20Machine%20Server/meta/state_machine"
        },
        {
          "title": "State Machine Server",
          "rel": [
            "up",
            "http://rels.zettajs.io/server"
          ],
          "href": "http://127.0.0.1:1337/servers/State%20Machine%20Server"
        }
      ]
    }
  ],
  "actions": [
    {
      "name": "query-devices",
      "method": "GET",
      "href": "http://127.0.0.1:1337/servers/State%20Machine%20Server",
      "type": "application/x-www-form-urlencoded",
      "fields": [
        {
          "name": "ql",
          "type": "text"
        }
      ]
    }
  ],
  "links": [
    {
      "rel": [
        "self"
      ],
      "href": "http://127.0.0.1:1337/servers/State%20Machine%20Server"
    },
    {
      "rel": [
        "http://rels.zettajs.io/metadata"
      ],
      "href": "http://127.0.0.1:1337/servers/State%20Machine%20Server/meta"
    },
    {
      "rel": [
        "monitor"
      ],
      "href": "ws://127.0.0.1:1337/servers/State%20Machine%20Server/events?topic=logs"
    }
  ]
}
```

The POST request to turn on the light looks something like this (you'll need to use the link provided in your own response, which has the correct device ID):

`curl -i -X POST http://127.0.0.1:1337/servers/State%20Machine%20Server/devices/7cbf5759-4106-4985-83aa-e970fe13490d -d 'action=turn-on'`


In the HTTP response, you can see that the state has been changed from `off` to `on`. Furthermore, the available action is changed to `turn-off`. To turn the light off again, follow the same pattern by POSTing to the transition URL.

```json
{
  "class": [
    "device",
    "state_machine"
  ],
  "properties": {
    "id": "7cbf5759-4106-4985-83aa-e970fe13490d",
    "type": "state_machine",
    "name": "State Machine Device",
    "state": "on"
  },
  "actions": [
    {
      "class": [
        "transition"
      ],
      "name": "turn-off",
      "method": "POST",
      "href": "http://127.0.0.1:1337/servers/State%20Machine%20Server/devices/7cbf5759-4106-4985-83aa-e970fe13490d",
      "fields": [
        {
          "name": "action",
          "type": "hidden",
          "value": "turn-off"
        }
      ]
    }
  ],
  "links": [
    {
      "rel": [
        "self",
        "edit"
      ],
      "href": "http://127.0.0.1:1337/servers/State%20Machine%20Server/devices/7cbf5759-4106-4985-83aa-e970fe13490d"
    },
    {
      "title": "State Machine Server",
      "rel": [
        "up",
        "http://rels.zettajs.io/server"
      ],
      "href": "http://127.0.0.1:1337/servers/State%20Machine%20Server"
    },
    {
      "rel": [
        "http://rels.zettajs.io/type",
        "describedby"
      ],
      "href": "http://127.0.0.1:1337/servers/State%20Machine%20Server/meta/state_machine"
    },
    {
      "title": "state",
      "rel": [
        "monitor",
        "http://rels.zettajs.io/object-stream"
      ],
      "href": "ws://127.0.0.1:1337/servers/State%20Machine%20Server/events?topic=state_machine%2F7cbf5759-4106-4985-83aa-e970fe13490d%2Fstate"
    },
    {
      "title": "logs",
      "rel": [
        "monitor",
        "http://rels.zettajs.io/object-stream"
      ],
      "href": "ws://127.0.0.1:1337/servers/State%20Machine%20Server/events?topic=state_machine%2F7cbf5759-4106-4985-83aa-e970fe13490d%2Flogs"
    }
  ]
}
```

You'll see a message in the server's terminal output indicating the transition changes:

```
Jan-22-2016 15:58:41 [device] state_machine transition turn-on
Jan-22-2016 15:58:47 [device] state_machine transition turn-off
Jan-22-2016 15:58:52 [device] state_machine transition turn-on
```

## Summary

In this topic, we added a device driver to a Zetta server instance, and then we traced the links provided in the server's JSON response to transition the state of the device. 

The cool thing about Zetta APIs is that each response contains everything an app developer needs to navigate the API, discover its actions, and execute them. 

Another thing to remember is that this pattern is central to Zetta development. You write the device driver for whatever device you want to access over HTTP, and Zetta provides a fully functional REST API for that device!

In the next part of the tutorial, we'll create a scout. Scouts constantly run in the background and alert the Zetta server whenever a device comes on line. 





