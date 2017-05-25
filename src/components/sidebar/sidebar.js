import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SidebarHeader from './header';
import classNames from 'classnames';

export default class Sidebar extends Component {
    render () {
        const { isSidebarOpened, toggleSidebar } = this.props,
            sidebarClassNames = classNames('sidebar', {
                'sidebar--opened': isSidebarOpened()
            });

        return (
            <aside className={sidebarClassNames}>
                <SidebarHeader
                    {...this.props}
                    toggleSidebar={toggleSidebar}
                />
                {this.props.children}
            </aside>
        );
    }
}

Sidebar.propTypes = {
    isSidebarOpened: PropTypes.func.isRequired,
    toggleSidebar: PropTypes.func.isRequired,
    children: PropTypes.array
};
