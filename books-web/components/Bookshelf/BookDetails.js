import React, { useEffect, useState } from 'react';
import { getBooks, getBookProgress } from '../../utils/api';
import { format, set } from 'date-fns';
import styles from '../../styles/BookDetails.module.css';

const BookDetails = ({ selectedBook, setSelectedBook, setIsEditing, onSave }) => {

    const [bookId, setBookId] = useState(null);
    const [cover, setCover] = useState(null);
    const [book, setBook] = useState(null);
    const [bookProgress, setBookProgress] = useState(null);
    // see if we need to update anything
    const [startedUpdate, setStartedUpdate] = useState(null);
    const [finishedUpdate, setFinishedUpdate] = useState(null);
    const [lastReadUpdate, setLastReadUpdate] = useState(null);
    const [progress, setProgress] = useState(false);
    // other updates are handled by the editor view

    // get information about the selected book
    useEffect(() => {
        if (!selectedBook) {
            return;
        }
        console.log(`selected book: ${JSON.stringify(selectedBook)}`);
        const bookId = () => {
            if (selectedBook.book) {
                return selectedBook.book.book_id;
            }
            if (selectedBook.cover) {
                return selectedBook.cover.book_id;
            }
            if (selectedBook.progress) {
                return selectedBook.progress.book_id;
            }
            console.error('No book id found');
            return null;
        };
        setBookId(bookId());
        if (selectedBook.book) {
            setBook(selectedBook.book);
        };
        if (selectedBook.progress) {
            setBookProgress(selectedBook.progress);
        };
        if (selectedBook.cover) {
            setCover(selectedBook?.cover);
        };
    }, [selectedBook]);

    // load additional information about the book
    useEffect(() => {
        const fetchBookDetails = async () => {
            if (!bookId) {
                return;
            }
            if (!book) {
                const bookData = await getBooks([cover.book_id]);
                setBook(bookData[0]);
            };
            console.log(`book data: ${JSON.stringify(bookData)}`);

            if (!bookProgress) {
                const progressData = await getBookProgress([cover.book_id]);
                setBookProgress(progressData[0]);
            };
            console.log(`book progress: ${JSON.stringify(progressData)}`);

            if (!cover) {
                const coverData = await getBookCovers([cover.book_id]);
                setCover(coverData[0]);
            };
            console.log(`cover data: ${JSON.stringify(coverData)}`);

        }
        fetchBookDetails();
    }, [bookId]);

    //
    //_______ changes to book data _______
    //

    // BookProgress.progress attribute
    const handleProgressChange = (newProgress) => {
        const now = new Date();

        if (newProgress === 1 && progress === 0) {
            setStartedUpdate(now);
        } else if (newProgress === 2) {
            if (progress === 0) {
                setStartedUpdate(now);
            }
            setFinishedUpdate(now);
        }
    };

    // last read date time
    const handleLastReadUpdate = () => {
        if (lastReadUpdate) {
            setLastReadUpdate(null);
        } else {
            const now = new Date();
            setLastReadUpdate(now);
        }
    };

    const onEdit = () => {
        onSave(null, bookProgress, null);
        setIsEditing(true);
    };

    if (!book || !bookProgress || !selectedBook) {
        return null;
    }

    return (
        <div className={styles.bookDetailsContainer}>
            {/* <div className={styles.bookDetailsLeft}>
                <img
                    src={cover.cover_fname}
                    alt={`${book.title} cover`}
                    className={styles.bookCoverImage}
                    onClick={handleBookClick}
                />
            </div> */}
            <div className={styles.bookDetailsRight}>
                <h2>{book?.title}</h2>
                <p><strong>Author:</strong> {book?.author}</p>
                <p><strong>ISBN:</strong> {book?.isbn}</p>
                <p><strong>Description:</strong> {book?.description}</p>
                <div className={styles.progressSection}>
                    <h3>Progress</h3>
                    {progress === 0 && (
                        <div>
                            <button
                                className={styles.startButton}
                                onClick={() => handleProgressChange(1)}
                            >
                                Start
                            </button>
                            <button
                                className={styles.finishButton}
                                onClick={() => handleProgressChange(2)}
                            >
                                Finished
                            </button>
                        </div>
                    )}
                    {progress === 1 && (
                        <button
                            className={styles.finishButton}
                            onClick={() => handleProgressChange(2)}
                        >
                            Finished
                        </button>
                    )}
                </div>
                <div className={styles.lastReadSection}>
                    <button
                        onClick={handleLastReadUpdate}
                        className={lastReadUpdate ? styles.notReadTodayButton : styles.readTodayButton}>
                        {lastReadUpdate ? 'I didn\'t read it!' : 'I read this today!'}
                    </button>
                    <p><strong>Last Read:</strong> {(lastReadUpdate ? lastReadUpdate : bookProgress.last_read_dt) ? format(new Date(bookProgress.last_read_dt), 'yyyy-MM-dd') : 'Never'}</p>
                </div>
                {(startedUpdate || finishedUpdate || progressUpdate ) && (
                    <button onClick={() => {
                        if (progressUpdate) setBookProgress({ ...bookProgress, progress: progress });
                        if (startedUpdate) setBookProgress({ ...bookProgress, started: startedUpdate });
                        if (finishedUpdate) setBookProgress({ ...bookProgress, finished: finishedUpdate });
                        onSave(null, bookProgress, null);
                    }} className={styles.saveButton}>
                        Save
                    </button>
                )}
                <button onClick={onEdit} className={styles.editButton}>
                    Edit
                </button>
            </div>
        </div>
    );
};

export default BookDetails;