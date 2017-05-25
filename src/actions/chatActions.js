import * as mockApi from '../api/mock_server';
import * as api from '../api/api';
import {
    joinWSRoom,
    leaveWSRoom,
    inviteUser,
    kickUser,
    addWSRoom,
    editWSRoom,
    deleteWSRoom
} from './wsActions';

export const RECEIVE_ROOM_LIST = 'RECEIVE_ROOM_LIST',
    TOGGLE_CHAT_ROOM = 'TOGGLE_CHAT_ROOM',
    RECEIVE_CHAT_DATA = 'RECEIVE_CHAT_DATA',
    ADD_CHAT_ROOM = 'ADD_CHAT_ROOM',
    ERROR_ROOM_ACTION = 'ERROR_ROOM_ACTION',
    REQUEST_ALL_USERS = 'REQUEST_ALL_USERS',
    RECEIVE_ALL_USERS = 'RECEIVE_ALL_USERS',
    FAIL_ALL_USERS = 'FAIL_ALL_USERS',
    REQUEST_ALL_MESSAGES = 'REQUEST_ALL_MESSAGES',
    RECEIVE_ALL_MESSAGES = 'RECEIVE_ALL_MESSAGES',
    FAIL_ALL_MESSAGES = 'FAIL_ALL_MESSAGES',
    SELECT_MESSAGE = 'SELECT_MESSAGE',
    UNSELECT_MESSAGE = 'UNSELECT_MESSAGE',
    REQUEST_INVITE_USER = 'REQUEST_INVITE_USER',
    REQUEST_KICK_USER = 'REQUEST_KICK_USER',
    REQUEST_ADD_ROOM = 'REQUEST_ADD_ROOM',
    REQUEST_DELETE_ROOM = 'REQUEST_DELETE_ROOM',
    REQUEST_EDIT_ROOM = 'REQUEST_EDIT_ROOM';

export const selectMessage = message => ({
    type: SELECT_MESSAGE,
    payload: { message }
});

export const unselectMessage = message => ({
    type: UNSELECT_MESSAGE,
    payload: { message }
});

export const editChatRoom = (roomId, title) => dispatch => {
    dispatch({
        type: REQUEST_EDIT_ROOM
    });
    editWSRoom({ roomId, title });
};

export const addChatRoom = title => dispatch => {
    dispatch({
        type: REQUEST_ADD_ROOM
    });
    addWSRoom(title);
};

export const deleteChatRoom = roomId => dispatch => {
    dispatch({
        type: REQUEST_DELETE_ROOM
    });
    deleteWSRoom(roomId);
};

export const inviteUserToRoomByName = username => (dispatch, getState) => {
    const { roomId, users, rooms } = getState(),
        user = Object
            .keys(users.items)
            .map(item => users.items[item])
            .find(u => u.username === username);

    const hasUser = rooms.items[roomId].users
        .find(u => u.id === user.id);

    if (!roomId || hasUser)
        return;

    dispatch({
        type: 'REQUEST_INVITE_USER',
        payload: { roomId, user }
    });
    inviteUser({ roomId, userId: user.id });
};

export const inviteUserToRoomById = userId => (dispatch, getState) => {
    const { roomId, rooms, auth } = getState();

    if (!roomId)
        return;
    const isCreator = rooms.items[roomId].creator.id === auth.id;

    if (!isCreator)
        return;

    const hasUser = rooms.items[roomId].users
        .find(id => id === userId);

    if (hasUser)
        return;
    dispatch({
        type: 'REQUEST_INVITE_USER',
        payload: { roomId, userId }
    });
    inviteUser({ roomId, userId });
};
export const kickUserFromRoom = userId => (dispatch, getState) => {
    const { roomId, rooms, auth } = getState();

    if (!roomId)
        return;
    const isCreator = rooms.items[roomId].creator.id === auth.id;

    if (!isCreator)
        return;

    const hasUser = rooms.items[roomId].users
        .find(id => id === userId);

    if (!hasUser)
        return;
    dispatch({
        type: 'REQUEST_KICK_USER',
        payload: { roomId, userId }
    });
    kickUser({ roomId, userId });
};

export const getRoomList = () => dispatch => {
    // console.log('in getRoomList');
    mockApi.fetchAllRooms().then(rooms => dispatch({
        type: 'RECEIVE_ROOM_LIST',
        payload: { rooms: [].concat(rooms) }
    }));
};

// const getChatRoom = roomId => dispatch => {
//     mockApi.fetchChatRoomData(roomId)
//         .then(data =>
//             dispatch(
//                 {
//                     type: RECEIVE_CHAT_DATA,
//                     payload: data
//                 }));
// };

export const toggleChatRoom = roomId => (dispatch, getState) => {
    const { roomId: oldRoomId } = getState();

    if (oldRoomId === roomId)
        return;
    dispatch({
        type: TOGGLE_CHAT_ROOM,
        payload: {
            roomId
        }
    });
    if (roomId)
        joinWSRoom(roomId);
    else
        leaveWSRoom(roomId);

    // dispatch(getChatRoom(roomId));
};

// export const addChatRoom = title => dispatch => {
//     mockApi.addNewRoom(title)
//         .then(data => {
//             dispatch({
//                 type: ADD_CHAT_ROOM,
//                 payload: data
//             });
//             dispatch(toggleChatRoom(data.room.id));
//         })
//         .catch(error => {
//             dispatch({
//                 type: ERROR_ROOM_ACTION,
//                 payload: error
//             });
//         });
// };

export const getUserList = () => dispatch => {
    dispatch({
        type: REQUEST_ALL_USERS
    });
    api.getAllUsersRhcloud().then(users => {
        dispatch({
            type: RECEIVE_ALL_USERS,
            payload: { users }
        });
    }).catch(error => {
        dispatch({
            type: FAIL_ALL_USERS,
            payload: { error }
        });
    });
};

export const getMessageList = () => dispatch => {
    dispatch({
        type: REQUEST_ALL_MESSAGES
    });
    api.getAllMessagesRhcloud().then(messages => {
        dispatch({
            type: RECEIVE_ALL_MESSAGES,
            payload: { messages }
        });
        const users = messages.map(msg => msg.user).filter((user, index, self) => self.findIndex(u => u.username === user.username) === index);

        dispatch({
            type: RECEIVE_ALL_USERS,
            payload: { users }
        });
    }).catch(error => {
        dispatch({
            type: FAIL_ALL_MESSAGES,
            payload: { error }
        });
    });
};

// const fetchMessages = roomId => dispatch => {
//   dispatch({type: 'REQUEST_MESSAGES'});
//   return fetch(`${server}/messages/${roomId}`)
//     .then(res => res.json())
//     .then(json => dispatch(receiveMessages(roomId, json)));
// }

// export const getAllRooms = () => dispatch = {

// }
