import React, { useState, useRef, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
// import Bookshelf from '../components/Bookshelf/Bookshelf';
import { createBook } from '../utils/api';
import {
    getCurrentLayout, getShelves, getDecorationSlots,
    getDecorations, getB2SMapping, setB2SMapping
    } from '../utils/api';

import Layout from '../components/Layout';
import Shelf from '../components/Shelf';
import BookDetails from "../components/BookDetails";
import Decoration from '../components/Decoration';

const Home = () => {

    // reference to the wrapper div
    const wrapperRef = useRef(null);
    // layout data which we get from the API
    const [layoutData, setLayoutData] = useState(null);
    // layout URL which we generate from the layout data
    const [layoutURL, setLayoutURL] = useState(null);
    // shelves data which we get from the API
    const [shelves, setShelves] = useState([]);
    // decorations data which we get from the API
    const [decorationSlots, setDecorationSlots] = useState([]);
    // 2D array of shelves and books
    // shelves are identified by consecutive integers
    // books are identified by their book_id and ordered by their index in the shelf
    const [book2ShelfMap, setBook2ShelfMap] = useState([]);

    // placeholder for the selected book to be displayed/ edited.
    const [selectedBookView, setSelectedBookView] = useState(null);

    // editor states
    const [isPlacing, setIsPlacing] = useState(false);
    const [isOrdering, setIsOrdering] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    // obtain layout data upon startup
    useEffect(() => {
        getCurrentLayout(setLayoutData);
    }, []);

    // once layout data is available, 
    //      fetch shelves and decorations
    //      and the book-to-shelf mapping
    useEffect(() => {
        if (!layoutData) {
            return;
        }
        getShelves(layoutData.id, setShelves);
        getDecorationSlots(layoutData.id, setDecorationSlots);
        getB2SMapping(layoutData.id, setBook2ShelfMap);
    }, [layoutData]);

    // when the b2s map is updated, reflect this in the database
    useEffect(() => {
        if (!book2ShelfMap || !layoutData) {
            return;
        }
        if (!isAdding) setB2SMapping(layoutData.id, book2ShelfMap);
    }, [book2ShelfMap]);

    // when a book is added, first place it somewhere
    // then open the editor
    useEffect(() => {
        console.log('isAdding:', isAdding); 
        console.log('selectedBookView:', selectedBookView);
        console.log('isPlacing:', isPlacing);
        if (!isAdding || !selectedBookView) {
            return;
        }
        // if isAdding is of type boolean, we place it first.
        // Otherwise, we don't need to set anything in this effect
        let addingIsBoolean = typeof isAdding === 'boolean';
        if (addingIsBoolean && !isPlacing) {
            // first round, set adding to book id and place it.
            setIsPlacing(selectedBookView.book_id);
            setIsAdding(selectedBookView.book_id);
            setIsEditing(true);
        } else if (isAdding === 'DONE') {
            // final round, update the book2shelf map
            // and reset the adding state
            console.log('Finalising Add Book: bookView: ', selectedBookView);
            setB2SMapping(layoutData.id, book2ShelfMap);
            setIsAdding(false);
        }

    }, [selectedBookView, isAdding]);

    // TODO: use later. Used to set the viewports to the selected component
    const handleSelectComponent = (event, componentRef) => {
        const selectedComponentRect = componentRef.current.getBoundingClientRect();
        const fixedElementSize = {
            width: componentRef.current.width,
            height: componentRef.current.height
        }; // example size of fixed element

        // Calculate the desired position for the fixed element
        const fixedElementPosition = {
            left: selectedComponentRect.right,
            top: selectedComponentRect.top
        };

        // Calculate the required pan to bring the selected component and the fixed element into view
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const pageWidth = layoutData.width;
        const pageHeight = layoutData.height;

        // console.log(`viewport: ${viewportWidth} x ${viewportHeight}`);
        // console.log(`page: ${pageWidth} x ${pageHeight}`);
        // console.log(`selected component: ${JSON.stringify(selectedComponentRect)}`);
        // console.log(`fixed element: ${JSON.stringify(fixedElementPosition)}`);

        // Ensure the fixed element fits within the viewport
        const panX = selectedComponentRect.right - (viewportWidth - fixedElementSize.width) / 2;
        const panY = selectedComponentRect.top - (viewportHeight - fixedElementSize.height) / 2;
        const panZoom = pageHeight / selectedComponentRect.height;

        wrapperRef.current.setTransform(panX, panY, panZoom); // Adjust the zoom level as needed
    };

    const handleAddBook = async () => {
        // creates a new book through the API and opens an editor.
        createBook(setSelectedBookView);
        setIsAdding(true);
        console.log('Adding book...');
    };

    const handleOrderBook = (direction) => {
        // shelf id is the index of the shelf in the b2s map where the book is placed
        const shelfMap = book2ShelfMap.find(shelf => shelf.books.includes(selectedBookView.book_id));
        const shelfIdx = book2ShelfMap.indexOf(shelfMap);
        const bookIdx = shelfMap.books.indexOf(selectedBookView.book_id);
        console.log('Ordering book, on shelf ', shelfIdx, ' at index ', bookIdx, direction == -1 ? " left" : " right");
        if (direction === -1 && bookIdx === 0) {
            console.log('Book is already at the leftmost position');
            return;
        }
        if (direction === 1 && bookIdx === shelfMap.books.length - 1) {
            console.log('Book is already at the rightmost position');
            return;
        }
        const newBook2ShelfMap = [...book2ShelfMap];
        const newShelfMap = { ...shelfMap };
        const newBooks = [...newShelfMap.books];
        const temp = newBooks[bookIdx];
        newBooks[bookIdx] = newBooks[bookIdx + direction];
        newBooks[bookIdx + direction] = temp;
        newShelfMap.books = newBooks;
        newBook2ShelfMap[shelfIdx] = newShelfMap;
        setBook2ShelfMap(newBook2ShelfMap);
    }

    // once a shelf is selected during adding a book, we can open the editor
    // useEffect(() => {
    //     if (!isPlacing || !isAdding) {
    //         return;
    //     }
    //     setIsAdding(false);
    //     setIsEditing(isPlacing);
    // }, [isPlacing]);


    if (!layoutData) {
        return (
            <div>
                Loading...
            </div>
        );
    }

    return (
        <div style={{
            position: 'absolute', width: layoutData.width, height: layoutData.height,
            zIndex: 1, top: 0, left: 0
        }}>
            <TransformWrapper
                style={{ height: "100%", width: "100%", zIndex: 1 }}
                ref={wrapperRef} 
            >
                <TransformComponent>
                    <Layout layoutData={layoutData} />
                    {(shelves && book2ShelfMap) && shelves.map(shelf => (
                        <Shelf
                            key={shelf.id}
                            shelf={shelf}
                            b2sMap={book2ShelfMap}
                            setB2SMap={setBook2ShelfMap}
                            selectedBookView={selectedBookView}
                            setSelectedBookView={setSelectedBookView}
                            isPlacing={isPlacing} setIsPlacing={setIsPlacing}
                            isEditing={isEditing} setIsEditing={setIsEditing}
                            isOrdering={isOrdering} setIsOrdering={setIsOrdering}
                            isAdding={isAdding} setIsAdding={setIsAdding}
                        />
                    ))}
                    {decorationSlots && decorationSlots.map(slot => (
                        <div key={slot.id} style={{
                            position: 'absolute',
                            left: slot.x_pos,
                            top: slot.y_pos,
                            width: slot.width,
                            height: slot.height
                        }}>
                            <Decoration slotData={slot} />
                        </div>
                    ))}
                </TransformComponent>
            </TransformWrapper>
            {( selectedBookView ) && <BookDetails
                book_id={selectedBookView.book_id}
                bookData={selectedBookView.bookData || null}
                coverData={selectedBookView.coverData}
                progressData={selectedBookView.progressData || null}
                isEditing={isEditing} setIsEditing={setIsEditing}
                isPlacing={isPlacing} setIsPlacing={setIsPlacing}
                isOrdering={isOrdering} setIsOrdering={setIsOrdering}
                isAdding={isAdding} setIsAdding={setIsAdding}
                coverDimensions={selectedBookView.coverDimensions}
            />}
            <button
                onClick={handleAddBook}
                style={{ position: 'fixed', bottom: '10px', right: '10px' }}>
                Add Book
            </button>
            {isOrdering && <div style={{
                position: 'fixed', bottom: '10px', left: '10px', zIndex: 10
            }}>
                <button onClick={() => setIsOrdering(false)}>Done Ordering</button>
                <button onClick={() => handleOrderBook(-1)}>Order Left</button>
                <button onClick={() => handleOrderBook(1)}>Order Right</button>
            </div>
            }
        </div>
    );
};



export default Home;
