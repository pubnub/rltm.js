## Setting up Rltm.js with Ably

Ably is a cloud realtime service. You only need to supply your Ably API key for this demo, although the recommended strategy is to [use token authentication](https://www.ably.io/documentation/general/authentication#selecting-auth) for untrusted clients. Ably will handle scaling, message delivery, etc.

You can get your publish and subscribe keys from [the Ably app dashboard](https://support.ably.io/solution/articles/3000030502-setting-up-and-managing-api-keys).

Each client must be assigned a `clientId` that is the trusted client identifier assigned by you. See the [documentation on identified clients](https://www.ably.io/documentation/general/authentication#identified-clients).  In practice, a client itself should not be assigning its `clientId` as this is a security risk (any client can masquerade as another trivially). Instead, it is better practice to assign a `clientId` to your clients from your servers using [token authentication](https://www.ably.io/documentation/general/authentication#token-authentication).

### Simple example with Basic Authentication

```js
let user = rltm({
    service: 'ably',
    config: {
        key: 'YOUR_ABLY_API_KEY',
        clientId: 'UNIQUE_ID_FOR_THIS_CLIENT'
    }
});
```

### More robust example using Token Authentication

```js
let user = rltm({
    service: 'ably',
    config: {
        authUrl: 'YOUR_SERVERS_AUTH_URL_ENDPOINT_TO_OBTAIN_A_TOKEN_WITH_CLIENT_ID'
    }
});
```

You can read about more config options on the official [Ably Documentation](https://www.ably.io/documentation/realtime/usage).

This service exposes Ably only features within ```user.ably``` or ```room.ably```.

## Alternative approach: Using the PubNub protocol with the Ably realtime service

Whilst this `rltm.js` project aims to abstract away client-side logic to connect to different realtime services, Ably additionally offers [protocol adapters as part of its cloud service](http://www.ably.io/adapters). This enables you to communicate with Ably using a 3rd party library and its protocols such as PubNub.

Included below is an example of how to connect `rtlm.js` to Ably using the PubNub service, SDK and its native protocol:


```js
let user = rltm({
    service: 'pubnub',
    config: {
        publishKey: 'YOUR_ABLY_API_KEY',
        subscribeKey: 'YOUR_ABLY_API_KEY',
        origin: 'pubnub.ably.io',
        ssl: true,
        no_wait_for_pending: true
    }
});
```

[Find out more about how to use PubNub client libraries with Ably's realtime service](https://support.ably.io/support/solutions/articles/3000055107-using-the-ably-pubnub-protocol-adaptor)
