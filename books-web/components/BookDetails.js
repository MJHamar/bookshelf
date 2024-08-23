import { useState, useEffect } from 'react';
import { downloadFile } from '../utils/api';
import { format } from 'date-fns';
import {
    getBook, getBookProgress, setBookProgress,
    getBookProgressReads, checkBookProgressRead
} from '../utils/api';

import styles from '../styles/BookDetails.module.css';

const BookDetails = ({
    book_id,
    coverData,
    coverImageURL,
    setIsEditing, setIsPlacing,
    coverDimensions
}) => {

    const [book, setBook] = useState(null);
    const [bookProgress, setBookProgress] = useState(null);
    const [bookProgressReads, setBookProgressReads] = useState(null);

    // handle progress change
    const [startedUpdate, setStartedUpdate] = useState(null);
    const [finishedUpdate, setFinishedUpdate] = useState(null);
    const [lastReadUpdate, setLastReadUpdate] = useState(false);

    useEffect(() => {
        if (coverData?.book_id && !book && !bookProgress) {
            getBook(coverData.book_id, setBook);
            getBookProgress(coverData.book_id, setBookProgress);
            getBookProgressReads(coverData.book_id, setBookProgressReads);
        }
    }, [coverData]);

    const handleProgressChange = async (status) => {
        let now = new Date();
        if (status === 1) {
            setStartedUpdate(now);
        } else if (status === 2) {
            if (!bookProgress.started_dt && !startedUpdate) {
                setStartedUpdate(now);
            }
            setFinishedUpdate(now);
        }
    }

    const handleLastReadUpdate = () => {
        setLastReadUpdate(!lastReadUpdate);
    }

    const onClose = () => {
        // clear data
        setBook(null);
        setBookProgress(null);
        setBookProgressReads(null);
    }

    const handlePlace = () => {
        let book_id = coverData?.book_id || selectedBookView.book?.book_id;
        console.log(`Placing book ${book_id}`);
        setIsPlacing(book_id);
    };

    const onSave = async () => {
        let newProgress = { ...bookProgress };
        if (startedUpdate) newProgress.started_dt = startedUpdate;
        if (finishedUpdate) newProgress.finished_dt = finishedUpdate;
        if (startedUpdate || finishedUpdate) {
            setBookProgress(newProgress);
        }
        if (lastReadUpdate) {
            checkBookProgressRead(book.book_id);
        }
        // clean updates
        setStartedUpdate(null);
        setFinishedUpdate(null);
        setLastReadUpdate(false);
    }

    const onEdit = () => {
        setIsEditing(coverData.book_id);
    }

    if (!book || !bookProgress || !coverDimensions) {
        return null;
    }

    return (
        <div className={styles.bookDetailsContainer}
            style={{
                top: coverDimensions.top,
                left: coverDimensions.left + coverDimensions.width*0.7,
                width: Math.min(window.innerWidth - coverDimensions.left, coverDimensions.width * 2),
                height: Math.min(window.innerHeight * 0.8, coverDimensions.height * 2),
            }}
        >
            <div className={styles.bookDetails}>
                <h2>{book?.title}</h2>
                <p><strong>Author:</strong> {book?.author}</p>
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
                    <p><strong>Last Read:</strong> {bookProgressReads.reads.length > 0 ? format(bookProgressReads.reads[bookProgressReads.reads.length - 1], 'yyyy-MM-dd') :
                        lastReadUpdate ? format(new Date(), 'yyyy-MM-dd') : 'Never'}</p>
                </div>
                {(startedUpdate || finishedUpdate || lastReadUpdate) && (
                    <button onClick={onSave} className={styles.saveButton}>
                        Save
                    </button>
                )}
                <button onClick={onEdit} className={styles.editButton}>
                    Edit
                </button>
                <button onClick={handlePlace} className={styles.editButton}>
                    Select Shelf
                </button>
            </div>
        </div>
    );
};

export default BookDetails;
