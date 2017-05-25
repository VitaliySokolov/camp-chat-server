import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import Home from 'material-ui/svg-icons/action/home';
import Chat from 'material-ui/svg-icons/communication/chat';
import FlatButton from 'material-ui/FlatButton';

class Navbar extends Component {
    constructor (props) {
        super(props);
        this.state = {
            active: 'chats'
        };
        this.handleLinkClick = this.handleLinkClick.bind(this);
    }

    handleLinkClick (event) {
        event.preventDefault();

        if (event.target.href.match(/\/chats$/))
            this.setState({ active: 'chats' });
        else
            this.setState({ active: 'home' });
    }
    render () {
        return (
            <nav className="nav-main">
                <NavLink to="/"
                    activeClassName="active"
                    exact
                    className="nav-link">
                    <FlatButton
                        primary={true}
                        label="Home"
                        icon={<Home/>}
                        />

        </NavLink>
                <NavLink to="/chats"
                    activeClassName="active"
                    className="nav-link">
                    <FlatButton
                        primary={true}
                        label="Chats"
                        icon={<Chat />}
                        />

        </NavLink>
            </nav>
        );
    }
}

export default Navbar;
