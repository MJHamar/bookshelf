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
    const [decorations, setDecorations] = useState([]);
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

    // fetch decorations once the decoration slots are available
    useEffect(() => {
        if (!decorationSlots) {
            return;
        }
        const decorationIds = decorationSlots.map(slot => slot.slot_id);
        getDecorations(decorationIds, setDecorations);
    }, [decorationSlots]);

    // when the b2s map is updated, reflect this in the database
    useEffect(() => {
        if (!book2ShelfMap || !layoutData) {
            return;
        }
        setB2SMapping(layoutData.id, book2ShelfMap);
    }, [book2ShelfMap]);

    // const [isEditing, setIsEditing] = useState(false);

    // const handleAddBook = async () => {
    //     // creates a new book through the API and opens an editor.
    //     let bookView = await createBook();
    //     console.log(`bookView: ${JSON.stringify(bookView)}`);
    //     let book = bookView.book;
    //     let cover = bookView.cover;
    //     let progress = bookView.progress;
    //     setIsEditing(true);
        
    // };

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
        let bookView = await createBook();
        console.log(`bookView: ${JSON.stringify(bookView)}`);
        setSelectedBookView({...bookView, book_id: bookView.book.book_id});
        setIsAdding(true);
        setIsPlacing(bookView.book.book_id);
    };

    // once a shelf is selected during adding a book, we can open the editor
    useEffect(() => {
        if (!isPlacing || !isAdding) {
            return;
        }
        setIsAdding(false);
        setIsEditing(isPlacing);
    }, [isPlacing]);


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
                        />
                    ))}
                    <button
                        onClick={handleAddBook}
                        style={{ position: 'fixed', bottom: '10px', right: '10px' }}>
                        Add Book
                    </button>
                </TransformComponent>
            </TransformWrapper>
            {( selectedBookView ) && <BookDetails
                book_id={selectedBookView.book_id}
                coverData={selectedBookView.coverData}
                coverImageURL={selectedBookView.coverImageURL}
                isEditing={isEditing} setIsEditing={setIsEditing}
                isPlacing={isPlacing} setIsPlacing={setIsPlacing}
                isOrdering={isOrdering} setIsOrdering={setIsOrdering}
                coverDimensions={selectedBookView.coverDimensions}
            />}
        </div>
    );
};



export default Home;
