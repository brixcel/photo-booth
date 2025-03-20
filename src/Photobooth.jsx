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
  const [sticker, setSticker] = useState('');
  const [isCapturing, setIsCapturing] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const [isAutoCapturing, setIsAutoCapturing] = useState(false);

  useEffect(() => {
    startCamera();
    return () => {
      const stream = videoRef.current?.srcObject;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Handle countdown timer for auto-capture
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0 && isAutoCapturing) {
      takePhoto();
      if (photos.length + 1 < maxPhotos) {
        setCountdown(3); // Reset timer for next photo
      } else {
        setIsAutoCapturing(false);
      }
    }
    return () => clearTimeout(timer);
  }, [countdown, isAutoCapturing, photos.length, maxPhotos]);

  const startCamera = async () => {
    try {
      // iOS-specific constraints to avoid Facebook Live issue
      const constraints = {
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
          // These settings help prevent iOS from treating this as a continuous stream
          frameRate: { max: 30 }
        },
        audio: false // Explicitly disable audio to avoid iOS Live mode
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Fix for iOS - setting playsinline attribute
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('webkit-playsinline', 'true');
        
        // Wait for video to be ready before playing
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(err => {
            console.error("Error playing video:", err);
          });
        };
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check your camera permissions.");
    }
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
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
      setIsAutoCapturing(false);
    } else {
      setPhotos((prev) => [...prev, imageData]);
    }
  };

  const startAutoCapture = () => {
    setIsAutoCapturing(true);
    setCountdown(3); // Start with 3 second countdown
  };

  const stopAutoCapture = () => {
    setIsAutoCapturing(false);
    setCountdown(0);
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCapturing(false);
    setIsAutoCapturing(false);
    setCountdown(0);
  };

  const restartPhotobooth = () => {
    setPhotos([]);
    setIsCapturing(true);
    setIsAutoCapturing(false);
    setCountdown(0);
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
          <SettingsPanel
            onStart={(count, color, selectedSticker) => {
              setMaxPhotos(count);
              setBgColor(color);
              setSticker(selectedSticker);
            }}
          />
        </div>

        {isCapturing && (
          <div className="md:w-2/3 flex flex-col items-center">
            <div className="relative">
              <video
                ref={videoRef}
                width="640"
                height="480"
                className="rounded-xl border-4 border-gray-300 shadow-lg mb-4"
                style={{ transform: 'scaleX(-1)' }}
                playsInline
                muted
              />
              
              {countdown > 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black bg-opacity-50 text-white text-8xl font-bold rounded-full w-40 h-40 flex items-center justify-center">
                    {countdown}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={takePhoto}
                disabled={photos.length >= maxPhotos || isAutoCapturing}
                className={`bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition ${
                  (photos.length >= maxPhotos || isAutoCapturing) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Capture ({photos.length}/{maxPhotos})
              </button>
              
              {!isAutoCapturing ? (
                <button
                  onClick={startAutoCapture}
                  disabled={photos.length >= maxPhotos}
                  className={`bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition ${
                    photos.length >= maxPhotos ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Auto Capture (3s)
                </button>
              ) : (
                <button
                  onClick={stopAutoCapture}
                  className="bg-red-600 text-white py-2 px-6 rounded-lg hover:bg-red-700 transition"
                >
                  Stop Auto Capture
                </button>
              )}
              
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
          <div className="md:w-2/3 flex flex-col items-center">
            <div
              ref={stripRef}
              className="bg-white rounded-lg p-4 shadow-md"
              style={{ backgroundColor: bgColor }}
            >
              <h2 className="text-xl font-semibold mb-4 text-center">📷 Photo Strip</h2>
              <PhotoStrip photos={photos} bgColor={bgColor} sticker={sticker} watermarkText={new Date().toLocaleDateString()} />
            </div>

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