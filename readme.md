# Camp chat server [![Build Status](https://travis-ci.org/VitaliySokolov/camp-chat-server.svg?branch=master)](https://travis-ci.org/VitaliySokolov/camp-chat-server) [![Coverage Status](https://coveralls.io/repos/github/VitaliySokolov/camp-chat-server/badge.svg?branch=master)](https://coveralls.io/github/VitaliySokolov/camp-chat-server?branch=master)

# Getting started

1. Add socket.io to your page
  * you can add it via:
     ```javascript
        <script src="http://vs-chat-server.herokuapp.com/socket.io/socket.io.js"></script>
     ```
2. In this implementation we use JWT so it's important to send "socket.emit('authenticate', { token: YourJWT })" event after you logged in and connected with socket.io
   ```javascript
        socket.on('connect', () => {
            socket.emit('authenticate', { token: YourJWT })
        })
   ```

# API and Socket.io Events:

## Sign up
Will create new user with all fields that you pass in the request body.


**Request:**

[POST] http://vs-chat-server.herokuapp.com/signup
```
  {
    "username": "your_username",
    "password": "your_pass",
    ...
  }
```
<span class="warning">**Note:** Request/Response Content Type: 'application/json'</span>

## Login
Will check if user exists in DB and send back an JWT token.


**Request:**

[POST] http://vs-chat-server.herokuapp.com/login
```
  {
    "username": "your_username",
    "password": "your_pass",
    ...
  }
```
<span class="warning">**Note:** Request/Response Content Type: 'application/json'</span>


**Response:**

```
  {
    "id": String,
    "user": {
        "id": String,
        "username": String
    },
    "token": "JWT token",
    "tokenType": "Bearer"
    ...
  }
```

## Getting all registered users
Here you can get all registered users and all available info for them.


**Request:**

[GET] http://vs-chat-server.herokuapp.com/users

**Response:**

```
  [
    {
        "id": String,
        "username": "someuser@gmail.com",
    },
    ...
  ]
```

## Getting all messages

**Request:**

[GET] http://vs-chat-server.herokuapp.com/messages

**Response:**

```
    [
        {
            "id": String,
            "msg": String,
            "user": UsedDataObject,
            "time": Timestamp
        }
        ...
    ]
```

## Sending messages

For sending and receiving messages across sockets
we use [Socket.io](https://github.com/socketio/socket.io)

Now server support next types of messages:

* `message` - fires when user sent message
* `join` - fires when user connected
* `leave`  - fires when user left chat

<span class="warning">**Note:** Request/Response Content Type: 'application/json'</span>

**Example**:
```javascript
  const socket = io.connect('http://vs-chat-server.herokuapp.com');

  socket.on('message', msg => { ... });

  socket.on('join', msg => { ... });

  socket.on('leave', msg => { ... });
```

### Data format for events:
* `message`
    ```javascript
    {
        "id": String,
        "msg": "Message text",
        "user": {
            "id": String,
            "username": "someuser@gmail.com",
        },
        "time": 1490172495627 // UTC timestamp in milliseconds
    }
    ```
* `join` and `leave`
    ```javascript
    {
        "user": {
            "id": String,
            "username": "someuser@gmail.com"
        },
        "time": 1490172495627 // UTC timestamp in milliseconds
    }
    ```

<style>
    body {
        font-size: 16px;
        font-family: Arial, Calibri, sans-serif;
        margin: 0;
        padding: 1em;
    }
    p {
       text-indent: 30px;
    }
    pre {
        background: #f6f8fa;
        padding: 10px;
    }

    .warning {
        font-weight: bold;
        color: red;
    }
</style>
