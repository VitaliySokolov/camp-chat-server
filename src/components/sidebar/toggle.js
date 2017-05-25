import React, { Component } from 'react';
import autobind from 'autobindr';

const ToggleSign = props =>
    <svg
        viewBox="0 0 24 24"
        width={props.width || '50px'}
        fill={props.color || 'rgba(255, 255, 255, .5)'}
        style={props.style}
    >
        <path d="M6 4L18 12 6 20v-3L14 12 6 7z" />
    </svg>

    ;

class SidbarToggle extends Component {
    constructor (props) {
        super(props);
        autobind(this);
        this.state = {
            open: false
        };
    }

    componentDidMount () {
        this.setState({
            open: this.props.isSidebarOpened()
        });
    }


    handleToggleClick () {
        // console.log('toggle');
        this.props.toggleSidebar();
        this.setState({ open: !this.state.open });
    }

    render () {
        return (
            <label className="sidebar__toggle" htmlFor="toggle_sb"
                onClick={this.handleToggleClick}>
                {!this.state.open
                    ? <ToggleSign
                        style={{
                            transition: 'transform .3s'
                        }}
                    />
                    : <ToggleSign
                        style={{
                            transform: 'scale(-1)',
                            transition: 'transform .3s'
                        }}
                    />

                }
            </label>
        );
    }
}

export default SidbarToggle;
