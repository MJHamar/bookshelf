import { useEffect, useState, useRef } from "react";
import { downloadFile, uploadFile } from "../utils/api";
import { getBookCover, setB2SMapping } from "../utils/api";
import Book from "./Book";


const Shelf = ({
    shelf,
    b2sMap, setB2SMap,
    selectedBookView, setSelectedBookView,
    isPlacing, setIsPlacing,
    isEditing, setIsEditing,
    isOrdering, setIsOrdering,
    isAdding, setIsAdding
}) => {

    const [bookCovers, setBookCovers] = useState([]);
    const [cumulativeSpineWidth, setCumulativeSpineWidth] = useState([]);

    const shelfRef = useRef(null);

    // obtain book cover data upon shelf data retrieval
    useEffect(() => {
        if (!b2sMap || !b2sMap[shelf.id]) {
            return;
        }
        const bookIds = b2sMap[shelf.id].books.filter(b => b !== isAdding);
        let coversInclAdding = [];
        if (isAdding && b2sMap[shelf.id].books.includes(isAdding)) {
            coversInclAdding = [selectedBookView.coverData];
        }
        getBookCover(bookIds, (covers) => { setBookCovers(covers.concat(coversInclAdding)) });
    }, [b2sMap]);

    // calculate the total width of the books on the shelf
    // and where each book starts
    useEffect(() => {
        if (!bookCovers) {
            return;
        }
        console.log(`Book Covers for Shelf ${shelf.id}: `, bookCovers);
        console.log(`B2SMap for Shelf ${shelf.id}: `, b2sMap[shelf.id]);
        console.log(`Is Adding: ${isAdding}`);
        console.log(`Is Placing: ${isPlacing}`);
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
            // remove the book from the previous shelf
            // and add it to the new shelf
            // keep in mind that prev is a list of shelves, each shelf containing a list of books and a shelf id
            let prevShelves = [...prev];
            let prevShelf = prevShelves.find(s => s.books.includes(isPlacing));
            let newShelf = prevShelves[shelf.id];
            if (prevShelf) {
                prevShelf.books = prevShelf.books.filter(b => b !== isPlacing);
            }
            newShelf.books.push(isPlacing);
            return prevShelves;
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

    return (
        <div
            ref={shelfRef}
            onClick={isPlacing ? handlePlaceClick : null}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
                cursor: isPlacing ? 'pointer' : 'default',
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
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    isOrdering={isOrdering}
                />
            })}
        </div>
    );

};

export default Shelf;