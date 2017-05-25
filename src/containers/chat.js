import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import Chat from '../components/chat/chat';
import MessageList from '../components/messages/message-list';
import MessageItem from '../components/messages/message-item';
import MessageNew from '../components/messages/message-new';

import * as chatActions from '../actions/chatActions';

function NoMessages (props) {
    return <div>No Messages</div>;
}

class ChatContainer extends Component {

    getMessages () {
        const {
            messages,
            selectedMessage,
            loggedUser,
            roomId
          } = this.props;
        const {
            selectMessage,
            unselectMessage
          } = this.props.chatActions;

        const items = messages.items;

        return items
            ? sortMessages(Object.keys(items).map(item => items[item]), roomId)
                .map(message =>
                    <MessageItem
                        key={message.id}
                        message={message}
                        loggedUser={loggedUser}
                        selectedMessage={selectedMessage}
                        unselectMessage={unselectMessage}
                        selectMessage={selectMessage} />
                ) : <NoMessages />;
        // user={getAuthor(message)}
    }

    showMessageNew () {
        // const { roomId } = this.props;
        const roomId = true;

        return roomId
            && <MessageNew />
            ;
    }

    render () {
        const { messages, rooms, roomId } = this.props,
            roomTitle = rooms.items[roomId].title,
            { inviteUserToRoomById } = this.props.chatActions;

        const noMore = !!(roomId in messages.rooms
            && messages.rooms[roomId].noMore);
        const cutoff = roomId in messages.rooms
            && messages.rooms[roomId].theOldestTime;

        return (
            <Chat
                roomTitle={roomTitle}
                inviteUserToRoomById={inviteUserToRoomById}
            >
                <MessageList
                    cutoff={cutoff}
                    noMore={noMore}>
                    {this.getMessages()}
                </MessageList>
                {this.showMessageNew()}
            </Chat>
        );
    }
}

function sortMessages (items, roomId) {
    return items
        .filter(msg => msg.roomId === roomId)
        .sort((a, b) => a.time - b.time);
}

function mapStateToProps (state) {
    return {
        messages: state.messages,
        roomId: state.roomId,
        rooms: state.rooms,
        selectedMessage: state.selectedMessage,
        loggedUser: state.auth
    };
}

function mapDispatchToProps (dispatch) {
    return {
        chatActions: bindActionCreators(chatActions, dispatch)
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ChatContainer);
