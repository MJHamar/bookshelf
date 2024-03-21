// src/App.js
import React from 'react';
import './App.css';
import Bookshelf from './Bookshelf';

const collections = [
  {
    name: 'Fantasy',
    books: [
      { title: 'Book 1', cover: 'path/to/cover.jpg' },
      // Add more books here
    ],
  },
  // Add more collections here
];

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Bookshelf collections={collections} />
      </header>
    </div>
  );
}

export default App;

