import React from 'react';
import logo from './logo.svg';
import "./App.styles.scss";
import Button from '@mui/material/Button';
import Section from '@mui/material/Card';
const styles = require('./App.scss');

const  App = () => {
  const click = () => console.log('clicked');
  console.log('STYLES STYLES',styles);
  return (
   
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <Button variant="contained" onClick={click}>Hello World</Button>
        <Section >
          This is a sample section from Material
        </Section>
      </header>
    </div>
  );
}


export default App;
