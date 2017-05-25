import React, { Component } from 'react';
import autobind from 'autobindr';
import classNames from 'classnames';
import moment from 'moment';
import Avatar from '../avatar';
import MultilineText from '../multiline-text';
import IconButton from 'material-ui/IconButton';
import Edit from 'material-ui/svg-icons/image/edit';
import Delete from 'material-ui/svg-icons/action/delete-forever';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';

import {
    editWsMessage,
    deleteWsMessage
} from '../../actions/wsActions';

class MessageItem extends Component {
    constructor (props) {
        super(props);
        autobind(this);
        this.state = {
            editOpen: false,
            deleteOpen: false,
            newValue: null
        };
    }

    handleEditClick () {
        this.setState({ editOpen: true, newValue: null });
    }

    handleEditClose () {
        this.setState({ editOpen: false });
    }

    handleEditBlur (event) {
        const value = event.target.value.trim();

        if (value !== this.props.message.text)
            this.setState({ newValue: value });
    }

    handleEditSubmit () {
        const newValue = this.state.newValue;

        if (newValue !== null
            && newValue !== this.props.message.text)
            editWsMessage({
                msgId: this.props.message.id,
                msgText: newValue
            });

        this.setState({ editOpen: false });
    }

    handleDeleteClick () {
        this.setState({ deleteOpen: true });
    }

    handleDeleteClose () {
        this.setState({ deleteOpen: false });
    }

    handleDeleteSubmit () {
        deleteWsMessage({
            msgId: this.props.message.id
        });
        this.setState({ deleteOpen: false });
    }

    handleSelectClick (event) {
        // const { selectMessage, unselectMessage,
        //   message, selectedMessage } = this.props;
        // if (selectedMessage !== message) {
        //   selectMessage(message);
        // } else {
        //   unselectMessage(message);
        // }
    }

    componentDidMount () {
        // console.log(this);
        this.node.scrollIntoView();
    }

    render () {
        const {
            loggedUser,
            message,
            selectedMessage } = this.props;
        const { text, time, author } = message;
        const ltime = moment(+time).fromNow();
        const rowClassName = classNames('message-list-row', {
            'message-list-row--self': author.id === loggedUser.id
        });
        const selectionClassName = classNames('message-text', {
            'bg-red': selectedMessage === message,
            'robot': author === 'robot'
        });

        const editActions = [
            <FlatButton
                label="Cancel"
                primary={true}
                onTouchTap={this.handleEditClose}
            />,
            <FlatButton
                label="Submit"
                primary={true}
                onTouchTap={this.handleEditSubmit}
            />
        ];

        const deleteActions = [
            <FlatButton
                label="Cancel"
                primary={true}
                onTouchTap={this.handleDeleteClose}
            />,
            <FlatButton
                label="Delete"
                primary={true}
                onTouchTap={this.handleDeleteSubmit}
            />
        ];

        const editButton
            = <IconButton
                onTouchTap={this.handleEditClick}
            >
                <Edit />
                <Dialog
                    title="Edit the message"
                    modal={true}
                    open={this.state.editOpen}
                    actions={editActions}
                >
                    <TextField
                        id={this.props.message.id}
                        defaultValue={this.props.message.text}
                        fullWidth={true}
                        multiLine={true}
                        rows={2}
                        onBlur={this.handleEditBlur}
                    />
                </Dialog>
            </IconButton>

            ;
        const deleteButton
            = <IconButton
                onTouchTap={this.handleDeleteClick}
            >
                <Delete />
                <Dialog
                    title="Delete the message"
                    modal={true}
                    open={this.state.deleteOpen}
                    actions={deleteActions}
                >
                    {this.props.message.text}
                </Dialog>
            </IconButton>

            ;

        const messageTools = author.id === loggedUser.id
            ? <div className="message-tools">
                {editButton}
                {deleteButton}
            </div>
            : null;

        return (
            <div className={rowClassName}
                ref={node => this.node = node} onClick={this.handleSelectClick}>
                <Avatar user={author} />
                <div className="message">
                    <div className="message-author">{author.username}:</div>
                    <div className={selectionClassName}>
                        <MultilineText text={text} />
                    </div>
                    <time className="message-time">{ltime}</time>
                </div>
                {messageTools}
            </div>
        );
    }
}

export default MessageItem;
