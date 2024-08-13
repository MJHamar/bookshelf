import React from 'react';

const Decoration = ({ decoration }) => {
    return (
        <div style={{
            position: 'absolute',
            left: decoration.x_pos,
            top: decoration.y_pos,
            width: decoration.width,
            height: decoration.height
        }}>
            <img src={decoration.decoration_fname} alt="Decoration" style={{ width: '100%', height: '100%' }} />
        </div>
    );
};

export default Decoration;
