import { SERVER_URL } from '../config';

/**
 * Helper for fetching from rhcloud
 * @param {*} url
 */
const getFromRhcloud = (url, method = 'GET', bodyObj = null) => {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  const init = {
    method: method,
    headers,
    mode: 'cors',
    cache: 'default',
  };
  if (bodyObj) {
    init['body'] = JSON.stringify(bodyObj);
  }

  return fetch(url, init)
    .then(data => {
      if (data.status === 200) {
        return data.json()
      } else {
        return Promise.reject(`${data.status}: ${data.statusText}`);
      }
    })
    .catch(error => {
      return Promise.reject(error);
    });
}

/**
 *
 * @param {*} username
 * @param {*} password
 *
 * @return Promise with {token:'', tokenType:'', user: {username:'', ...}}
 */
export const loginRhcloud = (username, password) => {
  const userInfo = { username };
  if (password) {
    userInfo['password'] = password;
  }
  const url = `${SERVER_URL}/login`;
  return getFromRhcloud(url, 'POST', userInfo);
}

/**
 *
 * @param {string} username
 * @param {string} password
 * @param {string} email
 *
 * @return Promise with string 'OK' if register
 */
export const registerRhcloud = (username, password, email) => {
  const userInfo = {
    username,
    password,
    email
  }
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  const init = {
    method: 'POST',
    headers,
    mode: 'cors',
    cache: 'default',
    body: JSON.stringify(userInfo)
  };

  return fetch(`${SERVER_URL}/signup`, init)
    .then(data => {
      if (data.status === 201) {
        return 'OK'
      } else {
        return Promise.reject(`Code: ${data.status} (${data.statusText})`)
      }

    })
    .catch(error => {
      return Promise.reject(error)
    });
}


/**
 * @return Promise with Array[{username: 'someone', ...}]
 */
export const getAllUsersRhcloud = () => {
  const url = `${SERVER_URL}/users`;
  return getFromRhcloud(url)
    .then(users => users.filter(
      user => ('username' in user))) //&& 'email' in user)))
}

/**
 * @return Promise with Array[{msg:"hi", time:1492...26, user: {
 *  username: '', ...
 * }}]
 */
export const getAllMessagesRhcloud = () => {
  const url = `${SERVER_URL}/messages`;
  return getFromRhcloud(url)
}
