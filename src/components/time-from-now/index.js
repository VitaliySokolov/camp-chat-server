import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

class TimeFromNow extends Component {
    render () {
        const
            time = this.props.time,
            messageTime = moment(time)
                .fromNow(this.props.ago || true);

        return (
            <div>
                {messageTime !== 'Invalid date'
                    && <time className={this.props.classes || null}>
                        {messageTime}
                    </time>
                }
            </div>
        );
    }
}

TimeFromNow.propTypes = {
    time: PropTypes.any,
    ago: PropTypes.bool,
    classes: PropTypes.string
};

export default TimeFromNow;
