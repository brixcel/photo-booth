import React from 'react';

const PhotoStrip = ({ photos, bgColor }) => {
  const columns = photos.length === 1 ? 1 : photos.length <= 4 ? 2 : 3;

  return (
    <div
      className="rounded p-4"
      style={{
        backgroundColor: bgColor,
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '10px',
      }}
    >
      {photos.map((src, idx) => (
        <div
          key={idx}
          className="w-full aspect-[4/3] bg-white rounded overflow-hidden shadow"
        >
          <img
            src={src}
            alt={`Photo ${idx + 1}`}
            className="object-cover w-full h-full"
          />
        </div>
      ))}
    </div>
  );
};

export default PhotoStrip;
