import React, { Component } from 'react';
import autobind from 'autobindr';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import MenuItem from 'material-ui/MenuItem';
import Menu from 'material-ui/svg-icons/navigation/menu';

import { getWSRooms, getWSAllUsers } from '../../actions/wsActions';

class SidebarMenu extends Component {
    constructor (props) {
        super(props);
        autobind(this);
    }

    handleRoomsClick () {
        const { showRooms } = this.props;

        getWSRooms();
        showRooms();
    }

    handleRoomUsersClick () {
        const { showRoomUsers } = this.props;

        showRoomUsers();
    }

    handleAllUsersClick () {
        const { showAllUsers } = this.props;

        getWSAllUsers();
        showAllUsers();
    }

    render () {
        return (
            <IconMenu
                iconButtonElement={
                    <IconButton
                        iconStyle={{
                            color: 'rgba(255, 255, 255, .87)'
                        }}>
                        <Menu />
                    </IconButton>
                }
                targetOrigin={{
                    horizontal: 'right',
                    vertical: 'top'
                }}
                anchorOrigin={{
                    horizontal: 'right',
                    vertical: 'bottom'
                }}
            >
                <MenuItem
                    primaryText="Show rooms"
                    onTouchTap={this.handleRoomsClick} />
                <MenuItem
                    primaryText="Show room users"
                    onTouchTap={this.handleRoomUsersClick} />
                <MenuItem
                    primaryText="Show all users"
                    onTouchTap={this.handleAllUsersClick}/>
            </IconMenu>
        );
    }
}

export default SidebarMenu;
