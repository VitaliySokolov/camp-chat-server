import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames';
import autobind from 'autobindr';

import { dev } from '../config';

import Sidebar from '../components/sidebar/sidebar';
import RoomList from '../components/rooms/room-list';
import RoomItem from '../components/rooms/room-item';
import RoomNew from '../components/rooms/room-new';
import UserList from '../components/users/user-list';
import UserItem from '../components/users/user-item';
// import UserNew from '../components/users/user-new';

import * as chatActions from '../actions/chatActions';


class SidebarContainer extends Component {
    constructor (props) {
        super(props);
        autobind(this);
        this.state = {
            open: !!dev,
            tabIndex: 0
        };
    }

    getTabIndex () {
        return this.state.tabIndex;
    }

    isSidebarOpened () {
        return this.state.open;
    }

    toggleSidebar () {
        this.setState({ open: !this.state.open });
    }

    showAllUsers () {
        this.setState({
            tabIndex: 2
        });
    }

    showRoomUsers () {
        // getWSRoomUsers({roomId: this.props.roomId});
        this.setState({
            tabIndex: 1
        });
    }

    showRooms () {
        this.setState({
            tabIndex: 0
        });
    }


    getRooms () {
        const { rooms, roomId, users, loggedUser } = this.props;
        const {
            toggleChatRoom,
            deleteChatRoom,
            editChatRoom
         } = this.props.chatActions;

        return rooms
            ? Object.keys(rooms.items).map(item => rooms.items[item]).map(room =>
                <RoomItem
                    key={room.id}
                    room={room}
                    roomId={roomId}
                    users={users}
                    loggedUser={loggedUser}
                    toggleChatRoom={toggleChatRoom}
                    editChatRoom={editChatRoom}
                    deleteChatRoom={deleteChatRoom} />
            ) : null;
    }

    getUsers () {
        let selectedUser = null;
        const {
            users,
            loggedUser,
            selectedMessage,
            rooms,
            roomId } = this.props,
            { inviteUserToRoomById,
                kickUserFromRoom } = this.props.chatActions;

        if (selectedMessage)
            // console.log(selectedMessage.author);
            selectedUser = selectedMessage.author;

        const userArray
            = this.state.tabIndex === 1 && roomId
                ? rooms.items[roomId].users
                : Object.keys(users.items);

        return users
            ? userArray.map(id =>
                <UserItem
                    key={id}
                    user={users.items[id]}
                    roomId={roomId}
                    room={rooms.items[roomId]}
                    loggedUser={loggedUser}
                    selectedUser={selectedUser}
                    inviteUserToRoom={inviteUserToRoomById}
                    kickUserFromRoom={kickUserFromRoom}
                />
            ) : null;
    }

    render () {
        const { addChatRoom } = this.props.chatActions,
            roomsWrapperClass = classNames('rooms-wrapper', {
                hidden: this.state.tabIndex
            }),
            usersWrapperClass = classNames('users-wrapper', {
                hidden: !this.state.tabIndex
            });


        return (
            <Sidebar
                showAllUsers={this.showAllUsers}
                showRoomUsers={this.showRoomUsers}
                showRooms={this.showRooms}
                toggleSidebar={this.toggleSidebar}
                isSidebarOpened={this.isSidebarOpened}
                getTabIndex={this.getTabIndex}
            >
                <div className={roomsWrapperClass}>
                    <RoomList
                        showRoomUsers={this.showRoomUsers}
                    >
                        {this.getRooms()}
                    </RoomList>
                    {this.isSidebarOpened() && <RoomNew addChatRoom={addChatRoom} />}
                </div>
                <div className={usersWrapperClass}>
                    <UserList
                        showRooms={this.showRooms}
                    >
                        {this.getUsers()}
                    </UserList>
                    {/* {this.isSidebarOpened() && !this.state.allUsers && !!roomId && rooms.items[roomId].creator.id === loggedUser.id
                        && <UserNew inviteUserToRoomByName={inviteUserToRoomByName} />}*/}
                </div>
            </Sidebar>
        );
    }
}

function mapStateToProps (state) {
    return {
        rooms: state.rooms,
        users: state.users,
        roomId: state.roomId,
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
)(SidebarContainer);
