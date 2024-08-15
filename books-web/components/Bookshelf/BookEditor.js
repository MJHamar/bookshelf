import React, { useState } from 'react';
import styles from '../../styles/BookEditor.module.css';
import { set } from 'date-fns';

const BookEditor = ({
    book,
    cover,
    bookProgress,
    onSave,
    setIsEditing
}) => {
    const [title, setTitle] = useState(book?.title || '');
    const [author, setAuthor] = useState(book?.author || '');
    const [isbn, setIsbn] = useState(book?.isbn || '');
    const [description, setDescription] = useState(book?.description || '');
    const [bookHeight, setBookHeight] = useState(cover?.book_height || '');
    const [bookWidth, setBookWidth] = useState(cover?.book_width || '');
    const [spineWidth, setSpineWidth] = useState(cover?.spine_width || '');
    const [coverImage, setCoverImage] = useState(null);
    const [spineImage, setSpineImage] = useState(null);

    const handleCoverImageUpload = (e) => {
        const file = e.target.files[0];
        const newCoverImage = `/public/${file.name}`;
        setCoverImage(newCoverImage);
        // Here you'd handle uploading the file to the public folder
        let reader = new FileReader();
        reader.onload = (e) => {
            setSpineImage(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    const handleSpineImageUpload = (e) => {
        const file = e.target.files[0];
        const newSpineImage = `/public/${file.name}`;
        setSpineImage(newSpineImage);
        // Here you'd handle uploading the file to the public folder
        let reader = new FileReader();
        reader.onload = (e) => {
            setSpineImage(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    const onClose = () => {
        setIsEditing(false);
    }

    return (
        <div className={styles.editorOverlay}>
            <div className={styles.bookDetailsLeft}>
                {(cover.cover_fname) ? <img
                    src={cover.cover_fname}
                    alt={`${book.title} cover`}
                    className={styles.bookCoverImage}
                /> : <svg>
                        <rect
                            height={cover.book_height}
                            width={cover.book_width}
                            color="lightblue" />
                    </svg>
                }
            </div>
            <div className={styles.editorContainer}>
                <h2>{book ? 'Edit Book' : 'Add New Book'}</h2>
                <label>
                    Title:
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={styles.inputField}
                    />
                </label>
                <label>
                    Author:
                    <input
                        type="text"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        className={styles.inputField}
                    />
                </label>
                <label>
                    ISBN:
                    <input
                        type="text"
                        value={isbn}
                        onChange={(e) => setIsbn(e.target.value)}
                        className={styles.inputField}
                    />
                </label>
                <label>
                    Description:
                    <textarea
                        value={description}
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
                    {coverImage && <img src={coverImage} alt="Cover" className={styles.previewImage} />}
                </label>
                <label>
                    Spine Image:
                    <input
                        type="file"
                        onChange={handleSpineImageUpload}
                        className={styles.inputField}
                    />
                    {spineImage && <img src={spineImage} alt="Spine" className={styles.previewImage} />}
                </label>
                <label>
                    Book Height:
                    <input
                        type="number"
                        value={bookHeight}
                        onChange={(e) => setBookHeight(e.target.value)}
                        className={styles.inputField}
                    />
                </label>
                <label>
                    Book Width:
                    <input
                        type="number"
                        value={bookWidth}
                        onChange={(e) => setBookWidth(e.target.value)}
                        className={styles.inputField}
                    />
                </label>
                <label>
                    Spine Width:
                    <input
                        type="number"
                        value={spineWidth}
                        onChange={(e) => setSpineWidth(e.target.value)}
                        className={styles.inputField}
                    />
                </label>
                <div className={styles.buttonContainer}>
                    <button onClick={() => onSave({
                        book: {
                            title, author, isbn, description
                        },
                        cover: {
                            coverImage, spineImage, bookHeight, bookWidth, spineWidth
                        },
                        progress: bookProgress
                    })} className={styles.saveButton}>
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
