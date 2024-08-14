import React, { useEffect, useState } from 'react';
import { getBook, getBookProgress } from '../../utils/api';

const Book = ({ cover }) => {
    const [isSelected, setIsSelected] = useState(false);
    const [book, setBook] = useState(null);
    const [bookProgress, setBookProgress] = useState(null);
    const [spineWidth, setSpineWidth] = useState(cover.spineWidth);
    const [spineHeight, setSpineHeight] = useState(cover.bookHeight);

    // when initialised, calculate maximum height of the book and
    // resize the book to fit the shelf, maintaining aspect ratio
    useEffect(() => {
        const shelfWidth = cover.shelf_width;
        const shelfHeight = cover.shelf_height;

        if (spineHeight > shelfHeight) {
            const aspectRatio = spineWidth / spineHeight;
            const newHeight = shelfWidth / aspectRatio;

            const newWidth = shelfHeight * aspectRatio;
            setSpineWidth(newWidth);
            setSpineHeight(newHeight);
        }
    }, []);

    const fetchBookDetails = async () => {
        const bookData = await getBooks([cover.book_id]);
        setBook(bookData);

        const progressData = await getBookProgress([cover.book_id]);
        setBookProgress(progressData);
    }

    const handleClick = () => {
        if (!book || !bookProgress) {
            fetchBookDetails();
        }
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
            <img src={cover.spine_fname} alt={`spine`} style={{ height: '100%' }} />
            {(isSelected && book && bookProgress) && (
                <div>
                    <img src={cover.cover_fname} alt={`${book.title} cover`} style={{ width: '100%' }} />
                    <div>{book.title}</div>
                    <div>{book.author}</div>
                </div>
            )}
        </div>
    );
};

export default Book;
