import React, { Component } from 'react';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import Person from 'material-ui/svg-icons/social/person';

class PersonAccount extends Component {
    render () {
        return (
            <div>
                <IconMenu
                    iconButtonElement={
                        <IconButton>
                            <Person />
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
                    <MenuItem primaryText="Account Info" />
                    {/* <MenuItem primaryText="Some else" />
          <MenuItem primaryText="Sign out" />*/}
                </IconMenu>
            </div>
        );
    }
}

export default PersonAccount;
