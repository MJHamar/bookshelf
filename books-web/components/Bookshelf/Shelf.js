import React, { useState, useEffect, useContext } from 'react';
import BookOnShelf from './BookOnShelf';
import { getBookCovers } from '../../utils/api';

const Shelf = ({ shelf, b2sMaps,

    selectedBookId, setSelectedBookId }) => {
    let totalSpineWidth = 0;

    const [bookCovers, setBookCovers] = useState([]);

    const bookIds = b2sMaps.map(b2s => b2s.book_id);

    useEffect(() => {
        const fetchData = async () => {
            const coversData = await getBookCovers(bookIds);
            setBookCovers(coversData);
            console.log(coversData);
        };
        fetchData();
    }, []);

    return (
        <div style={{
            position: 'absolute',
            left: shelf.x_pos,
            top: shelf.y_pos,
            width: shelf.width,
            height: shelf.height,
            display: 'flex',
            alignItems: 'flex-end',
            zIndex: 100
        }}>
            {bookCovers.map(cover => {
                totalSpineWidth += cover.spine_width;

                if (totalSpineWidth <= shelf.width) {
                    return <BookOnShelf
                        key={cover.book_id}
                        cover={cover}
                        setCover={setBookCovers}
                        selectedBook={selectedBook}
                        setSelectedBook={setSelectedBook}
                    />;
                }
                // If no more space on this shelf, skip the book.
                return null;
            })}
        </div>
    );
};

export default Shelf;
