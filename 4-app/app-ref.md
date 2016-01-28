## Zetta app reference

A Zetta app is custom JavaScript code that you implement to query for devices and wire up interations between them. Apps are stateless and run in the context of the Zetta server. Unlike Scouts and Devices, which are JavaScript objects, apps are basic Node.js modules. 

### Example

This code illustrates a simple query statement (where) and a listener (observe) that takes action whenever the query is satisfied. 

```js
module.exports = function(server) {
  var arduinoQuery = server.where({type: 'arduino'});
  server.observe([arduinoQuery], function(arduino){
    //Work with arduino!
  });
}
```


### Exported function module

An app is an exported function module that takes a single `server` argument. This argument is a reference to a Zetta server instance, and provides all of the context of the server to the app. 

```js
    module.exports = function(server) {
        //app implementation
    }
```


### Methods


#### Server.where(query)

Specifies a SQL-like query that allows the Zetta server query for specific device properties. 

**Arguments**

* **query** - An object specifying the query to perform. Specifies property/value pairs for devices. All specified device properties are &&'d together.

```js
var query = server.where({ type: 'lcd', id: '123abc' });
```

#### Server.observe(queries, callback)

A listener that waits for all devices specified in the queries to come online. 

**Arguments**

* **queries** - An array of Query objects. 

* **callback** - A callback function that is called when all devices conforming to the queries are online. 

```js

var queryFoo = server.where({type: 'foo'});
var queryBar = server.where({type: 'bar'});

server.observe([queryFoo, queryBar], function(foo, bar){

});

```