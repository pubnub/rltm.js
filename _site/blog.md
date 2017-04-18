# Getting started with rltm.js

We're proud to announce the release of rltm.js, a universal API for realtime communication. Rltm.js allows you to build real-time apps with one codebase and easily switch between backends.

Rltm.js provides handy methods for rooms, users, message history, and finding out who's online. It works for both front end web and NodeJs. All of this information is available from generic methods and you can switch between realtime hosts with one small config.

At PubNub we write tons of open source libraries, examples, tutorials. Rltm.js allows us to share this work with all of the other realtime communities out there.

Most of our customers begin by implementing an open source realtime solution themselves. As they grow, they realize how difficult and costly it is to scale and support their network. Rltm.js is here to support open source implementations and give developers an easy way to transition to our cloud service when they're ready to scale.

The first framework we'll be supporting is Socket.io, one of the most popular open source realtime frameworks out there.

Besides the library itself, we've also updated our angular chat plugin to work with rltm.js. Now that plugin supports socket.io or PubNub. That can be found at http://angularjs.chat. 

Let's dive into how rltm.js actually works.

First, install the library with npm or bower.

```sh
npm install rltm --save
bower install rltm --save
```

Then include library in HTML or in your NodeJS app.

```html
<script src="./bower_components/web/rltm.js"></script>
```

```js
const rltm = require('rltm');
```

Then, configure the rltm library in your javascript code. Both the NodeJS and web libraries are configured with the ```rltm``` variable. 

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

To use PubNub, supply your publish and subscribe keys from your account:

```js
let user = rltm({
    service: 'pubnub', 
    config: {
        publishKey: 'YOUR_PUBNUB_PUBLISH_KEY',
        subscribeKey: 'YOUR_PUBNUB_SUBSCRIBE_KEY'
    }
});
```

To use Socket.io, run the socket.io server and supply your socket.io endpoint.

```
node ./socket.io-server.js
```

Then you can configure rltm to look for the server at that endpoint.

```js
let user = rltm({
    service: 'socketio', 
    config: {
        endpoint: 'http://localhost:9000'
    }
});
```

Then, you can connect to a chatroom using the ```join``` method.

```js
room = user.join('room-name');
```

Now you can subscribe to messages for that room.

```js
room.on('message', (uuid, data) => {
    console.log('message received from uuid', uuid, 'with data', data);
});
```

To publish a message to the room, just call ```room.publish()```.

```js
room.publish({hello: world}).then(() => {
    console.log('message published');
});
```

The subscribe code above will fire.

You can also get a list of who's in the room by calling the ```here()``` endpoint.

```js
room.here().then((users) => {
    console.log('users online', users);
});
```

This will return an object of all connected users.

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

You can get the full documentation and download the code from [github](https://github.com/pubnub/rltm).
