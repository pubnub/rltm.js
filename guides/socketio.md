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
