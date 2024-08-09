import React from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

const ImageViewer = () => {
    return (
        <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
            <TransformWrapper
                defaultScale={1}
                wheel={{ step: 0.2 }} // Mouse scroll for zooming
                panning={{ disabled: false }} // Enable panning with left mouse button
            >
                <TransformComponent>
                    <img
                        src="/img/everest.png"
                        alt="Large View"
                        style={{ width: '200%', height: 'auto', cursor: 'grab' }} // Adjust as needed
                    />
                </TransformComponent>
            </TransformWrapper>
        </div>
    );
};

export default ImageViewer;
