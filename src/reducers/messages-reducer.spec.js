import messagesReducer from './messages-reducer';
import * as types from '../actions/chatActions';
import * as wsTypes from '../actions/wsActions';

describe('messages reducer with fetch data', () => {
    it('should return the initial state', () => {
        messagesReducer(undefined, {})
            .should
            .deep
            .equal({
                items: {},
                rooms: {},
                isFetching: false,
                didInvalidate: false
            });
    });

    xit('should handle REQUEST_ALL_MESSAGES', () => {
        expect(
            messagesReducer(undefined, {
                type: types.REQUEST_ALL_MESSAGES
            })
        ).toEqual({
            items: [],
            isFetching: true,
            didInvalidate: false
        });
    });
    xit('should handle RECEIVE_ALL_MESSAGES', () => {
        expect(
            messagesReducer(undefined, {
                type: types.RECEIVE_ALL_MESSAGES,
                payload: {
                    messages: [{
                        msg: 'foo',
                        time: 0,
                        user: { username: 'bar' }
                    }]
                }
            })
        ).toEqual({
            items: [{
                id: 0,
                text: 'foo',
                author: { username: 'bar' },
                time: 0
            }],
            isFetching: false,
            didInvalidate: false
        });
    });
    xit('should handle FAIL_ALL_MESSAGES', () => {
        expect(
            messagesReducer(undefined, {
                type: types.FAIL_ALL_MESSAGES,
                payload: { error: 'some error' }
            })
        ).toEqual({
            items: [],
            isFetching: false,
            didInvalidate: true,
            error: 'some error'
        });
    });
});

describe('messages reducer with WebSocket data', () => {
    xit('should handle WS_JOIN', () => {
        const initailState = undefined;
        const time = +new Date();
        const user = { username: 'John Doe' };
        const action = {
            type: wsTypes.WS_JOIN,
            payload: { time, user }
        };
        const expectedState = {
            items: [{
                id: 1,
                text: `${user.username}'s joined the chat`,
                author: 'robot',
                time
            }],
            isFetching: false,
            didInvalidate: false
        };

        expect(messagesReducer(initailState, action)).toEqual(expectedState);
    });
    xit('should handle WS_LEAVE', () => {
        const initailState = undefined;
        const time = +new Date();
        const user = { username: 'John Doe' };
        const action = {
            type: wsTypes.WS_LEAVE,
            payload: { time, user }
        };
        const expectedState = {
            items: [{
                id: 1,
                text: `${user.username}'s left the chat`,
                author: 'robot',
                time
            }],
            isFetching: false,
            didInvalidate: false
        };

        expect(messagesReducer(initailState, action)).toEqual(expectedState);
    });
    it('should handle WS_MESSAGE', () => {
        const initailState = undefined;
        const time = +new Date();
        const user = { username: 'John Doe' };
        const msg = 'hello world';
        const id = 'msg1';
        const action = {
            type: 'message',
            payload: { id, msg, time, user }
        };
        const expectedState = {
            items: {
                [id]: {
                    id,
                    roomId: 0,
                    text: msg,
                    author: user,
                    time
                }
            },
            rooms: {},
            isFetching: false,
            didInvalidate: false
        };

        messagesReducer(initailState, action)
            .should
            .deep
            .equal(expectedState);
    });
});
