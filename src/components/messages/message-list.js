import React, { Component } from 'react';
// import ReactPullToRefresh from 'react-pull-to-refresh';
import { getWsMessages } from '../../actions/wsActions';
import FlatButton from 'material-ui/FlatButton';
// import classNames from 'classnames';
import Progress from '../progress';
import autobind from 'autobindr';

class MessageList extends Component {

    constructor (props) {
        super(props);
        this.state = {
            loading: false
        };
        autobind(this);
    }


    handleRefresh (resolve, reject) {
        // console.log('refresh');
        getWsMessages(this.props.cutoff);
        resolve();
    }

    handleTouchTap (event) {
        getWsMessages(this.props.cutoff);
    }


    render () {
        const { noMore } = this.props;

        // const pullToRefreshClassNames = classNames({
        //     hidden: this.state.loading
        // });
        const progressBar = this.state.loading
            ? <Progress /> : null;

        return (
            <div
                className="message-list">
                <FlatButton
                    label="Push to get older messages"
                    fullWidth={true}
                    onTouchTap={this.handleTouchTap}
                    disabled={noMore}
                />
                {/* <ReactPullToRefresh
                    className={pullToRefreshClassNames}
                    onMouseDown={this.handleMouseDown}
                    onRefresh={this.handleRefresh}
                    disabled={noMore}
                    ref={node => this.listNode = node} >
                </ReactPullToRefresh>*/}
                {progressBar}
                {this.props.children}
            </div>
        );
    }
}

export default MessageList;
