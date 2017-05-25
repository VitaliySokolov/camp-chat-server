import React, { Component } from 'react';
import { List } from 'material-ui/List';

class RoomList extends Component {
    constructor (props) {
        super(props);
        this.handleDblClick = this.handleDblClick.bind(this);
    }

    handleDblClick (event) {
        event.preventDefault();
        this.props.showRoomUsers();
    }

    render () {
        return (
            <List
                className="room-list"
                onDoubleClick={this.handleDblClick}
                >
                {this.props.children}
            </List>
        );
    }
}

export default RoomList;
