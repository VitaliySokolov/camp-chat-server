# Camp chat server [![Build Status](https://travis-ci.org/VitaliySokolov/camp-chat-server.svg?branch=master)](https://travis-ci.org/VitaliySokolov/camp-chat-server) [![Coverage Status](https://coveralls.io/repos/github/VitaliySokolov/camp-chat-server/badge.svg?branch=master)](https://coveralls.io/github/VitaliySokolov/camp-chat-server?branch=master)

**Hosting Site**: http://vs-chat-server.herokuapp.com/

# Client
    * ReactJS
    * Redux
    * Socket.io (client part)

# Server
    * NodeJS
    * Express
    * Socket.io (server part)
    * JWT

## API
### Sign up

[POST] http://vs-chat-server.herokuapp.com/signup

**Request**
```json
  {
    "username": "your_username",
    "password": "your_pass",
    "email": "your_email"
  }
```

**Response**

201 - CREATED or error codes

### Login

[POST] http://vs-chat-server.herokuapp.com/login

**Request**
```json
{
    "username": "your_username",
    "password": "your_password"
}
```

**Response**
```json
{
    "token": "your_new_token",
    "tokenType": "Bearer",
    "user": {
        "id": "your_id",
        "username": "your_login",

    }
}
```

## Socket.io Events
### Getting started

1. Add socket.io to your page
  * you can add it via:
     ```html
        <script src="http://vs-chat-server.herokuapp.com/socket.io/socket.io.js"></script>
     ```
2. In this implementation we use JWT so it's important to send "socket.emit('authenticate', { token: YourJWT })" event after you logged in and connected with socket.io
   ```javascript
        socket.on('connect', () => {
            socket.emit('authenticate', { token: YourJWT })
        })
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
    ```json
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
    ```json
    {
        "user": {
            "id": String,
            "username": "someuser@gmail.com"
        },
        "time": 1490172495627 // UTC timestamp in milliseconds
    }
    ```


