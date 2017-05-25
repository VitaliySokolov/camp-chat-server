export const SERVER_URL = process.env.NODE_ENV === 'production'
    ? ''
    : process.env.REACT_APP_SERVER_URL || 'localhost';
export const WS_SERVER_URL = `${SERVER_URL}`;
export const dev = process.env.NODE_ENV === 'development';
