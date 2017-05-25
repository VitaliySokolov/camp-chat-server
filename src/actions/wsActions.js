import io from 'socket.io-client';
import { WS_SERVER_URL } from '../config';
import SOCKETS from '../../shared/socket.io/events';

export const LOGIN_WS_REQUEST = 'LOGIN_WS_REQUEST';
export const LOGIN_WS_SUCCESS = 'LOGIN_WS_SUCCESS';
export const LOGIN_WS_FAILURE = 'LOGIN_WS_FAILURE';
export const LOGOUT_WS = 'LOGOUT_WS';

export const SEND_MESSAGE = 'SEND_MESSAGE';

let socket;

export const connectWsToStore = dispatch => {
    Object.keys(SOCKETS).map(item => SOCKETS[item]).forEach(type => {
        socket.on(type, payload =>
            dispatch({ type, payload }));
    });
};

export const emit = (type, payload) =>
    socket.emit(type, payload);

export const sendMessage = messageText => {
    messageText = messageText.trim();
    if (messageText)
        emit('message', messageText);
};

function loginWsRequest () {
    return {
        type: LOGIN_WS_REQUEST
    };
}

function loginWsSuccess () {
    return {
        type: LOGIN_WS_SUCCESS
    };
}

function loginWsFailure (error) {
    return {
        type: LOGIN_WS_FAILURE,
        payload: { error }
    };
}

export const logoutWS = () => dispatch => {
    socket.disconnect();
    dispatch({
        type: LOGOUT_WS
    });
};

export const getWsMessages = (cutoff, limitCount) => {
    const filter = {
        cutoff: cutoff || new Date(),
        limitCount: limitCount || 10
    };

    emit(SOCKETS.MESSAGES, filter);
};

export const editWsMessage = ({ msgId, msgText }) => {
    emit(SOCKETS.EDIT_MESSAGE, { msgId, msgText });
};

export const deleteWsMessage = ({ msgId }) => {
    emit(SOCKETS.DELETE_MESSAGE, { msgId });
};

export const getWSRooms = () => {
    emit(SOCKETS.ROOMS);
};

export const getWSRoomUsers = ({ roomId }) => {
    emit(SOCKETS.ROOM_USERS, { roomId });
};

export const getWSAllUsers = () => {
    emit(SOCKETS.USERS);
};

export const addWSRoom = title => {
    title = title.trim();
    if (title)
        emit(SOCKETS.ADD_ROOM, { title });
    // dispatch !!
    // socket.once(SOCKETS.ADD_ROOM, ({ room }) => {
    //     console.log(room);
    //     emit(SOCKETS.JOIN_ROOM, { roomId: room.id });
    // });
};

export const inviteUser = ({ roomId, userId }) => {
    emit(SOCKETS.INVITE_USER, { roomId, userId });
};

export const kickUser = ({ roomId, userId }) => {
    emit(SOCKETS.KICK_USER, { roomId, userId });
};

export const deleteWSRoom = roomId => {
    emit(SOCKETS.DELETE_ROOM, { roomId });
};

export const editWSRoom = ({ roomId, title }) => {
    title = title.trim();
    if (title)
        emit(SOCKETS.EDIT_ROOM, { roomId, newTitle: title });
};

export const joinWSRoom = roomId => {
    socket.once(SOCKETS.JOIN_ROOM, () => {
        emit(SOCKETS.MESSAGES);
        emit(SOCKETS.ROOM_USERS, { roomId });
    });
    emit(SOCKETS.JOIN_ROOM, { roomId });
};

export const leaveWSRoom = roomId => {
    emit(SOCKETS.LEAVE_ROOM);
};

export const initWS = (data, store) => dispatch => {
    try {
        dispatch(loginWsRequest());
        socket = io(WS_SERVER_URL);
        socket.on('connect', () => {
            connectWsToStore(dispatch);
            socket.emit('authenticate', { token: data.token })
                .once('authenticated', () => dispatch(
                    loginWsSuccess()))
                .once('unauthorized', msg => dispatch(
                    loginWsFailure(`unauthorized: ${JSON.stringify(msg.data)}`)))
                .once('join', () => {
                    getWSRooms();
                    getWSAllUsers();
                    getWsMessages();
                })
                .on(SOCKETS.DISCONNECT, () => {
                    socket.disconnect();
                });
        });
    } catch (error) {
        dispatch(loginWsFailure(error));
    }
};
