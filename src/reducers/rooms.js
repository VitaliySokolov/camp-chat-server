import _ from 'lodash';

import {
    RECEIVE_ROOM_LIST,
    ADD_CHAT_ROOM
} from '../actions/chatActions';

import {
    ROOMS,
    ADD_ROOM,
    INVITE_USER,
    KICK_USER,
    EDIT_ROOM,
    DELETE_ROOM
} from '../../shared/socket.io/events';

const
    initialCommonRoom = {
        title: 'Common Room',
        id: 0
    },
    initialRooms = {
        items: { 0: initialCommonRoom },
        noMore: false
    };

const roomsReducer = (state = initialRooms, action) => {
    switch (action.type) {
        case RECEIVE_ROOM_LIST: {
            return action.payload.rooms;
        }
        case ADD_CHAT_ROOM: {
            return state.concat(action.payload.room);
        }
        case ROOMS: {
            const { rooms } = action.payload;
            let obj = state.items;

            rooms.forEach(room => {
                obj = Object.assign({}, obj, { [room.id]: room });
            });
            return { ...state, items: { ...obj } };
        }
        case ADD_ROOM: {
            const { room } = action.payload;

            return { ...state, items: { ...state.items, ...{ [room.id]: room } } };
        }
        case INVITE_USER: {
            const { roomId, userId } = action.payload;

            state.items[roomId].users = [...state.items[roomId].users, userId];
            return { ...state };
        }
        case KICK_USER: {
            const { roomId, userId } = action.payload;

            state.items[roomId].users = state.items[roomId].users.filter(u => u !== userId);
            return { ...state };
        }
        case EDIT_ROOM: {
            const { room } = action.payload;

            return { ...state, items: { ...state.items, ...{ [room.id]: room } } };
        }
        case DELETE_ROOM: {
            const { roomId } = action.payload;

            return { ...state, items: _.omit(state.items, roomId) };
        }
        default:
            return state;
    }
};

export default roomsReducer;

// const initialRoomsById = {
//   "room1": {
//     id: "room1",
//     title: 'first'
//   },
//   "room2": {
//     id: "room2",
//     title: 'second'
//   },
//   "room3": {
//     id: "room3",
//     title: 'third'
//   }
// };

// const initialAllRooms = [
//   "room1",
//   "room2",
//   "room3"
// ];

// function roomsById(state = initialRoomsById, action) {
//   switch (action.type) {
//     case ADD_CHAT_ROOM:
//       return state;

//     default:
//       return state;
//   }
// }

// function allRooms(state = initialAllRooms, action) {
//   switch (action.type) {
//     case ADD_CHAT_ROOM:
//       return state;

//     default:
//       return state;
//   }
// }

// const roomsReducer = combineReducers({
//   byId: roomsById,
//   allIds: allRooms
// });

// export default roomsReducer;
