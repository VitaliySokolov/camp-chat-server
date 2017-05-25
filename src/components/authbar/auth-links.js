import React from 'react';
import { NavLink } from 'react-router-dom';
import Login from 'material-ui/svg-icons/action/exit-to-app';
import Register from 'material-ui/svg-icons/action/assignment';
import FlatButton from 'material-ui/FlatButton';


const AuthLinks = props =>
  <div className="link-list guest auth-wrapper">
    <NavLink to="/login"
      activeClassName="active"
      className="nav-link">
      <FlatButton
        primary={true}
        label="Login"
        icon={<Login />}
      />
    </NavLink>
    <NavLink to="/register"
      activeClassName="active"
      className="nav-link">
      <FlatButton
        primary={true}
        label="Register"
        icon={<Register />}
      />
    </NavLink>
  </div>

  ;

export default AuthLinks;
