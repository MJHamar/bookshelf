import { useState, useEffect } from "react";
import { downloadFile, DEF_COVER_ID, DEF_SPINE_ID } from "../utils/api";

const Book = ({
    initialCoverData,
    wrapperRef,
    spineX
}) => {
    const [coverData, setCoverData] = useState(null);
    const [coverImageURL, setCoverImageURL] = useState(null);
    const [spineImageURL, setSpineImageURL] = useState(null);
    const [rotation, setRotation] = useState(0); // 0: spine, 45: peak-cover, 90: full-cover
    const [isHovered, setIsHovered] = useState(false);
    const [isClicked, setIsClicked] = useState(false);

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
            setRotation(0); // Back to spine view
            setIsClicked(false);
        } else {
            setRotation(80); // Full-cover view
            setIsClicked(true);

            // Adjust the viewport to ensure the details dialog is fully visible
            wrapperRef.current.zoomToElement(wrapperRef.current.element, 1.5);
        }
    };

    return (
        <>
        <div
            style={{
                cursor: 'pointer',
                height: '100%',
                position: 'relative',
                left: spineX+100,
                width: isClicked ? coverData.cover_width : coverData.spine_width,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: isClicked ? 120 : 110,
                perspective: '1000px',
                transformOrigin: "right",
                transformStyle: 'preserve-3d',
                transform: `translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(-${rotation}deg) rotateZ(0deg) skew(0deg, 0deg)`,
                transition: "all 500ms ease",
                overflow: 'visible',  // Allow content to overflow the bounds
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
        >
            <div style={{
                position: "absolute",
                flexShrink: 0,
                height: '100%',
                // overflow: "hidden",
                transformOrigin: "right",
                transform: `translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)`,
                transition: "all 500ms ease",
                willChange: "auto",
                transformStyle: "preserve-3d",
            }}>
                <img
                    src={spineImageURL}
                    alt={`spine`}
                    style={{
                        height: '100%',
                        width: '100%',
                        objectFit: 'cover',
                    }}
                />
            </div>
            <div style={{
                position: "absolute",
                alignItems: "flex-start",
                left: coverData.spine_width,
                justifyContent: "center",
                width: coverData.cover_width,
                height: "100%",
                flexShrink: 0,
                transformOrigin: "left",
                transform: `translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(90deg) rotateZ(0deg) skew(0deg, 0deg)`,
                transition: "all 500ms ease",
                willChange: "auto",
                filter: "brightness(0.8) contrast(2)",
                transformStyle: "preserve-3d",
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

    </>
    
    );
};

export default Book;
