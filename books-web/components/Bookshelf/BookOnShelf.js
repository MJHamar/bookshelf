import React, { useEffect, useState } from 'react';
import { getBooks, getBookProgress } from '../../utils/api';

const BookOnShelf = ({ cover, selectedBook, setSelectedBook }) => {

    const [spineWidth, setSpineWidth] = useState(cover.spineWidth);
    const [spineHeight, setSpineHeight] = useState(cover.bookHeight);

    // when initialised, calculate maximum height of the book and
    // resize the book to fit the shelf, maintaining aspect ratio

    useEffect(() => {
        const setRelativeSize = () => {
            const shelfWidth = cover.shelf_width;
            const shelfHeight = cover.shelf_height;

            if (spineHeight > shelfHeight) {
                const aspectRatio = spineWidth / spineHeight;
                const newHeight = shelfWidth / aspectRatio;

                const newWidth = shelfHeight * aspectRatio;
                setSpineWidth(newWidth);
                setSpineHeight(newHeight);
                console.log(`spineWidth: ${newWidth}, spineHeight: ${newHeight}`);
            }
        };
        setRelativeSize();
    }, []);

    const handleClick = () => {
        if (selectedBook?.cover?.book_id === cover.book_id) {
            setSelectedBook(null);
            return;
        }
        setSelectedBook({ cover: cover });
    };

    return (
        <div
            onClick={handleClick}
            style={{
            cursor: 'pointer',
            // transform: isSelected ? 'rotateY(90deg) scale(2)' : 'rotateY(0deg) scale(1)',
            // transition: 'transform 0.5s',
            height: '100%',
            display: 'flex',
            }}
        >
            <div style={{ flex: 1 }}>
                <img src={cover.spine_fname} alt={`spine`} style={{ height: '100%' }} />
            </div>
        </div>
    );
};

export default BookOnShelf;
