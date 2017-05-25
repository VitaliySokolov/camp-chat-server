import React, { Component } from 'react';
import autobind from 'autobindr';
import { withRouter, Redirect } from 'react-router-dom';

import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import Progress from '../progress';

const MIN_LENGTH = 4;
const REQUIRED_FIELD_ERROR = 'This field is required';
const PASSWORDS_MISMATCH_ERROR = 'Please retype the password.';
const INVALID_EMAIL = 'Please provide a valid email address.';
const MINIMUM_LENGTH = `Minimum length is ${MIN_LENGTH} characters.`;
const INVALID_LOGIN = 'Please create a login with only alphanumeric characters.';
const loginRegex = /^[a-zA-Z0-9]+$/;
const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export class RegisterFormWithoutRouter extends Component {
    constructor (props) {
        super(props);
        autobind(this);

        const { loggedUser } = this.props;

        this.state = {
            login: null,
            loginError: loggedUser.error === 'Code: 404 (Not Found)' ? 'Please choose another login' : '',
            email: null,
            emailError: '',
            password: null,
            passwordError: '',
            repeatPassword: null,
            repeatPasswordError: ''
        };
    }

    handleLoginChange (event) {
        const value = event.target.value;

        if (value === '')
            this.setState({
                loginError: REQUIRED_FIELD_ERROR
            });
        else if (!loginRegex.test(value))
            this.setState({
                loginError: INVALID_LOGIN
            });
        else if (value.length < MIN_LENGTH)
            this.setState({
                loginError: MINIMUM_LENGTH
            });
        else
            this.setState({ loginError: '' });

        this.setState({
            login: value
        });
    }

    handleEmailChange (event) {
        const value = event.target.value;

        if (value === '')
            this.setState({
                emailError: REQUIRED_FIELD_ERROR
            });
        else if (!emailRegex.test(value))
            this.setState({
                emailError: INVALID_EMAIL
            });
        else
            this.setState({ emailError: '' });

        this.setState({
            email: value
        });
    }

    handlePasswordChange (event) {
        const value = event.target.value;

        if (value === '')
            this.setState({
                passwordError: REQUIRED_FIELD_ERROR
            });
        else if (!!this.state.repeatPassword && value !== this.state.repeatPassword)
            this.setState({
                passwordError: PASSWORDS_MISMATCH_ERROR
            });
        else if (value.length < MIN_LENGTH)
            this.setState({
                passwordError: MINIMUM_LENGTH
            });
        else
            this.setState({
                passwordError: '',
                repeatPasswordError: ''
            });

        this.setState({
            password: value
        });
    }

    handleRepeatPasswordChange (event) {
        const value = event.target.value;

        if (value === '')
            this.setState({
                repeatPasswordError: REQUIRED_FIELD_ERROR
            });
        else if (value !== this.state.password)
            this.setState({
                repeatPasswordError: PASSWORDS_MISMATCH_ERROR
            });
        else if (value.length < MIN_LENGTH)
            this.setState({
                repeatPasswordError: MINIMUM_LENGTH
            });
        else
            this.setState({
                repeatPasswordError: '',
                passwordError: ''
            });

        this.setState({
            repeatPassword: value
        });
    }

    handleRegisterClick (event) {
        event.preventDefault();
        const { handleRegister } = this.props;

        if (
            !this.state.login
            || !this.state.email
            || !this.state.password
            || !this.state.repeatPassword
            || this.state.password !== this.state.repeatPassword
        )
            return;

        const user = {
            username: this.state.login,
            password: this.state.password,
            email: this.state.email
        };

        handleRegister(user);
    }

    render () {
        const { loggedUser } = this.props;

        if (loggedUser.isRegister)
            return <Redirect to="/login" />;

        if (loggedUser.registering)
            return (
                <Progress />
            );

        return (
            <div className="auth-form-wrapper">
                <div className="signup-wrapper">
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
                        floatingLabelText="Email"
                        errorText={this.state.emailError}
                        fullWidth={true}
                        onChange={this.handleEmailChange}
                        onBlur={this.handleEmailChange}
                        type="email"
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
                    <TextField
                        floatingLabelText="Repeat Password"
                        type="password"
                        errorText={this.state.repeatPasswordError}
                        fullWidth={true}
                        onChange={this.handleRepeatPasswordChange}
                        onBlur={this.handleRepeatPasswordChange}
                    />

                    <FlatButton
                        label="Register"
                        secondary={true}
                        fullWidth={true}
                        hoverColor="#d7d8f1"
                        style={{
                            borderRadius: '10px'
                        }}
                        disabled={
                            !this.state.login || !!this.state.loginError
                            || !this.state.password || !!this.state.passwordError
                            || !this.state.repeatPassword || !!this.state.repeatPasswordError
                            || !this.state.email || !!this.state.emailError
                        }
                        onClick={this.handleRegisterClick}
                    />
                </div>
            </div>
        );
    }
}

const RegisterForm = withRouter(RegisterFormWithoutRouter);

export default RegisterForm;
