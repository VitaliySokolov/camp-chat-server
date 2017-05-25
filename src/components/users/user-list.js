import React, { Component } from 'react';

class UserList extends Component {
    constructor (props) {
        super(props);
        this.handleDblClick = this.handleDblClick.bind(this);
    }

    handleDblClick (event) {
        event.preventDefault();
        this.props.showRooms();
    }

    render () {
        return (
            <div
                className="user-list"
                onDoubleClick={this.handleDblClick}>
                {this.props.children}
            </div>
        );
    }
}

export default UserList;
