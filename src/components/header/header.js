import React from 'react';
import Navbar from '../navbar/navbar';
import Authbar from '../authbar/authbar';

const Header = (props) => (
  <header className="main-header">
    <div className="header-contents">
      <Navbar />
      <Authbar {...props} />
    </div>
  </header>
)

export default Header;
