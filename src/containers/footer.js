import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import autobind from 'autobindr';
import Snackbar from 'material-ui/Snackbar';
import IconButton from 'material-ui/IconButton';
import Info from 'material-ui/svg-icons/action/info-outline';
import Close from 'material-ui/svg-icons/navigation/close';

import * as popupActions from '../actions/popupActions';

class FooterContainer extends Component {
    constructor (props) {
        super(props);
        autobind(this);
    }

    handleRequestClose () {
        this.props.popupActions.requestClose();
    }

    render () {
        const { popups } = this.props;
        const { message, open } = popups;
        const infoButton
            = <IconButton iconStyle={{ color: 'rgba(255, 255, 255, .87)' }} >
                <Info />
            </IconButton>;
        const closeButton
            = <IconButton
                iconStyle={{ color: 'rgba(255, 255, 255, .87)' }}
                onTouchTap={this.handleRequestClose}
            >
                <Close />
            </IconButton>;
        const messageNode
            = <div style={{
                display: 'flex',
                justifyContent: 'space-between'
            }}
            >
                {infoButton}
                {open && message}
                {closeButton}
            </div>;

        return (
            <div>
                <Snackbar
                    open={open}
                    message={messageNode}
                    autoHideDuration={4000}
                    onRequestClose={this.handleRequestClose}
                />
            </div>
        );
    }
}

function mapStateToProps (state) {
    return {
        popups: state.popups
    };
}

function mapDispatchToProps (dispatch) {
    return {
        popupActions: bindActionCreators(popupActions, dispatch)
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(FooterContainer);
