import React from 'react';
import PropTypes from 'prop-types';

import LogoutButton from './logout-button';
import Avatar from '../avatar';

const AuthInfo = props =>
  <div className="logged auth-wrapper">
    <Avatar
      user={props.user}
      size={40}
      online={true}
      />
    <div className="user-name"> {props.user.name} </div>
    <LogoutButton logout={props.logout} />
  </div>

;

AuthInfo.propTypes = {
    user: PropTypes.object,
    logout: PropTypes.func
};

export default AuthInfo;
