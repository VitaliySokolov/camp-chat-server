import messagesReducer from './messages-reducer';
import * as types from '../actions/chatActions';
import * as wsTypes from '../actions/wsActions';

describe('messages reducer with fetch data', () => {
  it('should return the initial state', () => {
    expect(
      messagesReducer(undefined, {})
    ).toEqual({
      items: [],
      isFetching: false,
      didInvalidate: false
    })
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
    const time = +(new Date());
    const user = { username: 'John Doe' };
    const action = {
      type: wsTypes.WS_JOIN,
      payload: { time, user },
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
    const time = +(new Date());
    const user = { username: 'John Doe' };
    const action = {
      type: wsTypes.WS_LEAVE,
      payload: { time, user },
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
    const time = +(new Date());
    const user = { username: 'John Doe' };
    const msg = "hello world";
    const action = {
      type: wsTypes.WS_MESSAGE,
      payload: { msg, time, user },
    };
    const expectedState = {
      items: [{
        id: 1,
        text: msg,
        author: user,
        time
      }],
      isFetching: false,
      didInvalidate: false
    };
    expect(messagesReducer(initailState, action)).toEqual(expectedState);
  });
});
