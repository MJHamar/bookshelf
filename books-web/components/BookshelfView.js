import React from 'react';
import { Shelf } from '../components/Bookshelf';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

const ImageViewer = () => {
    const books = [
        {
            title: "The Great Gatsby",
            author: "F. Scott Fitzgerald",
            date: "1925",
            rating: 4.5,
            coverImage: "/path/to/great-gatsby.jpg", // Ensure you have an image here
            spineColor: "#1b1b1b",
            textColor: "#fff",
            slug: "the-great-gatsby",
            summary: "A novel about the American dream...",
        },
        // Add more book objects here
    ];

    return (
        <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
            <TransformWrapper
                defaultScale={1}
                wheel={{ step: 0.2 }} // Mouse scroll for zooming
                panning={{ disabled: false }} // Enable panning with left mouse button
            >
                <TransformComponent>
                    <img
                        src="/img/layout1.png"
                        alt="Large View"
                        style={{
                            width: '2048px', height: 'auto', cursor: 'grab', position: 'relative', top: '0px', left: '0px', zIndex: 1 }}
                    />
                    <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 100, height: '10px' }}>
                        <Shelf books={books} />
                    </div>
                </TransformComponent>

            </TransformWrapper>
        </div>

    );
};

export default ImageViewer;
