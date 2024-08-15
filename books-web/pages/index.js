import React, { useState } from 'react';
import Bookshelf from '../components/Bookshelf/Bookshelf';
import { createBook } from '../utils/api';

const Home = () => {
    const [selectedBook, setSelectedBook] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const handleAddBook = async () => {
        // creates a new book through the API and opens an editor.
        let bookView = await createBook();
        console.log(`bookView: ${JSON.stringify(bookView)}`);
        let book = bookView.book;
        let cover = bookView.cover;
        let progress = bookView.progress;
        await setIsEditing(true);
        setSelectedBook({ book: book, cover: cover, progress: progress });
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
