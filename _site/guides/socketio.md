## Setting up Rltm.js with Socket.io

You must run a Socket.io server yourself for this to work. You can find a fully
featured example in the root of this repository called ```socket.io-server.js```.

```sh
node ./socket.io-server.js
```

Once the server is running, configure rltm to look for the server at that endpoint.

```js
let user = rltm({
    service: 'socketio', 
    config: {
        endpoint: 'http://localhost:8000'
    }
});
```

You can read more about config options on the [Socket.io Documentation](http://socket.io/docs/user-api/#manager(url:string,-opts:object))
