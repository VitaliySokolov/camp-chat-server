import React from 'react';
import ReactDOM from 'react-dom';
import { shallow } from 'enzyme';

import Navbar from './navbar';

describe('Navbar Layout Component', () => {
  it('should render Navbar', () => {
    const wrapper = shallow(<Navbar />);
    expect(wrapper.length).toBe(1);
  });

  it('should contain Authbar', () => {
    const wrapper = shallow(<Navbar />);
    expect(wrapper.find('.nav-link').length).toBe(2);
  });
});
