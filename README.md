# rltm.js

Universal API for integrating realtime providers. 

## Setup

```js
let rltm = require('rltm');
```

### Config

```sh
npm install rltm --save
```

#### PubNub

```js
let agent = rltm('pubnub', {
    publishKey: 'YOUR_PUBNUB_PUBLISH_KEY',
    subscribeKey: 'YOUR_PUBNUB_SUBSCRIBE_KEY'
});
```

#### Socket.io

```js
let agent = rltm('socketio', {
    endpoint: 'http://localhost:8000'
});
```

See socket.io-server.js for an example socket.io implementation.

## Usage

### Identify User

```js
let agent = rltm('socketio', {
    endpoint: 'http://localhost:8000',
    uuid: 'MY_USER_ID',
    state: {admin: true}
});
```

### Join a room

```js
room = agent.join('some-room');
```

```js
room.on('ready', () => {
    console.log('connected to room');
});
```

### Publish Subscribe

```js
room.on('message', (uuid, data) => {
    console.log('message received from uuid', uuid, 'with data', data);
});

room.publish({hello: world});
```

### Set User

```js
room.on('state', (uuid, state) => {
    console.log('user with uuid', uuid, 'was given state', state);
});

socket.setState({idle: true});
```

### Who's in room

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

### Get Old Messages

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

Set environment variable ```AGENT``` to test service.

```sh
env AGENT=pubnub mocha
```

```sh
env AGENT=socketio mocha
```
