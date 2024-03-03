// App.js
import React from 'react';
import BookInfo from './/BookInfo.js';
import './App.css';
function App() {
  return (
    <div className="App" style={{ height: '200px', overflow: 'scroll' }}>
      <div className="lepain">
        <BookInfo />
      </div> 
    </div>
  );
}

export default App;
