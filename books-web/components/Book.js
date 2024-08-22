import { useState, useEffect, useRef } from "react";

import {
    downloadFile, uploadFile,
    DEF_COVER_ID, DEF_SPINE_ID
} from "../utils/api";

const Book = ({
    initialCoverData,
    wrapperRef,
    spineX
}) => {

    const [coverData, setCoverData] = useState(null);
    const [coverImageURL, setCoverImageURL] = useState(null);
    const [spineImageURL, setSpineImageURL] = useState(null);

    useEffect(() => {
        setCoverData(initialCoverData);
    }, []);

    useEffect(() => {
        if (coverData?.cover_fname) {
            console.log(`downloading cover image: ${coverData.cover_fname}`);
            downloadFile({
                uuid: coverData.cover_fname,
                setFileData: setCoverImageURL
            });
        } else {
            console.log(`downloading default cover image: ${DEF_COVER_ID}`);
            downloadFile({
                uuid: DEF_COVER_ID,
                setFileData: setCoverImageURL
            });
        }
        if (coverData?.spine_fname) {
            console.log(`downloading spine image: ${coverData.spine_fname}`);
            downloadFile({
                uuid: coverData.spine_fname,
                setFileData: setSpineImageURL
            });
        } else {
            console.log(`downloading default spine image: ${DEF_SPINE_ID}`);
            downloadFile({
                uuid: DEF_SPINE_ID,
                setFileData: setSpineImageURL
            });
        }
    }, [coverData]);

    if (!coverData || !coverImageURL || !spineImageURL) {
        console.log(`Book not ready cover data: ${coverData}, cover image: ${coverImageURL}, spine image: ${spineImageURL}`);
        return null;
    }

    return (
        <div
            style={{
                cursor: 'pointer',
                // transform: isSelected ? 'rotateY(90deg) scale(2)' : 'rotateY(0deg) scale(1)',
                // transition: 'transform 0.5s',
                height: '100%',
                position: 'relative',
                left: spineX,
                top: 0,
                width: coverData.spine_width,
                // height: coverData.spine_height,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: 110
            }}
        >
            <img
                src={coverImageURL}
                alt={`cover`}
                style={{
                    height: '100%',
                    width: '100%',
                    objectFit: 'cover'
                }}
            />
        </div>
    );
};

export default Book;