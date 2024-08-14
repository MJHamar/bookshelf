import React, { useEffect, useState } from 'react';
import { getBooks, getBookProgress } from '../../utils/api';

const Book = ({ cover }) => {
    const [isSelected, setIsSelected] = useState(false);
    const [book, setBook] = useState(null);
    const [bookProgress, setBookProgress] = useState(null);
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
            }
        };
        setRelativeSize();
    }, []);

    useEffect(() => {
        const fetchBookDetails = async () => {
            if (!isSelected) {
                return;
            }
            const bookData = await getBooks([cover.book_id]);
            setBook(bookData);
            console.log(`book data: ${JSON.stringify(bookData)}`);
    
            const progressData = await getBookProgress([cover.book_id]);
            setBookProgress(progressData);
            console.log(`book progress: ${JSON.stringify(progressData)}`);
        }
        fetchBookDetails();
    }, [isSelected]);

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
                display: 'flex',
            }}
        >
            {(isSelected && book && bookProgress) && (
                <div style={{ flex: 1, position: "fixed", backgroundColor: 'white', width: '100%', height: '100%', top: 0, left: 0 }}>
                    <img src={cover.cover_fname} alt={`${book.title} cover`} style={{ width: '100%' }} />
                    <div>{book.title}</div>
                    <div>{book.author}</div>
                </div>
            )}
            <div style={{ flex: 1 }}>
                <img src={cover.spine_fname} alt={`spine`} style={{ height: '100%' }} />
            </div>
        </div>
    );
};

export default Book;
