import { useEffect, useState, useRef } from "react";
import { downloadFile, uploadFile } from "../utils/api";
import { getBookCover } from "../utils/api";
import Book from "./Book";


const Shelf = ({
    shelf,
    b2sMap, setB2SMap,
    selectedBookView, setSelectedBookView,
    isPlacing, setIsPlacing
}) => {

    const [bookCovers, setBookCovers] = useState([]);
    const [cumulativeSpineWidth, setCumulativeSpineWidth] = useState([]);

    const shelfRef = useRef(null);

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

    let placingIsNewShelf = isPlacing && !b2sMap[shelf.id].books.includes(isPlacing);

    const handlePlaceClick = () => {
        setB2SMap(prev => {
            let newMap = { ...prev };
            // find the shelf where the book currently is
            let oldShelf = Object.keys(newMap).find(key => newMap[key].books.includes(isPlacing));
            // remove the book from the old shelf
            if (oldShelf) {
                newMap[oldShelf] = { ...newMap[oldShelf], books: newMap[oldShelf].books.filter(book => book !== isPlacing) };
            }
            // add the book to the new shelf
            newMap[shelf.id] = { ...newMap[shelf.id], books: [...newMap[shelf.id].books, isPlacing] };
            return newMap;
        });
        setIsPlacing(null);
    };

    // when isPlacing and mouse enters the shelf, highlight the shelf
    const handleMouseEnter = () => {
        if (placingIsNewShelf) {
            shelfRef.current.style.backgroundColor = 'orange';
        }
    }
    // when isPlacing and mouse leaves the shelf, unhighlight the shelf
    const handleMouseLeave = () => {
        if (placingIsNewShelf) {
            shelfRef.current.style.backgroundColor = 'yellow';
        }
    }

    if (!bookCovers) {
        return null;
    }

    return (
        <div
            ref={shelfRef}
            onClick={placingIsNewShelf ? handlePlaceClick : null}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
                cursor: placingIsNewShelf ? 'pointer' : 'default',
                position: 'absolute',
                left: shelf.x_pos,
                top: shelf.y_pos,
                width: shelf.width,
                height: shelf.height,
                display: 'flex',
                alignItems: 'flex-end',
                overflow: 'visible',
                zIndex: 10,
                backgroundColor: (placingIsNewShelf) ? 'yellow' : null
            }}
        >
            {(!isPlacing && bookCovers && cumulativeSpineWidth) && bookCovers.map((cover, idx, _) => {
                return <Book
                    key={cover.book_id}
                    initialCoverData={cover}
                    spineX={cumulativeSpineWidth[idx - 1] || 0}
                    selectedBookView={selectedBookView}
                    setSelectedBookView={setSelectedBookView}
                />
            })}
        </div>
    );

};

export default Shelf;