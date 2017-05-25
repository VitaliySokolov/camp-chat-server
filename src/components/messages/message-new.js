import React, { Component } from 'react';
import { sendMessage } from '../../actions/wsActions';
import autobind from 'autobindr';
import IconButton from 'material-ui/IconButton';
import TextField from 'material-ui/TextField';
import SvgSend from 'material-ui/svg-icons/content/send';

class MessageNew extends Component {
    constructor (props) {
        super(props);
        autobind(this);
        this.state = {
            messageText: ''
        };
    }

    send () {
        sendMessage(this.state.messageText);
        this.setState({
            messageText: ''
        });
    }

    handleSubmit (event) {
        event.preventDefault();
        this.send();
    }

    handleChange (event) {
        this.setState({
            messageText: event.target.value
        });
    }

    handleKeyDown (event) {
        if (event.ctrlKey && event.which === 13)
            this.send();
    }

    handleEmoji (event) {
        event.preventDefault();
        // console.log('push emoji');
        this.setState({ 'showEmojiPicker': true });
    }

    render () {
        return (
            <form onSubmit={this.handleSubmit}>
                <div className="message-new__wrapper">
                    <TextField
                        className="message-new__input"
                        hintText="Type here..."
                        errorText=""
                        floatingLabelText="Send a new message:"
                        multiLine={true}
                        rows={2}
                        rowsMax={2}
                        ref={ta => this.textarea = ta}
                        onKeyDown={this.handleKeyDown}
                        onChange={this.handleChange}
                        value={this.state.messageText}
                    />
                    <IconButton
                        className="message-new__submit"
                        tooltip="send"
                        tooltipPosition="top-right"
                        onTouchTap={this.handleSubmit}
                        disabled={!this.state.messageText.trim()}
                    >
                        <SvgSend />
                    </IconButton>
                </div>
            </form>
        );
    }
}

export default MessageNew;
