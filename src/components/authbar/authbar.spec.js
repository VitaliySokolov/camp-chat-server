import React from 'react';
import ReactDOM from 'react-dom';
import { shallow } from 'enzyme';

import Authbar from './authbar';
import AuthInfo from './auth-info';
import AuthLinks from './auth-links';

describe('Authbar Component', () => {
  it('renders component', () => {
    const user = { name: '', isLogged: false };
    const wrapper = shallow(<Authbar user={user} />);
    expect(wrapper.length).toBe(1);
  });

  it('should contain AuthLinks when logout', () => {
    const user = { name: '', isLogged: false };
    const wrapper = shallow(<Authbar user={user} />);
    expect(wrapper.contains(<AuthLinks />)).toBeTruthy();
  });

  it('should contain AuthInfo when login', () => {
    const user = { name: 'default', isLogged: true };
    const logout = () => { };
    const wrapper = shallow(
      <Authbar
        user={user}
        logout={logout} />);
    expect(wrapper.contains(
      <AuthInfo
        user={user}
        logout={logout} />
    )).toBeTruthy();
  });
});
