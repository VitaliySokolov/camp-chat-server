import { SERVER_URL } from '../config';
import { initWS, logoutWS } from './wsActions';
import { checkHttpStatus, parseJSON, prepareFetchOptions } from '../utils';

export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';

export const REGISTER_REQUEST = 'REGISTER_REQUEST';
export const REGISTER_SUCCESS = 'REGISTER_SUCCESS';
export const REGISTER_FAILURE = 'REGISTER_FAILURE';

export const LOGOUT = 'LOGOUT';


function fetchRegister ({ username, password, email }) {
    const options = prepareFetchOptions();

    options.body = JSON.stringify({ username, password, email });
    return fetch(`${SERVER_URL}/signup`, options);
}

function fetchLogin ({ username, password }) {
    const options = prepareFetchOptions();

    options.body = JSON.stringify({ username, password });
    return fetch(`${SERVER_URL}/login`, options);
}

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

export const handleLogin = userInfo => dispatch => {
    const { username, password } = userInfo;

    dispatch(handleLoginRequest());
    fetchLogin({ username, password })
        .then(checkHttpStatus)
        .then(parseJSON)
        .then(data => {
            dispatch(handleLoginSuccess(data));
            dispatch(initWS(data));
        }).catch(error => dispatch(handleLoginFailure(error.message || error)));
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
    } else
        dispatch({
            type: 'FAIL_AUTOLOGIN'
        });
};

export const handleRegister = ({ username, password, email }) => dispatch => {
    dispatch({
        type: REGISTER_REQUEST
    });
    fetchRegister({ username, password, email })
        .then(checkHttpStatus)
        .then(response => {
            if (response.status === 201)
                dispatch({
                    type: REGISTER_SUCCESS
                });
            else
                throw new Error(response.statusText);
        })
        .catch(error => {
            dispatch({
                type: REGISTER_FAILURE,
                payload: { error: error.message || error }
            });
        });
};

