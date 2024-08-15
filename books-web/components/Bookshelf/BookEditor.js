import React, { useEffect, useState, useRef } from 'react';
import styles from '../../styles/BookEditor.module.css';
import { set } from 'date-fns';
import { uploadFile, downloadFile, deleteFile } from '../../utils/data_handler';

const BookEditor = ({
    book,
    cover,
    bookProgress,
    onSave,
    setIsEditing
}) => {
    const bookChangeRef = useRef({});
    const coverChangeRef = useRef({});
    const progressChangeRef = useRef({});
    const [coverImage, setCoverImage] = useState(null);
    const [spineImage, setSpineImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

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
            setUuid: (id) => {
                coverChangeRef.current = { ...coverChangeRef.current, cover_fname: id };
            },
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
            setUuid: (id) => {
                coverChangeRef.current = { ...coverChangeRef.current, spine_fname: id };
            },
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
        if (coverChangeRef.current.cover_fname) {
            deleteFile(coverChangeRef.current.cover_fname);
        }
        if (coverChangeRef.current.spine_fname) {
            deleteFile(coverChangeRef.current.spine_fname);
        }
        setIsEditing(false);
    };

    const handleSave = () => {
        // override the book, cover, and progress with the new values, if any
        const newBook = { ...book, ...bookChangeRef.current };
        const newCover = { ...cover, ...coverChangeRef.current };
        const newProgress = { ...bookProgress, ...progressChangeRef.current };
        console.log(`saving book: ${JSON.stringify(newBook)}`);
        console.log(`saving cover: ${JSON.stringify(newCover)}`);
        console.log(`saving progress: ${JSON.stringify(newProgress)}`);
        onSave({ book: newBook, cover: newCover, progress: newProgress });
    };

    return (
        <div className={styles.editorOverlay}>
            <div className={styles.bookDetailsLeft}>
                {(cover.cover_fname || coverChangeRef.current.cover_fname) ?
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
            <div className={styles.editorContainer}>
                <h2>{book ? 'Edit Book' : 'Add New Book'}</h2>
                <label>
                    Title:
                    <input
                        type="text"
                        value={
                            book?.title || ''
                        }
                        onChange={(e) =>
                            bookChangeRef.current = {
                                ...bookChangeRef.current,
                                title: e.target.value
                            }}
                        className={styles.inputField}
                    />
                </label>
                <label>
                    Author:
                    <input
                        type="text"
                        value={
                            book?.author || ''
                        }
                        onChange={(e) =>
                            bookChangeRef.current = {
                                ...bookChangeRef.current,
                                author: e.target.value
                            }}
                        className={styles.inputField}
                    />
                </label>
                <label>
                    Description:
                    <textarea
                        value={
                            book?.description || ''
                        }
                        onChange={(e) =>
                            bookChangeRef.current = {
                                ...bookChangeRef.current,
                                description: e.target.value
                            }}
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
                            cover?.book_height || ''
                        }
                        onChange={(e) => 
                            coverChangeRef.current = {
                                ...coverChangeRef.current,
                                book_height: e.target.value
                            }}
                        className={styles.inputField}
                    />
                </label>
                <label>
                    Book Width:
                    <input
                        type="number"
                        value={
                            cover?.book_width ||  ''
                        }
                        onChange={(e) =>
                            coverChangeRef.current = {
                                ...coverChangeRef.current,
                                book_width: e.target.value
                            }}
                        className={styles.inputField}
                    />
                </label>
                <label>
                    Spine Width:
                    <input
                        type="number"
                        value={
                            cover?.spine_width || ''
                        }
                        onChange={(e) =>
                            coverChangeRef.current = {
                                ...coverChangeRef.current,
                                spine_width: e.target.value
                            }}
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
    );
};

export default BookEditor;
