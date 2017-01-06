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
