import React, { useEffect, useState, useRef } from 'react';
import styles from '../../styles/BookEditor.module.css';
import { set } from 'date-fns';
import { uploadFile, downloadFile, deleteFile } from '../../utils/data_handler';

const BookEditor = ({
    book,
    setBook,
    cover,
    setCover,
    bookProgress,
    setBookProgress,
    onSave,
    setIsEditing
}) => {
    const [title, setTitle] = useState(null);
    const [author, setAuthor] = useState(null);
    const [description, setDescription] = useState(null);
    const [book_height, setBookHeight] = useState(null);
    const [book_width, setBookWidth] = useState(null);
    const [spine_width, setSpineWidth] = useState(null);

    const [coverImage, setCoverImage] = useState(null);
    const [spineImage, setSpineImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const [coverImageFname, setCoverImageFname] = useState(null);
    const [spineImageFname, setSpineImageFname] = useState(null);
    const [coverImageURL, setCoverImageURL] = useState(null);
    const [spineImageURL, setSpineImageURL] = useState(null);

    useEffect(() => {
        if (cover?.cover_fname) {
            downloadFile({
                uuid: cover.cover_fname,
                setFileData: setCoverImageURL
            });
        }
        if (cover?.spine_fname) {
            downloadFile({
                uuid: cover.spine_fname,
                setFileData: setSpineImageURL
            });
        }
    }, [cover]);

    useEffect(() => { // upload cover image to the server and get the file id
        console.log(`coverImage: ${coverImage}`);
        if (!coverImage) {
            return;
        }
        uploadFile({
            file: coverImage,
            setUuid: setCoverImageFname,
            setUploading: setIsUploading
        });
        setCoverImageURL(URL.createObjectURL(coverImage));

    }, [coverImage]);

    useEffect(() => { // upload spine image to the server and get the file id
        console.log(`spineImage: ${spineImage}`);
        if (!spineImage) {
            return;
        }
        uploadFile({
            file: spineImage,
            setUuid: setSpineImageFname,
            setUploading: setIsUploading
        });
        setSpineImageURL(URL.createObjectURL(spineImage));

    }, [spineImage]);

    const handleCoverImageUpload = (e) => {
        console.log('handling cover image upload');
        const file = e.target.files[0];
        setCoverImage(file);
    };

    const handleSpineImageUpload = (e) => {
        console.log('handling spine image upload');
        const file = e.target.files[0];
        setSpineImage(file);
    };

    const onClose = () => {
        if (coverImageFname) {
            deleteFile(coverImageFname);
        }
        if (spineImageFname) {
            deleteFile(spineImageFname);
        }
        setIsEditing(false);
    };

    const handleSave = () => {
        // override the book, cover, and progress with the new values, if any
        let newBook = { ...book };
        if (title) newBook = { ...newBook, title };
        if (author) newBook = { ...newBook, author };
        if (description) newBook = { ...newBook, description };
        let newCover = { ...cover };
        if (coverImageFname) newCover = { ...newCover, cover_fname: coverImageFname };
        if (spineImageFname) newCover = { ...newCover, spine_fname: spineImageFname };
        if (book_height) newCover = { ...newCover, book_height };
        if (book_width) newCover = { ...newCover, book_width };
        if (spine_width) newCover = { ...newCover, spine_width };
        let newProgress = { ...bookProgress };
        // nothing can change here for now
        console.log(`saving book: ${JSON.stringify(newBook)}`);
        console.log(`saving cover: ${JSON.stringify(newCover)}`);
        console.log(`saving progress: ${JSON.stringify(newProgress)}`);
        setBook(newBook);
        setCover(newCover);
        setBookProgress(newProgress);
        onSave({ book: newBook, cover: newCover, progress: newProgress });
    };

    return (
        <>
            <div className={styles.bookDetailsLeft}>
                    {(coverImageURL) ?
                        <img
                        src={coverImageURL}
                        alt={`${book.title} cover`}
                        className={styles.bookCoverImage}
                    /> : <div alt={`${book.title} cover`}
                            className={styles.bookCoverImage}
                        ><svg>
                            <rect
                                height={cover.book_height}
                                width={cover.book_width}
                                color="lightblue" />
                        </svg></div>
                    }
                </div>
            <div className={styles.editorOverlay}>
                <div className={styles.editorContainer}>
                    <h2>{book ? 'Edit Book' : 'Add New Book'}</h2>
                    <label>
                        Title:
                        <input
                            type="text"
                            value={
                                title || book?.title || ''
                            }
                            onChange={(e) => setTitle(e.target.value) }
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
                    <label>
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
                    </label>
                    <label>
                        Book Height:
                        <input
                            type="number"
                            value={
                                book_height || cover?.book_height || 200
                            }
                            onChange={(e) => setBookHeight(e.target.value)}
                            className={styles.inputField}
                        />
                    </label>
                    <label>
                        Book Width:
                        <input
                            type="number"
                            value={
                                book_width || cover?.book_width ||  150
                            }
                            onChange={(e) => setBookWidth(e.target.value)}
                            className={styles.inputField}
                        />
                    </label>
                    <label>
                        Spine Width:
                        <input
                            type="number"
                            value={
                                spine_width || cover?.spine_width || 50
                            }
                            onChange={(e) => setSpineWidth(e.target.value)}
                            className={styles.inputField}
                        />
                    </label>
                    <div className={styles.buttonContainer}>
                        <button
                            onClick={handleSave}
                            className={styles.saveButton}
                            active={coverImage && spineImage}
                        >
                            Save
                        </button>
                        <button onClick={onClose} className={styles.cancelButton}>
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BookEditor;
