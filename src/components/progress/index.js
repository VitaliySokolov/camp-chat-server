import React from 'react';
import CircularProgress from 'material-ui/CircularProgress';

const Progress = (props) => (
  <CircularProgress
    style={{
      height: '100%',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  />
);

export default Progress;
