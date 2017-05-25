import React, { Component } from 'react';
import autobind from 'autobindr';
import classNames from 'classnames';
import ReactEmoji from 'react-emoji';
import { Draggable } from 'react-drag-and-drop';
import FlatButton from 'material-ui/FlatButton';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import Dialog from 'material-ui/Dialog';
import UserInvite from 'material-ui/svg-icons/content/add';
import UserKick from 'material-ui/svg-icons/content/remove';

import Avatar from '../avatar';
import TimeFromNow from '../time-from-now';

class UserItem extends Component {
    constructor (props) {
        super(props);
        autobind(this);
        this.state = {
            kickOpen: false,
            inviteOpen: false
        };
    }

    handleKickOpen () {
        this.setState({
            kickOpen: true
        });
    }

    handleKickClose () {
        this.setState({
            inviteOpen: false,
            kickOpen: false
        });
    }

    handleKickSubmit () {
        const { kickUserFromRoom, user } = this.props;

        kickUserFromRoom(user.id);
        this.setState({
            kickOpen: false
        });
    }

    handleInviteOpen () {
        this.setState({
            inviteOpen: true
        });
    }

    handleInviteClose () {
        this.setState({
            inviteOpen: false
        });
    }

    handleInviteSubmit () {
        const { inviteUserToRoom, user } = this.props;

        inviteUserToRoom(user.id);
        this.setState({
            inviteOpen: false
        });
    }

    render () {
        const {
            user,
            loggedUser,
            selectedUser,
            roomId,
            room } = this.props,
            isSelf = loggedUser.id === user.id,
            isCreator = room.creator
                && room.creator.id === loggedUser.id,
            isRoomUser = !!(room.users
                && room.users.find(u => u === user.id));

        const { username } = user;
        const userClassName = classNames('user', {
            'bg-red': selectedUser && selectedUser.username === user.username
        });
        let
            lastMessageText = '',
            lastMessageTime = '';

        if (user.rooms && roomId in user.rooms) {
            lastMessageText = user.rooms[roomId].lastMessage;
            lastMessageTime = user.rooms[roomId].lastMessageTime;
        }
        const kickActions = [
            <FlatButton
                key="userKickCancel"
                label="Cancel"
                primary={true}
                onTouchTap={this.handleKickClose}
            />,
            <FlatButton
                key="userKickSubmit"
                label="Kick"
                primary={true}
                onTouchTap={this.handleKickSubmit}
            />
        ];

        const inviteActions = [
            <FlatButton
                key="userInviteCancel"
                label="Cancel"
                primary={true}
                onTouchTap={this.handleInviteClose}
            />,
            <FlatButton
                key="userInviteSubmit"
                label="Invite"
                primary={true}
                onTouchTap={this.handleInviteSubmit}
            />
        ];

        const userTools = roomId && isCreator && !isSelf
            ? <div className="user-tools">
                {isRoomUser
                    ? <FloatingActionButton
                        secondary={true}
                        mini={true}
                        onTouchTap={this.handleKickOpen}
                    >
                        <UserKick />
                        <Dialog
                            title={`Kick ${user.username} from ${room.title}`}
                            modal={true}
                            open={this.state.kickOpen}
                            actions={kickActions}
                        />
                    </FloatingActionButton>
                    : <FloatingActionButton
                        secondary={true}
                        mini={true}
                        onTouchTap={this.handleInviteOpen}
                    >
                        <UserInvite />
                        <Dialog
                            title={`Invite ${user.username} to ${room.title}`}
                            modal={true}
                            open={this.state.inviteOpen}
                            actions={inviteActions}
                        />
                    </FloatingActionButton>
                }
            </div>
            : null;

        return (
            <Draggable className={userClassName} type="id" data={user.id}>
                <Avatar
                    user={user}
                    online={user.online} />
                <div className="user__info-wrapper">
                    <div className="user__name">{username}</div>
                    <div className="user__last-message">{
                        ReactEmoji.emojify(
                            lastMessageText,
                            { attributes: { width: '15px', height: '15px' } }
                        )}</div>
                </div>
                {userTools}
                <TimeFromNow time={lastMessageTime} classes="user__last-message-time" />
            </Draggable>
        );
    }
}

export default UserItem;
