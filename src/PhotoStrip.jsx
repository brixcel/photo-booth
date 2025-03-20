import React from 'react';

const PhotoStrip = ({ photos, watermarkText }) => {
  // Sticker options
  const stickers = [
    '/stickers/mikasa-bg.png', 
    '/stickers/levi-bg.png', 
    '/stickers/annie-bg.png', 
    '/stickers/eren-bg.png'
  ];
  
  // Define specific positions for each photo
  const getSpecificPositions = (photoIndex, photoWidth, photoHeight, stickerSize) => {
    switch (photoIndex) {
      case 0: // First photo
        return [
          { top: 5, left: 5 }, // top left
          { top: Math.floor(photoHeight / 2 - stickerSize / 2), right: 5 }, // center right
          { bottom: 5, left: 5 } // bottom left
        ];
      case 1: // Second photo
        return [
          { top: 5, right: 5 }, // top right
          { top: Math.floor(photoHeight / 2 - stickerSize / 2), left: 5 }, // center left
          { bottom: 5, left: Math.floor(photoWidth / 2 - stickerSize / 2) } // center bottom
        ];
      case 2: // Third photo
        return [
          { top: 5, right: 5 }, // top right
          { top: Math.floor(photoHeight / 2 - stickerSize / 2), left: 5 }, // center left
          { bottom: 5, right: 5 } // bottom right
        ];
      default: // Any additional photos
        return [
          { top: 5, left: 5 }, // top left
          { top: 5, right: 5 }, // top right
          { bottom: 5, left: 5 }, // bottom left
          { bottom: 5, right: 5 } // bottom right
        ];
    }
  };
  
  return (
    <div
      className="photo-strip"
      style={{
        backgroundColor: '#f8d3e3',
        padding: '1rem',
        borderRadius: '10px',
        display: 'inline-block',
        border: '4px solid #ffb6c1',
        position: 'relative',
        maxWidth: '250px',
      }}
    >
      {photos.map((photo, index) => {
        const photoWidth = 200;
        const photoHeight = 250;
        const stickerSize = 30;
        
        // Get specific positions for this photo
        const positions = getSpecificPositions(index, photoWidth, photoHeight, stickerSize);
        
        return (
          <div
            key={index}
            className="photo-frame"
            style={{
              marginBottom: '1rem',
              position: 'relative',
              backgroundColor: 'white',
              borderRadius: '5px',
              overflow: 'hidden',
            }}
          >
            <img
              src={photo}
              alt={`Photo ${index + 1}`}
              style={{ width: photoWidth, height: photoHeight, display: 'block' }}
            />
            
            {/* Specifically positioned stickers */}
            {positions.map((position, stickerIndex) => (
              <img
                key={stickerIndex}
                src={stickers[Math.floor(Math.random() * stickers.length)]}
                alt={`sticker ${stickerIndex}`}
                style={{
                  position: 'absolute',
                  width: `${stickerSize}px`,
                  height: `${stickerSize}px`,
                  zIndex: 2,
                  ...position
                }}
              />
            ))}
          </div>
        );
      })}
      
      {/* Watermark at the bottom */}
      <div
        style={{
          textAlign: 'center',
          fontFamily: 'cursive',
          fontSize: '1rem',
          marginTop: '0.5rem',
          color: '#333',
          backgroundColor: 'white',
          padding: '0.25rem 1rem',
          borderRadius: '5px',
        }}
      >
        {watermarkText || 'March 20, 2025'}
      </div>
    </div>
  );
};

export default PhotoStrip;