import React, { useEffect, useState, useRef } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import Shelf from './Shelf';
import Decoration from './Decoration';
import BookDetails from './BookDetails';
import {
    getCurrentLayout, getShelves,
    getBooks, getB2SMapping, getBookCovers, getBookProgress,
    getDecorations, getDecorationSlots,
    createBook,
    setBook, setBookCover, setBookProgress
} from '../../utils/api';
import BookEditor from './BookEditor';

const Bookshelf = (
    { selectedBook, setSelectedBook,
    isEditing, setIsEditing }
) => {

    const [layoutData, setLayoutData] = useState(null);
    const [layout, setLayout] = useState(null);
    const [shelves, setShelves] = useState([]);
    const [b2s_map, setB2SMap] = useState([]);
    const [decoration_slots, setDecorationSlots] = useState([]);
    const [decorations, setDecorations] = useState([]);

    // obtain Layout data upon startup
    useEffect(() => {
        const fetchLayout = async () => {
            const crnt_layout = await getCurrentLayout();
            console.log(`layout: ${JSON.stringify(crnt_layout)}`);
            setLayoutData(crnt_layout);

        };
        fetchLayout();
    }, []);

    // obtain Shelf and Decoration data upon Layout data retrieval
    useEffect(() => {
        const fetchData = async () => {
            // TODO: add Texture component to overlay the layout with a texture
            // Texture path should be a part of the Layout data
            if (!layoutData) {
                return;
            }
            const b2sMap = await getB2SMapping(layoutData.id);
            setB2SMap(b2sMap);
            var bookIds = b2s_map.map(b2s => b2s.book_id);
            console.log(`book ids: ${JSON.stringify(bookIds)}`);
    
            const shelvesData = await getShelves(layoutData.id);
            setShelves(shelvesData);
            console.log(`shelves: ${JSON.stringify(shelvesData)}`);

            const decorationSlots = await getDecorationSlots(layoutData.id);
            setDecorationSlots(decorationSlots);
            console.log(`decoration slots: ${JSON.stringify(decorationSlots)}`);
    
            if (decorationSlots.length === 0) {
                console.log("No decorations found");
                return
            };
            const decorationsData = await getDecorations(decorationSlots);
            setDecorations(decorationsData);
            console.log(`decoration data: ${JSON.stringify(decorationsData)}`);

        };
        
        fetchData();
        
    }, [layoutData]);

    // obtain layout SVG upon Layout data retrieval
    useEffect(() => {
        if (!layoutData) {
            return;
        }
        const fetchLayoutSVG = async () => {
            fetch(layoutData.layout_fname)
                .then((response) => response.text())
                .then((data) => {
                    setLayout(data);
                })
                .catch((error) => {
                    console.error('Error loading SVG:', error);
                });
        };
        fetchLayoutSVG();
    }, [layoutData]);

    const handleSaveBook = ({book, cover, progress}) => {
        console.log(`book: ${JSON.stringify(book)}`);
        console.log(`cover: ${JSON.stringify(cover)}`);
        console.log(`progress: ${JSON.stringify(progress)}`);
        // saves the book through the API and closes the editor.
        if (book) {
            setBook(book);
        }
        if (cover) {
            setBookCover(cover);
        }
        if (progress) {
            setBookProgress(progress);
        }
        setIsEditing(false);
    }

    const handleCloseEditor = () => {
        // closes the editor without saving.
        setIsEditing(false);
    }
    if (!layout || !layoutData) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <div style={{
                position: 'absolute', width: layoutData.width, height: layoutData.height,
                zIndex: 1
            }}>
            <TransformWrapper style={{ height: "100%", width: "100%" }}>
                <TransformComponent>
                    <div
                        className="layout"
                        dangerouslySetInnerHTML={{ __html: layout }}
                    />
                    {shelves.map(shelf => (
                        // TODO: have the LayoutData define Shelves and DecorationSlots
                        <Shelf
                            key={shelf.id}
                            shelf={shelf}
                            b2sMaps={b2s_map.filter(book => book.shelf_id === shelf.id)}
                            selectedBook={selectedBook} setSelectedBook={setSelectedBook}
                        />
                    ))}
                    {decorations.map(decoration => (
                        <Decoration key={decoration.id} decoration={decoration} />
                    ))}
                </TransformComponent>
            </TransformWrapper>
        </div>
        <div style={{ position: "absolute", zIndex: 10 }}>
            {(selectedBook) &&
                <BookDetails
                    selectedBook={selectedBook}
                    setSelectedBook={setSelectedBook}
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    onSave={handleSaveBook}
                /> || null
            }
        </div>
        </>
    );
};

export default Bookshelf;
