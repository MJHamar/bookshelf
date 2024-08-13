import React from 'react';
import Book from './Book';

const Shelf = ({ shelf, books, covers }) => {
    let totalSpineWidth = 0;

    return (
        <div style={{
            position: 'absolute',
            left: shelf.x_pos,
            top: shelf.y_pos,
            width: shelf.width,
            height: shelf.height,
            display: 'flex',
            alignItems: 'flex-end'
        }}>
            {books.map(book => {
                const cover = covers.find(c => c.book_id === book.id);
                totalSpineWidth += cover.spine_width;

                if (totalSpineWidth <= shelf.width) {
                    return <Book key={book.id} book={book} cover={cover} />;
                }
                // If no more space on this shelf, skip the book.
                return null;
            })}
        </div>
    );
};

export default Shelf;
