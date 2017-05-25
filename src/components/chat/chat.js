import React, { Component } from 'react';
import ChatHeader from './header';

class Chat extends Component {
  render() {
    return (
      <main className="main">
        <ChatHeader {...this.props}/>
        {this.props.children}
      </main>
    );
  }
}

export default Chat;
