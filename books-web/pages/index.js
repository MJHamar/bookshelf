import React, { useState } from 'react';
import Bookshelf from '../components/Bookshelf/Bookshelf';

const Home = () => {
    const [showAddBookForm, setShowAddBookForm] = useState(false);

    const handleAddBookClick = () => {
        setShowAddBookForm(true);
    };

    return (
        <div>
            <Bookshelf />
            <button onClick={handleAddBookClick} style={{ position: 'fixed', bottom: '10px', right: '10px' }}>
                Add Book
            </button>
            {showAddBookForm && (
                <div>
                    hello
                </div>
            )}
        </div>
    );
};

export default Home;
