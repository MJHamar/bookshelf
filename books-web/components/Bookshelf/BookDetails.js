import React, { useEffect, useState } from 'react';
import { getBooks, getBookProgress } from '../../utils/api';
import { format } from 'date-fns';
import styles from '../../styles/BookDetails.module.css';

const BookDetails = ({ selectedBook, setSelectedBook }) => {

    const [bookId, setBookId] = useState(null);
    const [cover, setCover] = useState(null);
    const [book, setBook] = useState(null);
    const [bookProgress, setBookProgress] = useState(null);
    // see if we need to update anything
    const [bookUpdate, setBookUpdate] = useState(false);
    const [progressUpdate, setProgressUpdate] = useState(false);
    const [coverUpdate, setCoverUpdate] = useState(false);
    // TODO handle updates

    // get information about the selected book
    useEffect(() => {
        if (!selectedBook) {
            return;
        }
        setBookId(selectedBook.book_id);
        setCover(selectedBook.cover);
    }, [selectedBook]);
    // load additional information about the book
    useEffect(() => {
        const fetchBookDetails = async () => {
            if (!bookId) {
                return;
            }
            const bookData = await getBooks([cover.book_id]);
            setBook(bookData[0]);
            console.log(`book data: ${JSON.stringify(bookData)}`);

            const progressData = await getBookProgress([cover.book_id]);
            setBookProgress(progressData[0]);
            console.log(`book progress: ${JSON.stringify(progressData)}`);
        }
        fetchBookDetails();
    }, [bookId, cover]);

    //
    //_______ changes to book data _______
    //

    // BookProgress.progress attribute
    const handleProgressChange = (newProgress) => {
        const now = new Date();
        const updatedProgress = { ...bookProgress, progress: newProgress };

        if (newProgress === 1 && bookProgress.progress === 0) {
            updatedProgress.started_dt = now;
        } else if (newProgress === 2) {
            if (bookProgress.progress === 0) {
                updatedProgress.started_dt = now;
            }
            updatedProgress.finished_dt = now;
        }

        setProgressUpdate(true);
        setBookProgress(updatedProgress);
    };

    // last read date time
    const handleLastReadUpdate = () => {
        const now = new Date();
        const updatedProgress = { ...bookProgress, last_read: now };
        setProgressUpdate(true);
        setBookProgress(updatedProgress);
    };

    const handleSave = async () => {
        if (progressUpdate || bookUpdate || coverUpdate) {
            // TODO save book data
            // TODO save cover data
            // TODO save progress data
            setProgressUpdate(false);
            setBookUpdate(false);
            setCoverUpdate(false);
            console.log(`Book ${JSON.stringify(book)}, progress ${JSON.stringify(bookProgress)}, cover ${JSON.stringify(cover)}`);
            console.log("Book data saved");
        }
    }

    const handleBookClick = () => {
        setSelectedBook(null);
        // TODO save automatically? Ask user?
    };

    if (!book || !bookProgress || !selectedBook) {
        return null;
    }

    return (
        <div className={styles.bookDetailsContainer}>
            <div className={styles.bookDetailsLeft}>
                <img
                    src={cover.cover_fname}
                    alt={`${book.title} cover`}
                    className={styles.bookCoverImage}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    onClick={handleBookClick}
                />
            </div>
            <div className={styles.bookDetailsRight}>
                <h2>{book?.title}</h2>
                <p><strong>Author:</strong> {book?.author}</p>
                <p><strong>ISBN:</strong> {book?.isbn}</p>
                <p><strong>Description:</strong> {book?.description}</p>
                <div className={styles.progressSection}>
                    <h3>Progress</h3>
                    <label>
                        <input
                            type="radio"
                            value="0"
                            checked={bookProgress?.progress === 0}
                            onChange={() => handleProgressChange(0)}
                        />
                        Not Started
                    </label>
                    <label>
                        <input
                            type="radio"
                            value="1"
                            checked={bookProgress?.progress === 1}
                            onChange={() => handleProgressChange(1)}
                        />
                        Started
                    </label>
                    <label>
                        <input
                            type="radio"
                            value="2"
                            checked={bookProgress?.progress === 2}
                            onChange={() => handleProgressChange(2)}
                        />
                        Finished
                    </label>
                </div>
                <div className={styles.lastReadSection}>
                    <button onClick={handleLastReadUpdate} className={styles.readTodayButton}>
                        I read this today!
                    </button>
                    <p><strong>Last Read:</strong> {bookProgress?.last_read_dt ? format(new Date(bookProgress?.last_read_dt), 'yyyy-MM-dd') : 'Never'}</p>
                </div>
                {(bookUpdate || progressUpdate || coverUpdate) && (
                    <button onClick={handleSave} className={styles.saveButton}>
                        Save
                    </button>
                )}
            </div>
        </div>
    );
};

export default BookDetails;