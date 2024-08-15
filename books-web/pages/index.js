import React, { useState } from 'react';
import Bookshelf from '../components/Bookshelf/Bookshelf';

const Home = () => {
    const [selectedBook, setSelectedBook] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const handleAddBook = () => {
        // creates a new book through the API and opens an editor.
        let bookView = createBook();
        let book = bookView.book;
        let cover = bookView.cover;
        let progress = bookView.progress;
        setSelectedBook({ book: book, cover: cover, progress: progress });
        setIsEditing(true);
    };

    return (
        <div>
            <Bookshelf
                selectedBook={selectedBook}
                setSelectedBook={setSelectedBook}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
            />
            <button onClick={handleAddBook} style={{ position: 'fixed', bottom: '10px', right: '10px' }}>
                Add Book
            </button>
        </div>
    );
};

export default Home;
