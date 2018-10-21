import React, { Component } from 'react';
import logo from './logo.png';
import './App.css';

// import RandomLetter from "./RandomLetter";
const letterpressDictionary = window.letterpressDictionary;
class App extends Component {
  componentWillMount(){
    for (var i = 0; i < 25; i++) {
      console.log(letterpressDictionary.indexOf("water"));
    }
  }

  render() {
    return (
      <div className="App">
        <img src={logo} alt="App logo"/>
      </div>
    );
  }
}

export default App;
