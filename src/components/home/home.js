import React from 'react';
import { Link } from 'react-router-dom';
import Paper from 'material-ui/Paper';
import FlatButton from 'material-ui/FlatButton';

const style = {
  height: 150,
  width: 150,
  margin: 20,
  textAlign: 'center',
  display: 'inline-block',
  lineHeight: '150px',
  position: 'absolute',
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
}


const Home = (props) => (
  <div className="page-wrapper">
    <main className="main main--single" style={{ position: 'relative' }}>
      <Paper
        circle={true}
        style={style}
        zDepth={3}
      >
        <Link to='/chats'>
          <FlatButton
            primary={true}
            label="Welcome!"
          />
        </Link>
      </Paper>
    </main>
  </div>
);

export default Home;
