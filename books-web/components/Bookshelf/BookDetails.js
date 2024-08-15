import React, { useEffect, useState } from 'react';
import { getBooks, getBookProgress } from '../../utils/api';
import BookEditor from './BookEditor';
import { format, set } from 'date-fns';
import styles from '../../styles/BookDetails.module.css';

const BookDetails = ({ selectedBook, setSelectedBook, isEditing, setIsEditing, onSave }) => {

    const [bookId, setBookId] = useState(null);
    const [cover, setCover] = useState(null);
    const [book, setBook] = useState(null);
    const [bookProgress, setBookProgress] = useState(null);
    // in Details mode, see if we need to update anything
    const [startedUpdate, setStartedUpdate] = useState(null);
    const [finishedUpdate, setFinishedUpdate] = useState(null);
    const [lastReadUpdate, setLastReadUpdate] = useState(null);
    // other updates are handled directly in the three structures' state

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
                console.log(`book data: ${JSON.stringify(bookData)}`);
            };

            if (!bookProgress) {
                const progressData = await getBookProgress([cover.book_id]);
                setBookProgress(progressData[0]);
                console.log(`book progress: ${JSON.stringify(progressData)}`);
            };

            if (!cover) {
                const coverData = await getBookCovers([cover.book_id]);
                setCover(coverData[0]);
                console.log(`cover data: ${JSON.stringify(coverData)}`);
            };

        }
        fetchBookDetails();
    }, [bookId]);

    useEffect(() => {
        if (bookProgress) {
            console.log(`book progress: ${JSON.stringify(bookProgress)}`);
        }
        console.log(`progress before save: ${JSON.stringify(bookProgress)}`);
        console.log(`started update: ${JSON.stringify(startedUpdate)}`);
        console.log(`finished update: ${JSON.stringify(finishedUpdate)}`);
        onSave({ book: null, cover: null, progress: bookProgress });
    }
    , [bookProgress]);
    //
    //_______ changes to book data _______
    //

    // BookProgress.progress attribute
    const handleProgressChange = async (newProgress) => {
        const now = new Date();
        if (newProgress === 1 && !bookProgress.started_dt) {
            setStartedUpdate(now);
        } else if (newProgress === 2 && !bookProgress.finished_dt) {
            if (!bookProgress.started_dt) {
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
        if (lastReadUpdate) {
            setBookProgress({ ...bookProgress, last_read_dt: lastReadUpdate });
        }
        setIsEditing(true);
    };

    const handleBookClick = () => {
        if (lastReadUpdate) {setBookProgress({ ...bookProgress, last_read_dt: lastReadUpdate });}
        setSelectedBook(null);
    };

    if (!book || !bookProgress || !selectedBook) {
        return null;
    }

    if (isEditing) {
        return (
            <BookEditor
                book={book}
                cover={cover}
                bookProgress={bookProgress}
                onSave={onSave}
                setIsEditing={setIsEditing}
            />
        );
    } else {
        return (
            <div className={styles.bookDetailsContainer}>
            <div className={styles.bookDetailsLeft}>
                <img
                    src={cover.cover_fname}
                    alt={`${book.title} cover`}
                    className={styles.bookCoverImage}
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
                    {((!bookProgress.started_dt && !startedUpdate)
                        && (!bookProgress.finished_dt && !finishedUpdate)) && (
                            <div>
                            <button
                                className={styles.startButton}
                                onClick={async () => await handleProgressChange(1)}
                                >
                                Start
                            </button>
                            <button
                                className={styles.finishButton}
                                onClick={async () => await handleProgressChange(2)}
                                >
                                Finished
                            </button>
                        </div>
                    )}
                    {((bookProgress.started_dt || startedUpdate)
                        && (!bookProgress.finished_dt && !finishedUpdate)) && (
                        <button
                        className={styles.finishButton}
                        onClick={async () => await handleProgressChange(2)}
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
                    <p><strong>Last Read:</strong> {lastReadUpdate ? format(lastReadUpdate, 'yyyy-MM-dd') : 'Never'}</p>
                </div>
                {(startedUpdate || finishedUpdate ) && (
                    <button onClick={() => {
                        if (startedUpdate) setBookProgress({ ...bookProgress, started_dt: startedUpdate });
                        if (finishedUpdate) setBookProgress({ ...bookProgress, finished_dt: finishedUpdate });
                        if (lastReadUpdate) setBookProgress({ ...bookProgress, last_read_dt: lastReadUpdate });
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
    }
};

export default BookDetails;