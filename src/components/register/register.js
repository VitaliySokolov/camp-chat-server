import React from 'react';
import RegisterForm from './register-form';

const Register = (props) => (
  <div className="page-wrapper">
    <main className="main main--single">
      <RegisterForm {...props} />
    </main>
  </div>
);

export default Register;
