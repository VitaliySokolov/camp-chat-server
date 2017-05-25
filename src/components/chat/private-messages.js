import React, { Component } from 'react';
import autobind from 'autobindr';
import Badge from 'material-ui/Badge';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import MailOutline from 'material-ui/svg-icons/communication/mail-outline';

class PrivateMessages extends Component {
    constructor (props) {
        super(props);
        autobind(this);
        this.state = {
            newBadges: 0
        };
    }

    handleTouchTap (event) {
        console.log('write new');
    }

    render () {
        const pmIconMenu
            = <IconMenu
                iconButtonElement={
                    <IconButton>
                        <MailOutline />
                    </IconButton>
                }
                targetOrigin={{
                    horizontal: 'left',
                    vertical: 'top'
                }}
                anchorOrigin={{
                    horizontal: 'left',
                    vertical: 'bottom'
                }}
            >
                {/* <MenuItem primaryText="Show new" />
        <MenuItem primaryText="Show all" />*/}
                <MenuItem
                    primaryText="Write new"
                    onTouchTap={this.handleTouchTap}
                />
            </IconMenu>

            ;
        const pmWithBadges = this.state.newBadges
            ? <Badge
                badgeContent={this.state.newBadges}
                secondary={true}
                badgeStyle={{ top: 0, right: 0, zIndex: 1 }}
                style={{ padding: 0 }}
            >
                {pmIconMenu}
            </Badge >
            : pmIconMenu;

        return (
            <div>
                {pmWithBadges}
            </div>
        );
    }
}

export default PrivateMessages;
