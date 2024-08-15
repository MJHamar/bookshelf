import React, { useEffect, useState } from 'react';
import { getBooks, getBookProgress } from '../../utils/api';
import { downloadFile } from '../../utils/data_handler';

const BookOnShelf = ({ cover, selectedBook, setSelectedBook }) => {

    const [spineWidth, setSpineWidth] = useState(cover.spineWidth);
    const [spineHeight, setSpineHeight] = useState(cover.bookHeight);
    const [spineImageURL, setSpineImageURL] = useState(null);

    // when initialised, calculate maximum height of the book and
    // resize the book to fit the shelf, maintaining aspect ratio

    useEffect(() => {
        const setRelativeSize = () => {
            const shelfWidth = cover.shelf_width;
            const shelfHeight = cover.shelf_height;

            const aspectRatio = spineWidth / spineHeight;
            const newHeight = shelfHeight < spineHeight ? shelfHeight : spineHeight;
            const newWidth = newHeight * aspectRatio;
            setSpineWidth(newWidth);
            setSpineHeight(newHeight);
            console.log(`spineWidth: ${newWidth}, spineHeight: ${newHeight}`);
        };
        setRelativeSize();
    }, []);

    useEffect(() => {
        if (cover?.spine_fname) downloadFile({
            uuid: cover.spine_fname,
            setFileData: setSpineImageURL
        });
    }, [cover]);

    const handleClick = () => {
        if (selectedBook?.cover?.book_id === cover.book_id) {
            setSelectedBook(null);
            return;
        }
        console.log(`selected book: ${JSON.stringify(selectedBook)}`); 
        console.log(setSelectedBook);
        console.log(`cover: ${ JSON.stringify(cover) }`);
        setSelectedBook({ cover: cover });
    };

    if (selectedBook?.cover?.book_id === cover.book_id) {
        return;
    }

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
                <img src={spineImageURL} alt={`spine`} style={{ height: '100%' }} />
            </div>
        </div>
    );
};

export default BookOnShelf;
