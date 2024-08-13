import React, { useEffect, useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import Shelf from './Shelf';
import Decoration from './Decoration';
import { getCurrentLayout, getShelves, getBooks, getBookCovers, getDecorations } from '../../utils/api';

const Bookshelf = () => {
    const [layout, setLayout] = useState(null);
    const [shelves, setShelves] = useState([]);
    const [books, setBooks] = useState([]);
    const [bookCovers, setBookCovers] = useState([]);
    const [decorations, setDecorations] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const layoutData = await getCurrentLayout();
            setLayout(layoutData);

            const shelvesData = await getShelves();
            setShelves(shelvesData);

            const booksData = await getBooks();
            setBooks(booksData);

            const bookIds = booksData.map(book => book.id);
            const coversData = await getBookCovers(bookIds);
            setBookCovers(coversData);

            const decorationSlots = shelvesData.map(shelf => shelf.slot_id);
            const decorationsData = await getDecorations(decorationSlots);
            setDecorations(decorationsData);
        };

        fetchData();
    }, []);

    if (!layout) return <div>Loading...</div>;

    return (
        <div style={{ position: 'relative', width: layout.width, height: layout.height }}>
            <TransformWrapper>
                <TransformComponent>
                    <img src={layout.layout_fname} alt="Bookshelf Layout" style={{ width: '100%', height: '100%' }} />
                    {shelves.map(shelf => (
                        <Shelf key={shelf.id} shelf={shelf} books={books.filter(book => book.shelf_id === shelf.id)} covers={bookCovers} />
                    ))}
                    {decorations.map(decoration => (
                        <Decoration key={decoration.id} decoration={decoration} />
                    ))}
                </TransformComponent>
            </TransformWrapper>
        </div>
    );
};

export default Bookshelf;
