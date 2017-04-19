![](./assets/rltm.js-logo.png)

Universal API for realtime services. Integrate once and easily switch between Socket.io and PubNub. 

Provides handy methods for rooms, users, message history, and information about connected user.

Supported realtime services:

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
let user = rltm({
    service: 'pubnub',
    config: {
        // ...
    }
});
```

* ```service``` is the name of the realtime service to use (```pubnub``` or ```socketio```) 
* ```config``` is a Javascript object with a config for that service.

## PubNub or Socket.io

#### [Set Up With Socket.io](/guides/socketio.md)

Socket.io is an open source websocket framework. To use socket.io, you'll run
your own socket.io server on the back end. 

#### [Set Up With PubNub](/guides/pubnub.md)

PubNub is a hosted realtime solution that doesn't require you to run or maintain any servers.

# Usage

## Users

Every ```user``` connected to rltm.js has two properties:

1. ```uuid``` - a unique way to identify this ```user```
1. ```state``` - data associated with this ```user```

You can provide these as parameters during initialization.

```js
let user = rltm({
    service: 'socketio', 
    config: {
        endpoint: 'http://localhost:9000',
        uuid: 'MY_UNIQUE_ID',
        state: {admin: true}
    }
});
```

## Rooms

Realtime communication happens over ```room```s. ```room```s are like chat rooms, everybody in a ```room``` receives events sent by every other ```user```.

A ```user``` can join a ```room``` by using the ```join()``` method and supplying a ```room``` identifier. ```user```s who provide the same  identifier will be able to communicate with each other.

```js
room = user.join('room-name');
```

This returns a ```room``` object which we can use to communicate with other ```user```s.

### Join Event

A room can subscribe to the ```join``` event to find out when other ```user```s join the room.

```js
room.on('join', (uuid, state) => {
    console.log('user with uuid', uuid, 'joined with state', state);
});
```

## Messages

### Message Event

When another ```user``` sends a message to the ```room```, it will trigger the ```message``` event. The ```room``` can subscribe to that event with the ```on()``` method.

```js
room.on('message', (uuid, data) => {
    console.log('message received from uuid', uuid, 'with data', data);
});
```

### Publish

To send a message to the entire ```room```, use the ```message()``` method. Returns a promise.

```js
room.message({hello: world}).then(() => {
    console.log('message published');
});
```

## Online Users

### Here Now

A ```room``` can get a list of other ```user```s who have in the ```room``` by using the ```here()``` method. Returns a promise.

```js
room.here().then((users) => {
    console.log('users online', users);
});
```

Successful responses will return a object of ```user```s who are currently connected to the ```room```. The keys are the ```user```'s ```uuid```s and the values are their current ```state```.

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

A ```room``` can subscribe to the ```leave``` event to find out when a ```user``` leaves.

```js
room.on('leave', (uuid) => {
    console.log('user with uuid', uuid, 'has left');
});
```

A ```user``` can manually leave a ```room``` by using the ```leave()``` method. Returns a promise.

```js
room.leave().then(() => {
    console.log('left the room.');
});
```

This will fire the ```leave``` event.

### Disconnect

If a ```user``` gets disconnected without leaving the room, the ```disconnect``` event will fire.

```js
room.on('disconnect', (uuid) => {
    console.log('user with uuid', uuid, 'has disconnected');
});
```

## Set User State

A ```user``` state can be updated at any time by using the ```state()``` method. Supply the new ```state``` as the only parameter. Return a promise.

```js
room.state({idle: true}).then(() => {
    console.log('state set');
});
```

This will fire the ```state``` event which you can subscribe to with the ```room.on()``` method. When fired you will get the ```uuid``` of the ```user``` and the new ```state```.

```js
room.on('state', (uuid, state) => {
    console.log('user with uuid', uuid, 'was given state', state);
});
```

## Get Old Messages

A ```user``` can retrieve previously published messages in the ```room``` by using the ```history()``` method. Returns a promise.

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
