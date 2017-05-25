import React, { Component } from 'react';

class UserNew extends Component {
    constructor (props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
    }


    handleSubmit (event) {
        event.preventDefault();
        const value = event.target.username.value.trim();

        if (value)
            this.props.inviteUserToRoomByName(value);
        event.target.username.value = '';
    }

    render () {
        return (
            <form className="user-new" onSubmit={this.handleSubmit}>
                <input type="text" className="user-new__input" name="username" placeholder="new user..." />
                <button className="user-new__add">Add</button>
            </form>
        );
    }
}

export default UserNew;
