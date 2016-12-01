![](./assets/rltm.js-logo.png)

Universal API realtime services. Integrate once and easily swap realtime infrastructure. 

Provides handy methods for rooms, users, message history, and information about connected client.

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

```
npm install rltm --save
bower install rltm --save
```

Include library in HTML.

```html
<script src="./bower_components/web/rltm.js"></script>
```

# Configure

Both the NodeJS and web libraries are configured with the ```rltm``` variable. The first parameter is the name of the realtime provider to use (```pubnub``` or ```socketio```) and the second parameter is a Javascript object with a config for that provider.

```js
let connection = rltm(provider, config);
```

## PubNub

```js
let connection = rltm('pubnub', {
    publishKey: 'YOUR_PUBNUB_PUBLISH_KEY',
    subscribeKey: 'YOUR_PUBNUB_SUBSCRIBE_KEY'
});
```

You can read about more config options on the official [PubNub Documentation](https://www.pubnub.com/docs/javascript/api-reference-sdk-v4#init).

## Socket.io

```js
let connection = rltm('socketio', {
    endpoint: 'http://localhost:8000'
});
```

You can read more about config options on the [Socket.io Documentation](http://socket.io/docs/client-api/#manager(url:string,-opts:object))

See socket.io-server.js for an example socket.io implementation.

# Usage

## Identify User

```js
let connection = rltm('socketio', {
    endpoint: 'http://localhost:8000',
    uuid: 'MY_USER_ID',
    state: {admin: true}
});
```

## Join a room

```js
room = connection.join('some-room');
```

```js
room.on('ready', () => {
    console.log('connected to room');
});
```

## Publish Subscribe

```js
room.on('message', (uuid, data) => {
    console.log('message received from uuid', uuid, 'with data', data);
});

room.publish({hello: world});
```

## Set User

```js
room.on('state', (uuid, state) => {
    console.log('user with uuid', uuid, 'was given state', state);
});

room.setState({idle: true});
```

## Who's in room

```js
room.on('join', (uuid, state) => {
    console.log('user with uuid', uuid, 'joined with state', state);
});
```

```js
room.on('leave', (uuid) => {
    console.log('user with uuid', uuid, 'has left');
});
```

```js
room.hereNow((users) => {
    console.log('users are online', users);
});
```

## Get Old Messages

```js
room.history((history) => {
    console.log('got array of all messages in channel', history);
});
```

## Test

Tests are run with mocha and chai.

```sh
npm install mocha -g
npm install chai -g
```

Set environment variable ```connection``` to test service.

```sh
env connection=pubnub mocha
```

```sh
env connection=socketio mocha
```
