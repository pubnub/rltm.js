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
