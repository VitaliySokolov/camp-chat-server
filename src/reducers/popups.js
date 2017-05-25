import {
    CHAT_JOIN,
    CHAT_LEAVE,
    MESSAGE,
    MESSAGES,
    JOIN_ROOM,
    LEAVE_ROOM,
    INVITE_USER,
    KICK_USER
} from '../../shared/socket.io/events';

import {
    CLOSE_POPUP
} from '../actions/popupActions';

import { createReducer } from '../utils';

const popupInitialState = {
    message: '',
    open: false
};

export default createReducer(popupInitialState, {
    [CLOSE_POPUP]: state => ({
        ...state,
        open: false, message: ''
    }),
    [CHAT_JOIN]: (state, payload) => ({
        ...state,
        open: true,
        message: `${payload.user.username} joined the chat`
    }),
    [CHAT_LEAVE]: (state, payload) => ({
        ...state,
        open: true,
        message: `${payload.user.username} left the chat`
    }),
    [JOIN_ROOM]: (state, payload) => ({
        ...state,
        open: !payload.self,
        message: `${payload.user.username} joined the room`
    }),
    [LEAVE_ROOM]: (state, payload) => ({
        ...state,
        open: !payload.self,
        message: `${payload.user.username} left the room`
    }),
    [INVITE_USER]: (state, payload) => ({
        ...state,
        open: true,
        message: 'user invited to the room'
    }),
    [KICK_USER]: (state, payload) => ({
        ...state,
        open: true,
        message: 'user kicked from the room'
    }),
    [MESSAGE]: (state, payload) => ({
        ...state,
        open: !payload.self,
        message: payload.room
            ? `${payload.user.username} sent a message`
            : `${payload.user.username} sent a message to the Common Room`
    }),
    [MESSAGES]: (state, payload) => ({
        ...state,
        open: !payload.messages.length,
        message: payload.messages.length !== 0
            ? `Loaded ${payload.messages.length} message(s).`
            : 'No messages'
    })
});
