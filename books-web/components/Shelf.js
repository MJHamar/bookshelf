import { useEffect, useState, useRef } from "react";
import { downloadFile, uploadFile } from "../utils/api";
import { getBookCover } from "../utils/api";
import Book from "./Book";


const Shelf = ({
    shelf,
    b2sMap, setB2SMap,
    wrapperRef
}) => {

    const [bookCovers, setBookCovers] = useState([]);
    const [cumulativeSpineWidth, setCumulativeSpineWidth] = useState([]);

    // obtain book cover data upon shelf data retrieval
    useEffect(() => {
        if (!b2sMap || !b2sMap[shelf.id]) {
            return;
        }
        const bookIds = b2sMap[shelf.id].books;
        getBookCover(bookIds, setBookCovers);
    }, [b2sMap]);

    // calculate the total width of the books on the shelf
    // and where each book starts
    useEffect(() => {
        if (!bookCovers) {
            return;
        }
        let totalWidth = 0;
        let cumSW = [];
        bookCovers.forEach(cover => {
            totalWidth += cover.spine_width;
            cumSW.push(totalWidth);
        });
        setCumulativeSpineWidth(cumSW);
    }, [bookCovers]);

    if (!bookCovers) {
        return null;
    }

    return (
        <div
            style={{
                position: 'absolute',
                left: shelf.x_pos,
                top: shelf.y_pos,
                width: shelf.width,
                height: shelf.height,
                display: 'flex',
                alignItems: 'flex-end',
                zIndex: 100

                // , // temporary styling
                // backgroundColor: 'red',
                // opacity: 0.1,
            }}
        >
            {(bookCovers && cumulativeSpineWidth) && bookCovers.map((cover, idx, _) => {
                return <Book
                    key={cover.book_id}
                    initialCoverData={cover}
                    wrapperRef={wrapperRef}
                    spineX={cumulativeSpineWidth[idx-1] || 0}
                />
            })}
        </div>
    );

};

export default Shelf;