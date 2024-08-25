import { useState, useEffect, useRef } from "react";
import { DEF_COVER_ID, DEF_SPINE_ID } from "../utils/api";
import { downloadFile, uploadFile } from "../utils/api";
import { set } from "date-fns";


const Book = ({
    compCoverWidth,
    compSpineWidth,
    initialCoverData,
    spineX,
    selectedBookView, setSelectedBookView,
    isEditing, setIsEditing,
    isOrdering
}) => {
    const [coverData, setCoverData] = useState(selectedBookView?.coverData || initialCoverData);
    const [coverImage, setCoverImage] = useState(null);
    const [spineImage, setSpineImage] = useState(null);
    const [coverImageURL, setCoverImageURL] = useState(null);
    const [spineImageURL, setSpineImageURL] = useState(null);
    const [rotation, setRotation] = useState(0); // 0: spine, 45: peek-cover, 90: full-cover
    const [isHovered, setIsHovered] = useState(false);
    const [isClicked, setIsClicked] = useState(false);

    const spineRef = useRef(null); // Reference to the spine div
    const coverRef = useRef(null); // Reference to the cover div
    const [spineWidth, setSpineWidth] = useState(compSpineWidth); // State to store the width of the spine


    // reset cover data when the book is unselected
    useEffect(() => {
        if (!initialCoverData) {
            return;
        }
        setCoverData(initialCoverData);
    }, [initialCoverData]);

    // download cover and spine images
    useEffect(() => {
        if (coverData?.cover_fname) {
            downloadFile({
                uuid: coverData.cover_fname,
                setFileData: setCoverImageURL
            });
        } else {
            downloadFile({
                uuid: DEF_COVER_ID,
                setFileData: setCoverImageURL
            });
        }
        if (coverData?.spine_fname) {
            downloadFile({
                uuid: coverData.spine_fname,
                setFileData: setSpineImageURL
            });
        } else {
            downloadFile({
                uuid: DEF_SPINE_ID,
                setFileData: setSpineImageURL
            });
        }
    }, [coverData]);

    // check if the selected book is the current book
    useEffect(() => {
        if (selectedBookView && coverData && selectedBookView.book_id && selectedBookView.book_id === coverData.book_id) {
            setIsClicked(true);
            setRotation(80);
        } else {
            setIsClicked(false);
            setRotation(0);
        }
    }, [coverData]);

    // Effect to calculate and update the spine width
    useEffect(() => {
        if (spineRef.current) {
            setSpineWidth(spineRef.current.offsetWidth);
        }
    }, [spineImageURL, isHovered, isClicked]);

    // fill selected book view if clicked
    useEffect(() => {
        if (!isClicked || !spineRef.current || !coverRef.current) {
            return;
        }
        let coverDimensions = {
            top: spineRef.current.offsetTop,
            left: spineRef.current.offsetLeft,
            width: spineRef.current.offsetWidth + coverRef.current.offsetWidth,
            height: coverRef.current.offsetHeight
        };
        setSelectedBookView({
            book_id: coverData.book_id,
            coverData: coverData,
            coverImageURL: coverImageURL,
            spineImageURL: spineImageURL,
            coverDimensions: coverDimensions
        });
    }, [isClicked, spineRef, coverRef, isEditing]);

    // "click" the book if selected
    useEffect(() => {
        if (selectedBookView && coverData && selectedBookView.book_id === coverData.book_id) {
            setIsClicked(true);
            setRotation(80);
        } else {
            setIsClicked(false);
            setRotation(0);
        }
    }, [selectedBookView]);

    // "unclick" the book if ordering
    useEffect(() => {
        if (selectedBookView && coverData && selectedBookView.book_id === coverData.book_id) {
            if (isOrdering) {
                setIsClicked(false);
                setRotation(0);
            } else if (!isOrdering) {
                setIsClicked(true);
                setRotation(80);
            }
        }
    }, [isOrdering]);

    useEffect(() => { // upload spine image to the server and get the file id
        console.log(`spineImage: ${spineImage}`);
        if (!spineImage) {
            return;
        }
        uploadFile({
            file: spineImage,
            setUuid: (fname) => setCoverData({ ...coverData, spine_fname: fname })
        });
        setSpineImageURL(URL.createObjectURL(spineImage));

    }, [spineImage]);

    useEffect(() => { // upload cover image to the server and get the file id
        console.log(`coverImage: ${coverImage}`);
        if (!coverImage) {
            return;
        }
        uploadFile({
            file: coverImage,
            setUuid: (fname) => setCoverData({ ...coverData, cover_fname: fname })
        });
        setCoverImageURL(URL.createObjectURL(coverImage));
    }, [coverImage]);

    // when book is selected and cover data changes, reflect this in the selected book view
    useEffect(() => {
        if (selectedBookView && coverData && selectedBookView.book_id === coverData.book_id) {
            setSelectedBookView({
                ...selectedBookView,
                coverData: coverData,
            });
        };
    }, [coverData]);

    // when editing, set rotation to 90
    useEffect(() => {
        if (isEditing) {
            setRotation(90);
            setIsClicked(true);
        }
    }, [isEditing]);

    if (!coverData || !coverImageURL || !spineImageURL) {
        return null;
    }


    const handleMouseEnter = () => {
        if (!isOrdering && !isClicked) {
            setRotation(45); // Peek-cover view
            setIsHovered(true);
        }
    };

    const handleMouseLeave = () => {
        if (!isOrdering && !isClicked) {
            setRotation(0); // Back to spine view
            setIsHovered(false);
        }
    };

    const handleClick = () => {
        if (isEditing || isOrdering) {
            return;
        }
        if (isClicked) {
            isHovered ? setRotation(45) : setRotation(0); // Back to spine view
            setIsEditing(false);
            setSelectedBookView(null);
            setIsClicked(false);
        } else {
            setRotation(80); // Full-cover view
            setIsClicked(true);
        }
    };


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

    // let translateX = 0;
    // if (isClicked) {
    //     translateX = 0;
    // } else if (isHovered) {
    //     translateX = -coverData.spine_width/2;
    // }

    if (!coverData || !coverImageURL || !spineImageURL) {
        return null;
    }

    const bringToFront = isClicked

    return (
        <div /** Book with all rotations */
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            cursor='pointer'
            style={{
                position: bringToFront ? 'fixed' : 'absolute',
                height: bringToFront ? '50%' : '100%',
                left: bringToFront ? '10px' : spineX,
                top: bringToFront ? '10px' : 0,
                alignItems: 'left',
                zIndex: isHovered ? 110 : 100,
                perspective: '10000px',
                transformOrigin: "right",
                transformStyle: 'preserve-3d',
                // currentLeft + translateX = 10 ==> translateX = 10 - currentLeft
                transform: `translate3d(${isEditing && selectedBookView.book_id == coverData.book_id ? compSpineWidth : 0}px,
                                        0px,
                                        ${isHovered ? '150px' : '0px'}) rotateY(-${rotation}deg) rotateZ(0deg) skew(0deg, 0deg)`,
                transition: "all 500ms ease",
                willChange: "auto",
                overflow: 'visible',  // Allow content to overflow the bounds
            }}
        >
            <div
                ref={spineRef}
                style={{
                    position: "absolute",
                    alignItems: "flex-start",
                    left: 0,
                    justifyContent: "center",
                    height: '100%',
                    width: 'auto',
                    flexShrink: 1,

                    transformOrigin: "right",
                    transform: isEditing ? 'rotateY(80deg)' : `rotateY(0deg)`,
                    transition: "all 500ms ease",
                    transformStyle: "preserve-3d",
                    willChange: "auto"
                }}>
                {isEditing && <input
                    type='file'
                    onChange={handleSpineImageUpload}
                    style={{
                        cursor: 'pointer',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        height: '100%',
                        width: 'auto',
                        opacity: 0,
                        
                    }}
                />}
                <img
                    src={spineImageURL}
                    alt={`spine`}
                    style={{
                        height: '100%',
                        width: 'auto',
                        objectFit: 'cover',
                    }}
                />
            </div>
            <div
                ref={coverRef}
                style={{
                    position: "absolute",
                    alignItems: "flex-start",
                    left: spineWidth,
                    justifyContent: "center",
                    height: "100%",
                    width: 'auto',
                    flexShrink: 0,
                    transformOrigin: "left",
                    transform: `rotateY(90deg)`,
                    transition: "all 500ms ease",
                    transformStyle: "preserve-3d",
                    willChange: "auto",
                    objectFit: 'cover',
                }}>
                {isEditing && <input
                    type='file'
                    onChange={handleCoverImageUpload}
                        style={{
                        cursor: 'pointer',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        height: '100%',
                        width: 'auto',
                        opacity: 0,
                        
                    }}
                />}
                <img
                    src={coverImageURL}
                    alt={`cover`}
                    style={{
                        height: '100%',
                        width: 'auto',
                        objectFit: 'cover',
                    }}
                />
            </div>
        </div>
    );
};

export default Book;
