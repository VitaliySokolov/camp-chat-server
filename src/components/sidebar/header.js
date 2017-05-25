import React, { Component } from 'react';

import SidebarToggle from './toggle';
// import SidebarSearch from './search';
import SidebarMenu from './menu';
import SidebarTitle from './title';

class SidebarHeader extends Component {
    render () {
        return (
            <header className="sidebar__header">
                <SidebarToggle {...this.props} />
                {/* <SidebarSearch />*/}
                <SidebarTitle {...this.props} />
                <SidebarMenu {...this.props} />
            </header>
        );
    }
}

export default SidebarHeader;
