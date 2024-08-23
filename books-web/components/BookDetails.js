import { useState, useEffect } from 'react';
import { downloadFile } from '../utils/api';
import { format, set } from 'date-fns';
import {
    getBook, getBookProgress,
    getBookProgressReads, checkBookProgressRead,
    setBook as setBookAPI, setCoverData as setCoverDataAPI,
    setBookProgress as setBookProgressAPI
} from '../utils/api';

import styles from '../styles/BookDetails.module.css';

const BookDetails = ({
    book_id,
    coverData,
    coverImageURL,
    isEditing, setIsEditing,
    isPlacing, setIsPlacing,
    isOrdering, setIsOrdering,
    coverDimensions
}) => {

    const [book, setBook] = useState(null);
    const [bookProgress, setBookProgress] = useState(null);
    const [bookProgressReads, setBookProgressReads] = useState(null);

    // handle book data
    const [title, setTitle] = useState(null);
    const [author, setAuthor] = useState(null);
    const [description, setDescription] = useState(null);

    // handle cover data
    const [coverImageFname, setCoverImageFname] = useState(null);
    const [spineImageFname, setSpineImageFname] = useState(null);

    // handle progress change
    const [startedUpdate, setStartedUpdate] = useState(null);
    const [finishedUpdate, setFinishedUpdate] = useState(null);
    const [lastReadUpdate, setLastReadUpdate] = useState(false);

    // when coverData is available, load book and progress data
    useEffect(() => {
        if (coverData?.book_id && !book && !bookProgress) {
            getBook(coverData.book_id, setBook);
            getBookProgress(coverData.book_id, setBookProgress);
            getBookProgressReads(coverData.book_id, setBookProgressReads);
        }
    }, [coverData]);

    // when coverData changes, see if fnames need to be updated
    useEffect(() => {
        if (coverData?.cover_fname && coverData.cover_fname !== coverImageFname) {
            setCoverImageFname(coverData.cover_fname);
        }
        if (coverData?.spine_fname && coverData.spine_fname !== spineImageFname) {
            setSpineImageFname(coverData.spine_fname);
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
        console.log(`Placing book ${book_id}`);
        setIsPlacing(book_id);
    };

    const onSave = async () => {
        let newBook = { ...book };
        if (title) newBook = { ...newBook, title };
        if (author) newBook = { ...newBook, author };
        if (description) newBook = { ...newBook, description };
        if (title || author || description) {
            setBook(newBook);
            setBookAPI(newBook);
        }
        let newCover = { ...coverData };
        // fnames are already set in coverData
        // These are not supported for now: {
        // if (book_height) newCover = { ...newCover, book_height };
        // if (book_width) newCover = { ...newCover, book_width };
        // if (spine_width) newCover = { ...newCover, spine_width };
        // }
        if (coverImageFname || spineImageFname) {
            setCoverDataAPI(newCover);
        }

        let newProgress = { ...bookProgress };
        if (startedUpdate) newProgress.started_dt = startedUpdate;
        if (finishedUpdate) newProgress.finished_dt = finishedUpdate;
        if (startedUpdate || finishedUpdate) {
            setBookProgress(newProgress);
            setBookProgressAPI(newProgress);
        }
        if (lastReadUpdate) {
            checkBookProgressRead(book.book_id);
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
        // close editor, if open
        setIsEditing(false);

        console.log(`saving book: ${JSON.stringify(newBook)}`);
        console.log(`saving cover: ${JSON.stringify(newCover)}`);
        console.log(`saving progress: ${JSON.stringify(newProgress)}`);
    }

    const onEdit = () => {
        setIsEditing(true);
    }

    if (!book || !bookProgress || !coverDimensions) {
        return null;
    }
    // Edit Book
    if (isEditing && !isPlacing && !isOrdering) {

        return (
            <div className={styles.bookDetailsContainer}
                style={{
                    top: coverDimensions.top,
                    left: coverDimensions.left + coverDimensions.width * 0.7,
                    width: Math.min(window.innerWidth - coverDimensions.left, coverDimensions.width * 2),
                    height: Math.min(window.innerHeight * 0.8, coverDimensions.height * 2),
                }}
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
                    {/* <label>
                        Cover Image:
                        <input
                            type="file"
                            onChange={handleCoverImageUpload}
                            className={styles.inputField}
                        />
                        {coverImageURL && <img src={coverImageURL} alt="Cover" className={styles.previewImage} />}
                    </label>
                    <label>
                        Spine Image:
                        <input
                            type="file"
                            onChange={handleSpineImageUpload}
                            className={styles.inputField}
                        />
                        {spineImageURL && <img src={spineImageURL} alt="Spine" className={styles.previewImage} />}
                    </label> */}
                    <button
                        onClick={onSave}
                        className={styles.saveButton}
                    >
                        Save
                    </button>
                    <button onClick={onClose} className={styles.cancelButton}>
                        Cancel
                    </button>
                </div>
            </div>
        );
    }
    // Place or Order Book
    else if (!isEditing && (isPlacing || isOrdering)) {
        return;
    }
    // Book Details
    else if (!isEditing && !isPlacing && !isOrdering) {
        return ( // Book Details
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
                        {(bookProgress.started_dt || startedUpdate) && <p><strong>Started:</strong> { format(
                            bookProgress.started_dt ? bookProgress.started_dt : startedUpdate, 'yyyy-MM-dd')
                        }</p>}
                        {(bookProgress.finished_dt || finishedUpdate) && <p><strong>Finished:</strong> { format(
                            bookProgress.finished_dt ? bookProgress.finished_dt : finishedUpdate, 'yyyy-MM-dd')
                        }</p>}
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
    }
};

export default BookDetails;
