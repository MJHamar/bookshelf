// src/Bookshelf.js
import React from 'react';
import './Bookshelf.css'; // We'll create this CSS file next

function Bookshelf({ collections }) {
    return (
        <div className="bookshelf">
            {collections.map((collection, index) => (
                <div key={index} className="collection">
                    <h2>{collection.name}</h2>
                    <div className="books">
                        {collection.books.map((book, bookIndex) => (
                            <div key={bookIndex} className="book">
                                <img src={book.cover} alt={book.title} title={book.title} />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Bookshelf;
