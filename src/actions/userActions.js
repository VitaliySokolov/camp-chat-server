import { loginRhcloud, registerRhcloud } from '../api/api';
import { initWS, logoutWS } from './wsActions';
// import { getMessageList } from './chatActions';

export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';

export const REGISTER_REQUEST = 'REGISTER_REQUEST';
export const REGISTER_SUCCESS = 'REGISTER_SUCCESS';
export const REGISTER_FAILURE = 'REGISTER_FAILURE';

export const LOGOUT = 'LOGOUT';


export function logout () {
    return function (dispatch) {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        dispatch({
            type: LOGOUT
        });
        dispatch(logoutWS());
    };
}

function handleLoginRequest () {
    return {
        type: LOGIN_REQUEST
    };
}

function handleLoginSuccess (data) {
    const { token, user } = data;

    localStorage.setItem('token', token);
    localStorage.setItem('user_id', user.id);
    localStorage.setItem('username', user.username);
    return {
        type: LOGIN_SUCCESS,
        payload: data
    };
}

function handleLoginFailure (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    return {
        type: LOGIN_FAILURE,
        payload: { error }
    };
}

// function handleConnectWS(data, store) {
//   initSoketIO(data, store);
//   return {
//     type: 'CONNECT_TO_WS'
//   }
// }

export const handleLogin = userInfo => (dispatch, getStore) => {
    const { username, password } = userInfo;

    dispatch(handleLoginRequest());
    loginRhcloud(username, password).then(data => {
        dispatch(handleLoginSuccess(data));
        dispatch(initWS(data));
        // getWsMessages();
        // dispatch(getMessageList())
    }).catch(error => {
        dispatch(handleLoginFailure(error));
    });
};

export const loginFromStorage = () => dispatch => {
    const token = localStorage.getItem('token');
    // console.log([token]);

    if (token) {
        const username = localStorage.getItem('username');
        const id = localStorage.getItem('user_id');
        const payload = { token, user: { id, username } };

        dispatch({
            type: LOGIN_SUCCESS,
            payload
        });
        dispatch(initWS(payload));
        // getWsMessages();
        // dispatch(getMessageList())
        // connectWS({ token });
    } else 
        dispatch({
            type: 'FAIL_AUTOLOGIN'
        });
    
};

export const handleRegister = userInfo => dispatch => {
    const { username, password, email } = userInfo;

    dispatch({
        type: REGISTER_REQUEST
    });
    registerRhcloud(username, password, email).then(data => {
        // console.log(data);
        // (data !== 'OK') || Promise.reject(data);
        dispatch({
            type: REGISTER_SUCCESS
        });
    }).catch(error => {
        dispatch({
            type: REGISTER_FAILURE,
            payload: { error }
        });
    });
};

// const hadleLoginWS = (data) => (dispatch, getState) => {
//   connectWS(data);
// }
