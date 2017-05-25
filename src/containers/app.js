import React, { Component } from 'react';
import {
    BrowserRouter as Router,
    Route,
    Switch,
    Redirect
} from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import autobind from 'autobindr';

import Header from '../components/header/header';
import Home from '../components/home/home';
import ChatContainer from './chat';
import SidebarContainer from './sidebar';
import Login from '../components/login/login';
import Register from '../components/register/register';
import Footer from './footer';
import NotFound from '../components/not-found';

import * as userActions from '../actions/userActions.js';

const GuardChatsRoute = ({ ...rest }) =>
    <Route {...rest} render={props =>
        rest.isLogged
            ? <div className="page-wrapper">
                    <SidebarContainer />
                    <ChatContainer />
                </div>

            : <Redirect to={{
                pathname: '/login',
                state: { from: props.location }
            }} />} />

;

class App extends Component {
    constructor (props) {
        super(props);
        autobind(this);
    }

    componentDidMount () {
        this.props.userActions.loginFromStorage();
    }


    isAuthenticated () {
        return !!this.props.loggedUser.name;
    }

    render () {
        const {
      handleLogin,
            handleRegister,
            logout
    } = this.props.userActions;

        return (
            <Router>
                <div className="App">
                    <Header
                        user={this.props.loggedUser}
                        logout={logout} />
                    <Switch>
                    <Route exact path="/" component={Home} />
                    <GuardChatsRoute path="/chats"
                        isLogged={this.props.loggedUser.isLogged} />
                    <Route path="/login" component={
                        () =>
                            <Login
                                handleLogin={handleLogin}
                                loggedUser={this.props.loggedUser} />} />
                    <Route path="/register" component={
                        () => <Register
                            handleRegister={handleRegister}
                            loggedUser={this.props.loggedUser} />} />
                    <Route component={NotFound} />
                    </Switch>
                    <Footer />
                </div>
            </Router>
        );
    }
}

function mapStateToProps (state) {
    return {
        loggedUser: state.auth
    };
}

function mapDispatchToProps (dispatch) {
    return {
        userActions: bindActionCreators(userActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
