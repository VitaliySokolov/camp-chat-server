import React, { Component } from 'react';
import { Droppable } from 'react-drag-and-drop';

class ChatTitle extends Component {
    constructor (props) {
        super(props);
        this.handleDrop = this.handleDrop.bind(this);
    }

    handleDrop (data) {
        // console.log(data);
        const userId = data.id;

        // console.log(userId);
        this.props.inviteUserToRoomById(userId);
    }

    render () {
        return (
            <Droppable
                types={['id']}
                onDrop={this.handleDrop}
            >
                {this.props.roomTitle}
            </Droppable>
        );
    }
}

export default ChatTitle;
