import React from 'react';
import PropTypes from 'prop-types';
import Avatar from 'react-avatar';

const DEFAULT_SIZE = 50;

function ModAvatar (props) {
    if (props.user === 'robot')
        return <Avatar src={'/img/robot.png'} alt="robot" className="user-image robot" size={50}
        />;

    if (props.online) {

    }
    const onlineOffline = props.online
        ? <i className="online-status online-status--active" />
        : <i className="online-status" />;

    const onlineStatus = props.online !== undefined
        ? onlineOffline
        : null;

    return (
        <span className="avatar-wrapper">
            <Avatar
                name={props.title
                    || props.user.username
                    || props.user.name}
                alt="img"
                className={props.wrapperClasses || 'user-image'}
                size={props.size || DEFAULT_SIZE}
                round={props.round || true}
                {...props}
            />
            {onlineStatus}
        </span>
    );
}

ModAvatar.propTypes = {
    title: PropTypes.string,
    user: PropTypes.object,
    wrapperClasses: PropTypes.string,
    round: PropTypes.bool,
    size: PropTypes.number
};

export default ModAvatar;
