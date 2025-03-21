import React, { useState } from 'react';

// Updated color presets with light pink added
const colorPresets = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#000000', '#ffffff', '#ffb6c1'];

const SettingsPanel = ({ onStart }) => {
  const [numPhotos, setNumPhotos] = useState(1);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [theme, setTheme] = useState('attack-on-titan');

  const handleConfirm = () => {
    onStart(numPhotos, bgColor, theme);
  };

  return (
    <div className="p-4 bg-gray-100 rounded shadow-md w-full max-w-md mx-auto">
      <label className="block mb-2 font-semibold">Number of Photos (1–6):</label>
      <input
        type="number"
        min="1"
        max="6"
        value={numPhotos}
        onChange={(e) => setNumPhotos(Number(e.target.value))}
        className="w-full p-2 border rounded mb-4"
      />
      
      <label className="block mb-2 font-semibold">Select Background Color:</label>
      <div className="flex flex-wrap gap-2 mb-4">
        {colorPresets.map((color) => (
          <button
            key={color}
            onClick={() => setBgColor(color)}
            className="w-8 h-8 rounded-full border"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      
      <label className="block mb-1">Or pick your own color:</label>
      <input
        type="color"
        value={bgColor}
        onChange={(e) => setBgColor(e.target.value)}
        className="w-full h-10 border rounded mb-4"
      />
      
      <label className="block mb-2 font-semibold">Select Theme:</label>
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setTheme('attack-on-titan')}
          className="px-4 py-2 bg-gray-200 rounded-full hover:bg-gray-300 border"
        >
          Attack on Titan
        </button>
      </div>
      
      <button
        onClick={handleConfirm}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
      >
        Confirm
      </button>
    </div>
  );
};

export default SettingsPanel;