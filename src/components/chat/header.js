import React, { Component } from 'react';
import AppBar from 'material-ui/AppBar';

// import PrivateMessages from './private-messages';
import ChatTitle from './title';
import PersonAccount from './account';
import Avatar from '../avatar';

class ChatHeader extends Component {

    render () {
        const appBarStyle = {
            borderTopRightRadius: '10px',
            backgroundColor: 'white',
            color: 'black'
        };

        return (
            <div>
                <AppBar
                    iconElementLeft={
                        // <PrivateMessages {...this.props} />
                        <Avatar
                        title={this.props.roomTitle}
                        round={false}
                        size={50} />
                        }
                    iconElementRight={<PersonAccount />}
                    title={<ChatTitle {...this.props} />}
                    titleStyle={{
                        textAlign: 'center',
                        color: 'black'
                    }}
                    style={appBarStyle}
                />
            </div>
        );
    }
}
// className="messages-header"
export default ChatHeader;
