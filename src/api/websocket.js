import io from 'socket.io-client';

const SOCKET_URL = 'http://eleksfrontendcamp-mockapitron.rhcloud.com';
const ALT_SOCKET_URL = 'http://eleksfrontendcamp-mockapitron.rhcloud.com:8000';

export const typesWS = [
  'message',
  'join',
  'leave'
]
let socket;
// const socket = io(SOCKET_URL);
// todo: read token from localstorage

export const connectWsToStore = (store) => {
  typesWS.forEach(type =>
    socket.on(type, (payload) =>
      store.dispatch({ type, payload })));
}

export const emit = (type, payload) =>
  socket.emit(type, payload);

// export const connectWS = (data) => {
//   // console.log(data.token);
//   socket.disconnect()
//   socket.connect();
//   socket.on('connect', () => {
//     console.log('auth in');
//     socket.emit('authenticate', {token: data.token});
//   });
// }

export const initSoketIO = (data, store) => {
  socket = io(ALT_SOCKET_URL);
  socket.on('connect', () => {
    connectWsToStore(store)
    // console.log('auth in');
    socket.emit('authenticate', {token: data.token});
  });

}
