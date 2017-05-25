import React, { Component } from 'react';
import autobind from 'autobindr';
import { Tabs, Tab } from 'material-ui/Tabs';
// import Rooms from 'material-ui/svg-icons/action/room';
import Rooms from 'material-ui/svg-icons/social/group';
import RoomUsers from 'material-ui/svg-icons/social/group-add';
import AllUsers from 'material-ui/svg-icons/social/people-outline';
class Title extends Component {
    constructor (props) {
        super(props);
        autobind(this);
        this.state = {
            index: 0
        };
    }
    handleRoomsClick () {
        const { showRooms } = this.props;

        showRooms();
    }

    handleRoomUsersClick () {
        const { showRoomUsers } = this.props;

        showRoomUsers();
    }

    handleAllUsersClick () {
        const { showAllUsers } = this.props;

        showAllUsers();
    }

    handleChange (value) {
        this.setState({
            index: value
        });
    }

    componentWillMount () {
        const { getTabIndex } = this.props;

        this.setState({
            index: getTabIndex()
        });
    }
    componentWillReceiveProps (nextProps) {
        const { getTabIndex } = nextProps;

        if (getTabIndex() !== this.state.index)
            this.setState({
                index: getTabIndex()
            });
    }


    render () {
        return (
            <div style={{ flex: '1' }}>
                <Tabs
                    value={this.state.index}
                    onChange={this.handleChange}
                >
                    <Tab
                        icon={<Rooms
                            hoverColor="red"
                        />}
                        value={0}
                        onActive={this.handleRoomsClick}>
                    </Tab>
                    <Tab
                        // label="2"
                        icon={<RoomUsers
                            hoverColor="red"
                        />}
                        value={1}
                        onActive={this.handleRoomUsersClick}>
                    </Tab>
                    <Tab
                        // label="3"
                        icon={<AllUsers
                            hoverColor="red"
                        />}
                        value={2}
                        onActive={this.handleAllUsersClick}>
                    </Tab>

                </Tabs>
            </div>
        );
    }
}

export default Title;
