import React, { Component } from 'react';
import autobind from 'autobindr';
import { withRouter, Redirect } from 'react-router-dom';

import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import Progress from '../progress';

const REQUIRED_FIELD_ERROR = 'This field is required';

class LoginFormWithoutRouter extends Component {
    constructor (props) {
        super(props);
        autobind(this);

        this.state = {
            login: null,
            loginError: '',
            password: null,
            passwordError: ''
        };
    }


    handleLoginChange (event) {
        const value = event.target.value;

        if (value === '')
            this.setState({
                loginError: REQUIRED_FIELD_ERROR
            });
        else
            this.setState({ loginError: '' });

        this.setState({
            login: value
        });
    }

    handlePasswordChange (event) {
        const value = event.target.value;

        if (value === '')
            this.setState({
                passwordError: REQUIRED_FIELD_ERROR
            });
        else
            this.setState({ passwordError: '' });

        this.setState({
            password: value
        });
    }

    handleLoginClick (event) {
        const { handleLogin } = this.props;

        if (!this.state.login || !this.state.password)
            return;

        const user = {
            username: this.state.login,
            password: this.state.password
        };

        handleLogin(user);
        event.preventDefault();
    }

    render () {
        const { loggedUser } = this.props;

        if (loggedUser.isLogged)
            return <Redirect to="/chats" />;

        if (loggedUser.logging)
            return (
                <Progress />
            );

        const loginMessageSuccess = loggedUser.isRegister
            ? <div className="login-message login-message--success">
                Now you can log in!
            </div>
            : null;

        const loginMessageFail = loggedUser.error === '401: Unauthorized'
            ? <div className="login-message login-message--fail">
                Invalid Login or password
            </div>
            : null;

        return (
            <div className="auth-form-wrapper">
                <div className="signin-wrapper">
                    {loginMessageSuccess}
                    {loginMessageFail}
                    <TextField
                        floatingLabelText="Login"
                        errorText={this.state.loginError}
                        fullWidth={true}
                        onChange={this.handleLoginChange}
                        onBlur={this.handleLoginChange}
                        type="text"
                        autoComplete={true}
                    />
                    <TextField
                        floatingLabelText="Password"
                        type="password"
                        errorText={this.state.passwordError}
                        fullWidth={true}
                        onChange={this.handlePasswordChange}
                        onBlur={this.handlePasswordChange}
                    />
                    <FlatButton
                        id="login"
                        label="Login"
                        secondary={true}
                        fullWidth={true}
                        hoverColor="#d7d8f1"
                        style={{
                            borderRadius: '10px'
                        }}
                        disabled={!this.state.login || !this.state.password}
                        onClick={this.handleLoginClick}
                    />
                </div>
            </div>
        );
    }
}

const LoginForm = withRouter(LoginFormWithoutRouter);

export default LoginForm;
