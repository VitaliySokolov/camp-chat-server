import React, { Component } from 'react';
import PropTypes from 'prop-types';
import autobind from 'autobindr';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import { Droppable } from 'react-drag-and-drop';

class RoomNew extends Component {
    constructor (props) {
        super(props);
        autobind(this);
        this.state = {
            open: false,
            value: '',
            error: ''
        };
    }

    onDrop (data) {
        console.log(data);
    }

    handleAddChange (event) {
        this.setState({
            value: event.target.value,
            error: ''
        });
        // console.log(this.state.value);
    }

    handleAddSubmit () {
        const value = this.state.value.trim();

        if (value) {
            this.props.addChatRoom(this.state.value);
            this.setState({
                open: false,
                value: '',
                error: ''
            });
        } else
            this.setState({
                error: 'Title cannot not be empty'
            });
    }

    render () {
        const addActions = [
            <FlatButton
                key="addRoomCancel"
                label="Cancel"
                primary={true}
                onTouchTap={() => this.setState({ open: false, value: '', error: '' })}
            />,
            <FlatButton
                key="addRoomSubmit"
                label="Add"
                primary={true}
                onTouchTap={this.handleAddSubmit}
            />
        ];

        return (
            <div>
                <Droppable types={['roomid']} onDrop={this.onDrop} className="room-new">
                    <FloatingActionButton
                        secondary={true}
                        onTouchTap={() => this.setState({ open: true })}>
                        <ContentAdd />
                        <Dialog
                            title="Add a new room"
                            modal={true}
                            open={this.state.open}
                            actions={addActions}
                        >
                            <TextField
                                id="add_room"
                                fullWidth={true}
                                multiLine={false}
                                errorText={this.state.error}
                                onChange={this.handleAddChange}
                            />
                        </Dialog>

                    </FloatingActionButton>
                </Droppable>
            </div>
        );
    }
}

RoomNew.propTypes = {
    addChatRoom: PropTypes.func.isRequired
};

export default RoomNew;
