![](./assets/rltm.js-logo.png)

Universal API realtime services. Integrate once and easily swap realtime infrastructure. 

Provides handy methods for rooms, clients, message history, and information about connected client.

Supported realtime hosts:

![](./assets/socketio.png)

![](./assets/pubnub.png)

# Setup

## NPM

Install via NPM.

```sh
npm install rltm --save
```

Include library via require.

```js
const rltm = require('rltm');
```

## Web

Install via bower or NPM

```sh
npm install rltm --save
bower install rltm --save
```

Include library in HTML.

```html
<script src="./bower_components/web/rltm.js"></script>
```

# Configure

Both the NodeJS and web libraries are configured with the ```rltm``` variable. 

```js
let client = rltm({
    service: 'pubnub',
    config: {
        // ...
    }
});
```

* ```service``` is the name of the realtime service to use (```pubnub``` or ```socketio```) 
* ```config``` is a Javascript object with a config for that service.

## PubNub

PubNub is a cloud realtime service. You only need to supply your PubNub publish and subscribe keys.

```js
let client = rltm({
    service: 'pubnub', 
    config: {
        publishKey: 'YOUR_PUBNUB_PUBLISH_KEY',
        subscribeKey: 'YOUR_PUBNUB_SUBSCRIBE_KEY'
    }
});
```

You can read about more config options on the official [PubNub Documentation](https://www.pubnub.com/docs/javascript/api-reference-sdk-v4#init).

## Socket.io

You must run a Socket.io server yourself for this to work.

```
node ./socket.io-server.js
```

Then you can configure rltm to look for the server at that endpoint.

```js
let client = rltm({
    service: 'socketio', 
    config: {
        endpoint: 'http://localhost:8000'
    }
});
```

You can read more about config options on the [Socket.io Documentation](http://socket.io/docs/client-api/#manager(url:string,-opts:object))

# Usage

## Clients

Every ```client``` connected to rltm.js has two properties:

1. ```uuid``` - a unique way to identify this ```client```
1. ```state``` - data associated with this ```client```

You can provide these as parameters during initialization.

```js
let client = rltm({
    service: 'socketio', 
    config: {
        endpoint: 'http://localhost:8000',
        uuid: 'MY_UNIQUE_ID',
        state: {admin: true}
    }
});
```

## Rooms

Realtime communication happens over ```room```s. ```room```s are like chat rooms, everybody in a ```room``` receives events sent by every other ```client```.

A ```client``` can join a ```room``` by using the ```join()``` method and supplying a ```room``` identifier. ```client```s who provide the same  identifier will be able to communicate with each other.

```js
room = client.join('room-name');
```

This returns a ```room``` object which we can use to communicate with other ```client```s.

### Join Event

A room can subscribe to the ```join``` event to find out when other ```client```s join the room.

```js
room.on('join', (uuid, state) => {
    console.log('client with uuid', uuid, 'joined with state', state);
});
```

## Messages

### Message Event

When another ```client``` sends a message to the room, it will trigger the ```message``` event. The ```room``` can subscribe to that event with the ```on()``` method.

```js
room.on('message', (uuid, data) => {
    console.log('message received from uuid', uuid, 'with data', data);
});
```

### Publish

To send a message to the entire room, use the ```publish()``` method. Returns a promise.

```js
room.publish({hello: world}).then(() => {
    console.log('message published');
});
```

## Online Clients

### Here Now

A ```room``` can get a list of other ```client```s who have in the ```room``` by using the ```hereNow()``` method. Returns a promise.

```js
room.hereNow().then((clients) => {
    console.log('clients online', clients);
});
```

Successful responses will return a object of ```client```s who are currently connected to the ```room```. The keys are the ```client```'s ```uuid```s and the values are their current ```state```.

```js
{ 
    uuid1: {
        username: 'ianjennings'
    },
    uuid2: {
        username: 'stephenblum'
    }
}
```

### Leave Event

A ```room``` can subscribe to the ```leave``` event to find out when a ```client``` leaves.

```js
room.on('leave', (uuid) => {
    console.log('client with uuid', uuid, 'has left');
});
```

### Disconnect

A ```client``` can manually leave a ```room``` by using the ```leave()``` method. Returns a promise.

```js
room.leave().then(() => {
    console.log('left the room.');
});
```

This will fire the ```leave``` event.

## Set Client State

A ```client``` state can be updated at any time by using the ```setState()``` method. Supply the new ```state``` as the only parameter. Return a promise.

```js
room.setState({idle: true}).then(() => {
    console.log('state set');
});
```

This will fire the ```state``` event which you can subscribe to with the ```on()``` method. When fired you will get the ```uuid``` of the ```client``` and the new ```state```.

```js
room.on('state', (uuid, state) => {
    console.log('client with uuid', uuid, 'was given state', state);
});
```

## Get Old Messages

A ```client``` can retrieve previously published messages in the ```room``` by using the ```    ()``` method. Returns a promise.

```js
room.history().then((history) => {
    console.log('got array of all messages in channel', history);
});
```

It will return the last 100 messages as an array of objects containing the ```uuid``` and ```data``` of every message. The array is sorted newest to oldest.

```js
[ 
    { 
        uuid: uuid2, 
        data: { 
            sentTime: '2pm',
            text: 'boy howdy' 
        } 
    }, 
    { 
        uuid: uuid1, 
        data: { 
            sentTime: '1pm',
            text: 'hello there' 
        } 
    }
]
```

## Test

Tests are run with mocha and chai.

```sh
npm install mocha -g
npm install chai -g
```

Set environment variable ```CLIENT``` to test either service.

```sh
env CLIENT=pubnub mocha
```

```sh
env CLIENT=socketio mocha
```
