import React, { useRef, useState, useEffect } from 'react';
import SettingsPanel from './SettingsPanel';
import PhotoStrip from './PhotoStrip';
import html2canvas from 'html2canvas';

const Photobooth = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const stripRef = useRef(null);
  const [photos, setPhotos] = useState([]);
  const [maxPhotos, setMaxPhotos] = useState(6);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [isCapturing, setIsCapturing] = useState(true);

  useEffect(() => {
    startCamera();
  }, []);

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user'
      }
    });
    videoRef.current.srcObject = stream;
    await videoRef.current.play();
  };

  const takePhoto = () => {
    const context = canvasRef.current.getContext('2d');
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.translate(canvasRef.current.width, 0);
    context.scale(-1, 1);
    context.drawImage(videoRef.current, 0, 0);
    const imageData = canvasRef.current.toDataURL('image/png');

    if (photos.length + 1 >= maxPhotos) {
      setPhotos((prev) => [...prev, imageData]);
      stopCamera();
    } else {
      setPhotos((prev) => [...prev, imageData]);
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current.srcObject;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCapturing(false);
  };

  const restartPhotobooth = () => {
    setPhotos([]);
    setIsCapturing(true);
    startCamera();
  };

  const downloadStrip = async () => {
    if (stripRef.current) {
      const canvas = await html2canvas(stripRef.current);
      const link = document.createElement('a');
      link.download = 'photo_strip.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">📸 Photobooth App</h1>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <SettingsPanel onStart={(count, color) => { setMaxPhotos(count); setBgColor(color); }} />
        </div>

        {isCapturing && (
          <div className="md:w-2/3 flex flex-col items-center">
            <video
              ref={videoRef}
              width="640"
              height="480"
              className="rounded-xl border-4 border-gray-300 shadow-lg mb-4"
              style={{ transform: 'scaleX(-1)' }}
            />
            <div className="flex gap-4">
              <button
                onClick={takePhoto}
                disabled={photos.length >= maxPhotos}
                className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition"
              >
                Capture ({photos.length}/{maxPhotos})
              </button>
              <button
                onClick={restartPhotobooth}
                className="bg-yellow-500 text-white py-2 px-6 rounded-lg hover:bg-yellow-600 transition"
              >
                Retake
              </button>
            </div>
          </div>
        )}

        {!isCapturing && photos.length > 0 && (
          <div ref={stripRef} className="md:w-2/3 bg-white rounded-lg p-4 shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-center">📷 Photo Strip</h2>
            <PhotoStrip photos={photos} bgColor={bgColor} />
            <div className="flex justify-center mt-6 gap-4">
              <button
                onClick={restartPhotobooth}
                className="bg-yellow-500 text-white py-2 px-6 rounded-lg hover:bg-yellow-600 transition"
              >
                Retake
              </button>
              <button
                onClick={downloadStrip}
                className="bg-purple-600 text-white py-2 px-6 rounded-lg hover:bg-purple-700 transition"
              >
                Download Strip
              </button>
            </div>
          </div>
        )}
      </div>
      <canvas ref={canvasRef} hidden />
    </div>
  );
};

export default Photobooth;
