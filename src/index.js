import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import injectTapEventPlugin from 'react-tap-event-plugin';
import muiTheme from './theme';

import rootReducer from './reducers';
import App from './containers/app';
import './index.css';

// Needed for onTouchTap
injectTapEventPlugin();

let middlewares = [thunk]
if (process.env.NODE_ENV !== 'production') {
  const logger = createLogger();
  middlewares = [...middlewares, logger]
}

const store = createStore(
  rootReducer,
  applyMiddleware(...middlewares));

ReactDOM.render((
  <Provider store={store}>
    <MuiThemeProvider muiTheme={getMuiTheme(muiTheme)}>
      <App />
    </MuiThemeProvider>
  </Provider>
),
  document.getElementById('root')
);
