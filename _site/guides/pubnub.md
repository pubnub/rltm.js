## Setting up Rltm.js with PubNub

PubNub is a cloud realtime service. You only need to supply your PubNub publish and subscribe keys. PubNub will handle scaling, message delivery, etc.

You can get your publish and subscribe keys from [the pubnub admin panel](https://admin.pubnub.com/).

```js
let user = rltm({
    service: 'pubnub', 
    config: {
        publishKey: 'YOUR_PUBNUB_PUBLISH_KEY',
        subscribeKey: 'YOUR_PUBNUB_SUBSCRIBE_KEY'
    }
});
```

You can read about more config options on the official [PubNub Documentation](https://www.pubnub.com/docs/javascript/api-reference-sdk-v4#init).

This service exposes PubNub only features within ```user.pubnub``` or ```room.pubnub```.
