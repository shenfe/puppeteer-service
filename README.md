# phantom-service

(IN DEVELOPMENT...)

Make phantomjs run as a service.

## API

The service acts as a RESTful API server. Each time it accepts a JSON that describes a decision tree of actions at frontend, and returns a result collection.

### Frontend Action Decision Tree Data

Example:

```js
{
    'login': {
        action: function ({ username, password }) {
            // do something
        },
        wish: function (actionResult) {
            // check
        },
        success: 'getUserInfo',
        failure: {
            /**/
        },
        getUserInfo: {
            /**/
        }
    }
}
```

Let's call a node `DCNode` for convenience. Each DCNode can contain these properties:

| Property | Type | Description |
| :---: | :---: | :--- |
action | Function | Do some things, and return some things.
wish | Any | Any value to compare with the action result, or a function to return a checking result.
success | DCNode, String | The default node as the next step, if `wish` returns `true`.
failure | DCNode, String | The default node as the next step, if `wish` returns `false`.
<other identifier as a node name> | DCNode, String | Declare or reference a node.

### Result Collection Data

```js
[
    {
        node: 'login',
        data: { /**/ }
    },
    {
        node: 'getUserInfo',
        data: { /**/ }
    }
]
```

## Usage

### Server Side

First, install [PhantomJS](http://phantomjs.org/download.html).

Second, install this service via npm:

```bash
npm install phantom-service -g
phantom-service
```

### HTTP Client Side

Post data which contain: 1) a page url, 2) string-formatted decision tree data (not a JSON string).

```json
{
    "url": "...",
    "dtd": ""
}
```

**IMPORTANT** To stringify the decision tree data which probably contain function definitions, you'd better use ObjectStringify/ObjectParse functions instead of JSON stringify/parse methods.
