import { useState, useEffect } from 'react';
import { downloadFile } from '../utils/api';
import { format, set } from 'date-fns';
import {
    getBook, getBookProgress,
    getBookProgressReads, checkBookProgressRead,
    setBook as setBookAPI, setBookCover as setCoverDataAPI,
    setBookProgress as setBookProgressAPI
} from '../utils/api';

import styles from '../styles/BookDetails.module.css';

const BookDetails = ({
    book_id,
    bookData,
    progressData,
    coverData,
    isEditing, setIsEditing,
    isPlacing, setIsPlacing,
    isOrdering, setIsOrdering,
    isAdding, setIsAdding
}) => {

    const [book, setBook] = useState(bookData);
    const [bookProgress, setBookProgress] = useState(progressData);
    const [bookProgressReads, setBookProgressReads] = useState(null);

    // handle book data
    const [title, setTitle] = useState(null);
    const [author, setAuthor] = useState(null);
    const [description, setDescription] = useState(null);

    // handle cover data
    const initialCoverImageFname = coverData?.cover_fname || null;
    const initialSpineImageFname = coverData?.spine_fname || null;
    const [coverImageFname, setCoverImageFname] = useState(null);
    const [spineImageFname, setSpineImageFname] = useState(null);

    // handle progress change
    const [startedUpdate, setStartedUpdate] = useState(null);
    const [finishedUpdate, setFinishedUpdate] = useState(null);
    const [lastReadUpdate, setLastReadUpdate] = useState(false);

    // when coverData is available, load book and progress data
    useEffect(() => {
        if (coverData?.book_id && !book && !bookProgress) {
            if (!book) getBook(coverData.book_id, setBook);
            if (!bookProgress) getBookProgress(coverData.book_id, setBookProgress);
            if (!bookProgressReads) getBookProgressReads(coverData.book_id, setBookProgressReads);
        }
    }, [coverData]);

    // when coverData changes, see if fnames need to be updated
    useEffect(() => {
        console.log(`coverData: ${JSON.stringify(coverData)}`);
        if (coverData?.cover_fname && coverData.cover_fname !== coverImageFname) {
            setCoverImageFname(coverData.cover_fname);
        }
        if (coverData?.spine_fname && coverData.spine_fname !== spineImageFname) {
            setSpineImageFname(coverData.spine_fname);
        }
    }, [coverData]);

    // log book progress reads
    useEffect(() => {
        if (startedUpdate) {
            setLastReadUpdate(true);
        }
    }, [startedUpdate]);

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

    const onEditCancel = () => {
        // clear updates
        setTitle(null);
        setAuthor(null);
        setDescription(null);
        setCoverImageFname(initialCoverImageFname);
        setSpineImageFname(initialSpineImageFname);
        setIsEditing(false);
    }

    const handlePlace = () => {
        console.log(`Placing book ${book_id}`);
        setIsPlacing(book_id);
    };

    const handleOrder = () => {
        console.log(`Ordering book ${book_id}`);
        setIsOrdering(true);
    };

    const onSave = async () => {
        let newBook = { ...book };
        if (title) newBook = { ...newBook, title };
        if (author) newBook = { ...newBook, author };
        if (description) newBook = { ...newBook, description };
        if (isAdding || title || author || description) {
            setBook(newBook);
            setBookAPI(newBook);
            console.log(`saving book: ${JSON.stringify(newBook)}`);
        }
        let newCover = { ...coverData };
        // fnames are already set in coverData
        // These are not supported for now: {
        // if (book_height) newCover = { ...newCover, book_height };
        // if (book_width) newCover = { ...newCover, book_width };
        // if (spine_width) newCover = { ...newCover, spine_width };
        // }
        if (isAdding || coverImageFname || spineImageFname) {
            setCoverDataAPI(newCover);
            console.log(`saving cover: ${JSON.stringify(newCover)}`);
        }

        let newProgress = { ...bookProgress };
        if (startedUpdate) newProgress.started_dt = startedUpdate;
        if (finishedUpdate) newProgress.finished_dt = finishedUpdate;
        if (isAdding || startedUpdate || finishedUpdate) {
            setBookProgress(newProgress);
            setBookProgressAPI(newProgress);
            console.log(`saving progress: ${JSON.stringify(newProgress)}`);
        }
        if (lastReadUpdate) {
            checkBookProgressRead(book_id).then(() => {
                getBookProgressReads(book_id, setBookProgressReads);
            });
            console.log(`saving lastReadUpdate`);
        }
        // clean updates
        // bookData
        setTitle(null);
        setAuthor(null);
        setDescription(null);
        // coverData
        setCoverImageFname(null);
        setSpineImageFname(null);
        // progressData
        setStartedUpdate(null);
        setFinishedUpdate(null);
        setLastReadUpdate(false);
        // set isAdding to DONE if relevant
        if (isAdding) setIsAdding('DONE');
        // close editor, if open
        setIsEditing(false);
    }

    const onEdit = () => {
        setIsEditing(true);
    }

    if (!book || !bookProgress) {
        return null;
    }

    const containerStyle = {
        top: '10px',
        left: '30vw',
        width: '70vw',
        height: '80vh',

    };

    // Edit Book
    if (isEditing && !isPlacing && !isOrdering) {

        return (
            <div className={styles.bookDetailsContainer}
                style={containerStyle}
            >
                <div className={styles.bookDetails}>
                    <h2>Edit Book</h2>
                    <label>
                        Title:
                        <input
                            type="text"
                            value={
                                title || book?.title || ''
                            }
                            onChange={(e) => setTitle(e.target.value)}
                            className={styles.inputField}
                        />
                    </label>
                    <label>
                        Author:
                        <input
                            type="text"
                            value={
                                author || book?.author || ''
                            }
                            onChange={(e) => setAuthor(e.target.value)}
                            className={styles.inputField}
                        />
                    </label>
                    <label>
                        Description:
                        <textarea
                            value={
                                description || book?.description || ''
                            }
                            onChange={(e) => setDescription(e.target.value)}
                            className={styles.textArea}
                        />
                    </label>
                    <button
                        onClick={onSave}
                        className={styles.saveButton}
                    >
                        Save
                    </button>
                    <button onClick={onEditCancel} className={styles.cancelButton}>
                        Cancel
                    </button>
                </div>
            </div>
        );
    }
    // Place or Order Book
    else if (isPlacing || isOrdering) {
        return;
    }
    // Book Details
    else if (!isEditing && !isPlacing && !isOrdering) {
        if (bookProgressReads && bookProgressReads.reads.length > 0) {
            var isLastReadToday = new Date(bookProgressReads.reads[bookProgressReads.reads.length - 1]).getDate() == new Date().getDate()
        }
        return ( // Book Details
            <div className={styles.bookDetailsContainer}
                style={containerStyle}
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
                        <p><strong>Last Read:</strong> {
                            (bookProgressReads && bookProgressReads.reads.length > 0) ?
                                format(bookProgressReads.reads[bookProgressReads.reads.length - 1], 'yyyy-MM-dd') :
                                lastReadUpdate ? format(new Date(), 'yyyy-MM-dd') : 'Never'}</p>
                        {(bookProgress.started_dt || startedUpdate) && <p><strong>Started:</strong> { format(
                            bookProgress.started_dt ? bookProgress.started_dt : startedUpdate, 'yyyy-MM-dd')
                        }</p>}
                        {(bookProgress.finished_dt || finishedUpdate) && <p><strong>Finished:</strong> { format(
                            bookProgress.finished_dt ? bookProgress.finished_dt : finishedUpdate, 'yyyy-MM-dd')
                        }</p>}
                        <button
                            onClick={handleLastReadUpdate}
                            className={(lastReadUpdate || isLastReadToday) ? styles.notReadTodayButton : styles.readTodayButton}>
                            {(lastReadUpdate || isLastReadToday) ?
                                'I didn\'t read it today!' : 'I read this today!'}
                        </button>
                    </div>
                    {(startedUpdate || finishedUpdate || (lastReadUpdate && !isLastReadToday)) && (
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
                    <button onClick={handleOrder} className={styles.editButton}>
                        Move Book
                    </button>
                </div>
            </div>
        );
    }
};

export default BookDetails;
