import React from 'react';
import ReactDOM from 'react-dom';
import { shallow, mount } from 'enzyme';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import AppContainer from './app';

const middlewares = [];
const mockStore = configureStore(middlewares);

describe('App container', () => {
  let Component;

  beforeEach(() => {
    const store = mockStore({loggedUser: {name: 'default'}});
    const wrapper = shallow(
      <Provider store={store}>
        <AppContainer />
      </Provider>
    );
    Component = wrapper.find(AppContainer);
  });

  it('renders w/o crashing', () => {
    expect(Component.length).toBe(1);
  });

});
