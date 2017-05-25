import React from 'react';
import LoginForm from './login-form';

const Login = (props) => (
  <div className="page-wrapper">
    <main className="main main--single">
      <LoginForm {...props} />
    </main>
  </div>
);

export default Login;
