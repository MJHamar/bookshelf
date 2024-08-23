import { useState, useEffect, useRef } from "react";
import { downloadFile, DEF_COVER_ID, DEF_SPINE_ID } from "../utils/api";


const Book = ({
    initialCoverData,
    spineX,
    selectedBookView, setSelectedBookView
}) => {
    const [coverData, setCoverData] = useState(null);
    const [coverImageURL, setCoverImageURL] = useState(null);
    const [spineImageURL, setSpineImageURL] = useState(null);
    const [rotation, setRotation] = useState(0); // 0: spine, 45: peek-cover, 90: full-cover
    const [isHovered, setIsHovered] = useState(false);
    const [isClicked, setIsClicked] = useState(false);

    const spineRef = useRef(null); // Reference to the spine div
    const coverRef = useRef(null); // Reference to the cover div
    const [spineWidth, setSpineWidth] = useState(0); // State to store the width of the spine


    useEffect(() => {
        setCoverData(initialCoverData);
    }, []);

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
    
    if (!coverData || !coverImageURL || !spineImageURL) {
        return null;
    }

    const handleMouseEnter = () => {
        if (!isClicked) {
            setRotation(45); // Peek-cover view
            setIsHovered(true);
        }
    };

    const handleMouseLeave = () => {
        if (!isClicked) {
            setRotation(0); // Back to spine view
            setIsHovered(false);
        }
    };

    const handleClick = () => {
        if (isClicked) {
            isHovered ? setRotation(45) : setRotation(0); // Back to spine view
            setSelectedBookView(null);
            setIsClicked(false);
        } else {
            setRotation(80); // Full-cover view
            setIsClicked(true);
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
            })
        }
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

    return (
        <div /** Placeholer */
            style={{
                height: '100%',
                width: coverData.spine_width,
                left: spineX, // TODO: see if it works without this
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'left',
                overflow: 'visible',
                outline: '1px solid red',
            }}
        >
            <div /** hitbox */
                style={{
                    cursor: 'pointer',
                    height: '100%',
                    width: coverData.spine_width,
                    display: 'flex',
                    zIndex: 150,
                    // debug, comment/remove later
                    position: 'absolute',
                    backgroundColor: 'rgba(124, 0, 124, 0.5)',
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
            />
            <div /** Book with all rotations */
                style={{
                    height: '100%',
                    position: 'relative',
                    width: 'fit-content',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'left',
                    zIndex: 100,
                    perspective: '1000px',
                    transformOrigin: "right",
                    transformStyle: 'preserve-3d',
                    transform: `translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(-${rotation}deg) rotateZ(0deg) skew(0deg, 0deg)`,
                    transition: "all 500ms ease",
                    willChange: "auto",
                    overflow: 'visible',  // Allow content to overflow the bounds
                    dropShadow: '0 0 10px rgba(0,0,0,0.5)',
                    outline: '1px solid blue',
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
                        width: coverData.spine_width,
                        flexShrink: 1,
                        zIndex: 110,
                        transformOrigin: "right",
                        transform: `rotateY(0deg)`,
                        transition: "all 500ms ease",
                        transformStyle: "preserve-3d",
                        willChange: "auto"
                }}>
                    <img
                        src={spineImageURL}
                        alt={`spine`}
                        style={{
                            height: '100%',
                            width: coverData.spine_width,
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
                        width: coverData.cover_width,
                        flexShrink: 0,
                        zIndex: 120,
                        transformOrigin: "left",
                        transform: `rotateY(90deg)`,
                        transition: "all 500ms ease",
                        transformStyle: "preserve-3d",
                        willChange: "auto",
                        objectFit: 'cover',
                }}>
                    <img
                        src={coverImageURL}
                        alt={`cover`}
                        style={{
                            height: '100%',
                            width: coverData.cover_width,
                            objectFit: 'cover',
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default Book;
