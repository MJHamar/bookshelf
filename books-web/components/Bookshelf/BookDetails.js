import React, { useEffect, useState } from 'react';
import { getBooks, getBookProgress } from '../../utils/api';


const BookDetails = ({ selectedBook, setSelectedBook }) => {

    const [bookId, setBookId] = useState(null);
    const [cover, setCover] = useState(null);
    const [book, setBook] = useState(null);
    const [bookProgress, setBookProgress] = useState(null);

    useEffect(() => {
        if (!selectedBook) {
            return;
        }
        setBookId(selectedBook.book_id);
        setCover(selectedBook.cover);
    }, [selectedBook]);

    useEffect(() => {
        const fetchBookDetails = async () => {
            if (!bookId) {
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
    }, [bookId, cover]);

    const handleBookClick = () => {
        setSelectedBook(null);
    };

    if (!book || !bookProgress || !selectedBook) {
        return null;
    }

    return (
        <div style={{ flex: 1, position: "fixed", backgroundColor: 'white', top: 0, left: 0, width: '100vw', height: '100vh' }}>
            <img
                src={cover.cover_fname}
                alt={`${book.title} cover`}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                onClick={handleBookClick}
            />
            <div>Title: {book.title}</div>
            <div>Author: {book.author}</div>
        </div>
    );

};

export default BookDetails;