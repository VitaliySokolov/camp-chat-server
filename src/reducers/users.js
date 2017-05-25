import {
    CHAT_JOIN,
    CHAT_LEAVE,
    MESSAGE,
    MESSAGES,
    USERS
} from '../../shared/socket.io/events';

// function isUserIn(users, user) {
//   return users.findIndex(u => u.username === user.username) < 0
// }

const initUser = {
    username: '',
    online: false,
    rooms: {

    }
};

const userReducer = (state = initUser, action) => {
    switch (action.type) {
        case USERS: {
            const { user, roomId } = action.payload;

            if (roomId && !(roomId in state.rooms))
                user.rooms = [...state.rooms, roomId];
            return { ...state, ...user };
        }

        case MESSAGE:
        case MESSAGES:
            const message = action.payload;

            message.room = message.room || 0;
            const additionalInfo = {};

            if (message.time > (message.room in state.rooms ? state.rooms[message.room].lastMessageTime : 0)) {
                additionalInfo.lastMessage = message.msg;
                additionalInfo.lastMessageTime = message.time;
            }
            if (additionalInfo.lastMessageTime)
                return { ...state, ...message.user, rooms: { ...state.rooms, [message.room]: additionalInfo } };
            return { ...state, ...message.user };

        case CHAT_JOIN:
            return { ...state, ...action.payload.user, ...{ online: true } };
        case CHAT_LEAVE:
            return { ...state, ...action.payload.user, ...{ online: false } };
        default:
            return state;
    }
};

const initialUsers = {
    items: {}
};

const usersReducer = (state = initialUsers, action) => {
    switch (action.type) {
        case USERS: {
            const { users } = action.payload;
            const roomId = 'roomId' in action.payload ? action.payload.roomId : 0;
            let items = state.items;

            users.forEach(user => {
                items = Object.assign({}, items, {
                    [user.id]: userReducer(
                        state.items[user.id],
                        { type: action.type, payload: { user, roomId } }
                    )
                });
            });

            return { ...state, items };
        }
        case MESSAGES:
            const { messages } = action.payload;
            let users = state.items;

            messages.forEach(message => {
                users = Object.assign({}, users, {
                    [message.user.id]: userReducer(
                        users[message.user.id],
                        {
                            type: action.type,
                            payload: message
                        })
                });
            });
            return { ...state, items: users };
        case MESSAGE: {
            const message = action.payload,
                newItem = Object.assign({}, state.items, {
                    [message.user.id]: userReducer(state.items[message.user.id], action)
                });

            return { ...state, items: { ...state.items, ...newItem } };
        }
        case CHAT_JOIN:
        case CHAT_LEAVE:
            const info = action.payload;

            return {
                ...state, items: Object.assign({}, state.items, {
                    [info.user.id]: userReducer(state.items[info.user.id], action)
                })
            };

        default:
            return state;
    }
};

// const usersReducer = (state = [], action) => {
//   switch (action.type) {
//     case RECEIVE_CHAT_DATA: {
//       const { users } = action.payload;
//       return users;
//     }
//     case RECEIVE_ALL_USERS: {
//       const { users } = action.payload;
//       const modUsers = users.map((user, index) => {
//         return { id: index, username: user.username || user.firstname || `user${index}` }
//       });
//       return modUsers;
//     }

//     case WS_JOIN: {
//       const { time, user } = action.payload;
//       return [...state, user];
//     }

//     case 'message':
//     case 'join':
//       const { user } = action.payload
//       if (isUserIn(state, user)) {
//         const maxIndex = getMaxIndex(state);
//         return [
//           ...state, { id: maxIndex + 1, username: user.username }
//         ]
//       } else {
//         return state
//       }
//     // case RECEIVE_ALL_MESSAGES: {
//     //   const { messages } = action.payload;
//     //   let userId = 0;
//     //   const users = messages.reduce((users, next) => {
//     //     if (users.find(v => v === next.user.username)) {
//     //       users.push({
//     //         id: userId++,
//     //         username: next.user.username
//     //       })
//     //     }
//     //   }, [] );
//     //   console.log(users);
//     //   return state;
//     // const modMsg =  messages.map((message, index) => {
//     //   return {
//     //     id: index,
//     //     text: message.msg ? message.msg.msg || message.msg : "",
//     //     author: message.user,
//     //     time: message.time
//     //   }
//     // });
//     // return modMsg;
//     // }
//     default:
//       return state;
//   }
// }

// export default usersReducer;
export default usersReducer;


// import { combineReducers } from 'redux';

// export const ADD_USER = 'ADD_USER';

// const initialUsersById = {
//   "user1": {
//     id: "user1",
//     name: 'John'
//   },
//   "user2": {
//     id: "user2",
//     name: 'Mike'
//   },
//   "user3": {
//     id: "user3",
//     name: 'Mary'
//   }
// }

// const initialAllUsers = [
//   "user1",
//   "user2",
//   "user3"
// ];

// function usersById(state = initialUsersById, action) {
//   switch (action.type) {
//     case ADD_USER:
//       return state;

//     default:
//       return state;
//   }
// }

// function allUsers(state = initialAllUsers, action) {
//   switch (action.type) {
//     case ADD_USER:
//       return state;

//     default:
//       return state;
//   }
// }

// const usersReducer = combineReducers({
//   byId: usersById,
//   allIds: allUsers
// });

// export default usersReducer;
