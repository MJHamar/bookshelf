import React, { useState } from 'react';

const Book = ({ book, cover }) => {
    const [isSelected, setIsSelected] = useState(false);

    const handleClick = () => {
        setIsSelected(!isSelected);
    };

    return (
        <div
            onClick={handleClick}
            style={{
                cursor: 'pointer',
                transform: isSelected ? 'rotateY(90deg) scale(2)' : 'rotateY(0deg) scale(1)',
                transition: 'transform 0.5s',
                height: '100%',
            }}
        >
            <img src={cover.spine_fname} alt={`${book.title} spine`} style={{ height: '100%' }} />
            {isSelected && (
                <div>
                    <img src={cover.cover_fname} alt={`${book.title} cover`} style={{ width: '100%' }} />
                    <div>{book.title}</div>
                    <div>{book.author}</div>
                    {/* Add more details or editing options here */}
                </div>
            )}
        </div>
    );
};

export default Book;
