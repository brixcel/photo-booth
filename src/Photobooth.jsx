import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsPanel from './SettingsPanel';
import PhotoStrip from './PhotoStrip';
import { getDefaultLayoutForCount, getLayoutsForCount } from './config/layouts';
import html2canvas from 'html2canvas';

const Photobooth = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const exportStripRef = useRef(null);
  const fileInputRef = useRef(null);

  // Layout & Styling State
  const [photoCount, setPhotoCount] = useState(4);
  const [selectedLayout, setSelectedLayout] = useState(() => getDefaultLayoutForCount(4));
  const [bgColor, setBgColor] = useState('#FFF7EF');
  const [stickerSet, setStickerSet] = useState('aot');
  const [watermarkText, setWatermarkText] = useState('');

  // Photos State: array of data URLs
  const [photos, setPhotos] = useState([]);
  const [activeSlotToReplace, setActiveSlotToReplace] = useState(null);

  // Camera & Capture State
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [cameraError, setCameraError] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [isAutoCapturing, setIsAutoCapturing] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);

  // App Workflow Stage: 'capture' | 'result'
  const [appStage, setAppStage] = useState('capture');
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Initialize camera
  useEffect(() => {
    if (appStage === 'capture') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [appStage]);

  // Handle Photo Count Change
  const handlePhotoCountChange = (newCount) => {
    setPhotoCount(newCount);
    const validLayouts = getLayoutsForCount(newCount);
    // Select first matching layout for this count
    setSelectedLayout(validLayouts[0]);
    // Trim photos if user reduces count, or keep existing
    if (photos.length > newCount) {
      setPhotos((prev) => prev.slice(0, newCount));
    }
  };

  // Handle Layout Change
  const handleLayoutChange = (layout) => {
    setSelectedLayout(layout);
  };

  // Auto-capture countdown loop
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    } else if (countdown === 0 && isAutoCapturing) {
      snapPhoto();
    }
    return () => clearTimeout(timer);
  }, [countdown, isAutoCapturing]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const constraints = {
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 960 },
          frameRate: { max: 30 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('webkit-playsinline', 'true');
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch((err) => {
            console.error('Error playing video:', err);
          });
        };
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setCameraError('Camera access unavailable. You can still upload photos from your device.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setIsCameraActive(false);
    setIsAutoCapturing(false);
    setCountdown(0);
  };

  // Trigger snapshot from video
  const snapPhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    // Mirror image for natural selfie feel
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/jpeg', 0.95);

    // Flash effect
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 150);

    if (activeSlotToReplace !== null) {
      // Replace specific slot
      setPhotos((prev) => {
        const next = [...prev];
        next[activeSlotToReplace] = imageData;
        return next;
      });
      setActiveSlotToReplace(null);
      setIsAutoCapturing(false);
    } else {
      // Append next photo
      setPhotos((prev) => {
        const next = [...prev, imageData];
        if (next.length >= photoCount) {
          setIsAutoCapturing(false);
        } else if (isAutoCapturing) {
          // Schedule next auto capture in 3 seconds
          setCountdown(3);
        }
        return next;
      });
    }
  };

  const startAutoCapture = () => {
    if (photos.length >= photoCount) {
      setPhotos([]);
    }
    setActiveSlotToReplace(null);
    setIsAutoCapturing(true);
    setCountdown(3);
  };

  const stopAutoCapture = () => {
    setIsAutoCapturing(false);
    setCountdown(0);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imgUrl = event.target.result;
      if (activeSlotToReplace !== null) {
        setPhotos((prev) => {
          const next = [...prev];
          next[activeSlotToReplace] = imgUrl;
          return next;
        });
        setActiveSlotToReplace(null);
      } else {
        setPhotos((prev) => {
          if (prev.length < photoCount) {
            return [...prev, imgUrl];
          }
          return prev;
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSlotClick = (slotIdx) => {
    setActiveSlotToReplace(slotIdx);
  };

  const clearAllPhotos = () => {
    setPhotos([]);
    setActiveSlotToReplace(null);
    setIsAutoCapturing(false);
    setCountdown(0);
  };

  const retakeFromStart = () => {
    setAppStage('capture');
    setPhotos([]);
    setActiveSlotToReplace(null);
    setDownloadSuccess(false);
  };

  // Standalone high-quality export targeting ONLY the photostrip element
  const downloadPhotostrip = async () => {
    if (!exportStripRef.current) return;
    setIsExporting(true);

    try {
      const element = exportStripRef.current;
      
      // html2canvas rasterizes ONLY the isolated photostrip container
      const canvas = await html2canvas(element, {
        backgroundColor: null, // Transparent outer background so no surrounding bleed
        scale: 3, // Crisp high-definition export
        useCORS: true,
        logging: false,
      });

      const link = document.createElement('a');
      link.download = `photobooth-strip-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const filledCount = photos.filter(Boolean).length;
  const isComplete = filledCount === photoCount;

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      {/* Top Header Bar */}
      <header className="bg-curtain py-4 px-6 flex items-center justify-between border-b-2 border-curtain-dark shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-paper/80 hover:text-paper text-sm font-medium transition"
          >
            ← Home
          </button>
          <div className="w-px h-5 bg-paper/20" />
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-paper" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h1 className="font-display font-semibold text-xl text-paper tracking-wide">
              Photo Booth Studio
            </h1>
          </div>
        </div>

        {/* Step Tabs / Action Button */}
        <div className="flex items-center gap-3">
          {appStage === 'capture' ? (
            <button
              onClick={() => setAppStage('result')}
              disabled={filledCount === 0}
              className={`font-display text-xs font-semibold py-2 px-5 rounded-full transition-all shadow-sm ${
                filledCount > 0
                  ? 'bg-marquee text-ink hover:brightness-105 active:scale-95'
                  : 'bg-paper/20 text-paper/40 cursor-not-allowed'
              }`}
            >
              View Finished Strip ({filledCount}/{photoCount}) →
            </button>
          ) : (
            <button
              onClick={() => setAppStage('capture')}
              className="bg-paper/20 text-paper hover:bg-paper/30 font-display text-xs font-semibold py-2 px-4 rounded-full transition"
            >
              ← Edit & Retake
            </button>
          )}
        </div>
      </header>

      <div className="h-2 marquee-lights bg-curtain" />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        {/* ================= STAGE 1: CAPTURE & CUSTOMIZE ================= */}
        {appStage === 'capture' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Settings Panel */}
            <div className="lg:col-span-4 order-2 lg:order-1">
              <SettingsPanel
                photoCount={photoCount}
                onPhotoCountChange={handlePhotoCountChange}
                selectedLayout={selectedLayout}
                onLayoutChange={handleLayoutChange}
                bgColor={bgColor}
                onBgColorChange={setBgColor}
                stickerSet={stickerSet}
                onStickerSetChange={setStickerSet}
                watermarkText={watermarkText}
                onWatermarkTextChange={setWatermarkText}
              />
            </div>

            {/* Middle Column: Camera & Controls */}
            <div className="lg:col-span-4 order-1 lg:order-2 flex flex-col items-center">
              <div className="w-full max-w-md bg-ink rounded-3xl p-3.5 shadow-xl border-4 border-ink">
                {/* Camera Viewfinder */}
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3] flex items-center justify-center">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover block"
                    style={{ transform: 'scaleX(-1)' }}
                    playsInline
                    muted
                  />

                  {/* Flash Animation */}
                  {isFlashing && (
                    <div className="absolute inset-0 bg-white z-20 animate-fade-out" />
                  )}

                  {/* Countdown Overlay */}
                  {countdown > 0 && (
                    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-ink/60 backdrop-blur-xs">
                      <span className="font-display text-marquee text-8xl font-bold animate-ping">
                        {countdown}
                      </span>
                      <span className="text-paper text-xs uppercase tracking-widest mt-2">
                        Get Ready!
                      </span>
                    </div>
                  )}

                  {/* Camera Offline Warning */}
                  {cameraError && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-ink/90 text-paper">
                      <p className="text-xs text-paper/80 mb-3">{cameraError}</p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-marquee text-ink font-semibold text-xs py-2 px-4 rounded-full"
                      >
                        Upload Photo File
                      </button>
                    </div>
                  )}

                  {/* Active slot indicator overlay */}
                  {activeSlotToReplace !== null && (
                    <div className="absolute top-2 left-2 z-20 bg-curtain text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
                      Snapping Slot #{activeSlotToReplace + 1}
                    </div>
                  )}
                </div>
              </div>

              {/* Shutter & Capture Controls */}
              <div className="flex flex-col items-center gap-3 mt-5 w-full max-w-md">
                <div className="flex items-center justify-center gap-5">
                  {/* File Upload Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Upload image from device"
                    className="w-11 h-11 rounded-full bg-white border border-ink/15 text-ink/70 flex items-center justify-center hover:text-curtain hover:border-curtain transition shadow-sm"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {/* Main Shutter Button */}
                  <button
                    onClick={snapPhoto}
                    disabled={(!isCameraActive && !cameraError) || (photos.length >= photoCount && activeSlotToReplace === null)}
                    aria-label="Capture photo"
                    className={`w-20 h-20 rounded-full bg-curtain border-4 border-white shadow-[0_4px_0_0_#8f1836] flex items-center justify-center hover:scale-105 active:translate-y-1 active:shadow-none transition-all ${
                      photos.length >= photoCount && activeSlotToReplace === null ? 'opacity-40 cursor-not-allowed' : ''
                    }`}
                  >
                    <span className="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center">
                      <span className="w-11 h-11 rounded-full bg-curtain/10 border-2 border-curtain" />
                    </span>
                  </button>

                  {/* Auto Capture Timer Button */}
                  {!isAutoCapturing ? (
                    <button
                      onClick={startAutoCapture}
                      title="Auto capture all photos (3s timer)"
                      className="w-11 h-11 rounded-full bg-white border border-ink/15 text-ink/70 flex items-center justify-center hover:text-curtain hover:border-curtain transition shadow-sm font-display text-xs font-semibold"
                    >
                      3s
                    </button>
                  ) : (
                    <button
                      onClick={stopAutoCapture}
                      title="Stop auto capture"
                      className="w-11 h-11 rounded-full bg-ink text-paper flex items-center justify-center hover:bg-ink/90 transition shadow-sm text-xs font-bold"
                    >
                      ■
                    </button>
                  )}
                </div>

                {/* Status Bar */}
                <div className="flex items-center justify-between w-full px-4 py-2 bg-white/70 rounded-full border border-ink/10 text-xs">
                  <span className="font-medium text-ink/70">
                    Photos: <strong className="text-curtain">{filledCount}</strong> / {photoCount}
                  </span>
                  
                  {filledCount > 0 && (
                    <button
                      onClick={clearAllPhotos}
                      className="text-ink/50 hover:text-curtain text-[11px] underline transition"
                    >
                      Clear all photos
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Standalone Live Photostrip Preview */}
            <div className="lg:col-span-4 order-3 flex flex-col items-center">
              <div className="mb-2 text-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink/60">
                  Live Strip Preview
                </span>
                <p className="text-[11px] text-ink/40">
                  Click any slot to retake or replace that photo
                </p>
              </div>

              {/* ISOLATED PREVIEW CONTAINER: Clean subtle workbench without artificial giant white containers */}
              <div className="w-full flex justify-center py-4 px-2">
                <div className="transition-transform duration-300 hover:scale-[1.01]">
                  <PhotoStrip
                    photos={photos}
                    layout={selectedLayout}
                    bgColor={bgColor}
                    stickerSet={stickerSet}
                    watermarkText={watermarkText}
                    activeSlotIndex={activeSlotToReplace}
                    onSlotClick={handleSlotClick}
                  />
                </div>
              </div>

              {filledCount > 0 && (
                <button
                  onClick={() => setAppStage('result')}
                  className="mt-4 w-full max-w-[280px] bg-marquee text-ink font-display font-semibold py-3 px-6 rounded-full shadow-[0_4px_0_0_#8f1836] hover:translate-y-0.5 hover:shadow-[0_2px_0_0_#8f1836] active:translate-y-1 active:shadow-none transition-all text-sm text-center"
                >
                  {isComplete ? 'View Finished Keepsake' : `Preview Strip (${filledCount}/${photoCount})`}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ================= STAGE 2: FINAL RESULT SCREEN ================= */}
        {appStage === 'result' && (
          <div className="max-w-4xl mx-auto flex flex-col items-center py-4">
            {/* Header info */}
            <div className="text-center mb-6">
              <h2 className="font-display font-semibold text-3xl text-ink">
                Your Photobooth Keepsake
              </h2>
              <p className="text-sm text-ink/60 mt-1">
                Here is your standalone print ready to save or share!
              </p>
            </div>

            {/* STANDALONE PHOTOSTRIP HERO: Strictly the photostrip, perfectly centered with realistic physical print shadow */}
            <div className="my-6 flex justify-center items-center w-full">
              <div className="relative transform hover:rotate-0 transition-transform duration-300">
                <PhotoStrip
                  ref={exportStripRef}
                  photos={photos}
                  layout={selectedLayout}
                  bgColor={bgColor}
                  stickerSet={stickerSet}
                  watermarkText={watermarkText}
                  isExporting={isExporting}
                  shadow={true}
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
              <button
                onClick={() => setAppStage('capture')}
                className="bg-white border-2 border-ink/20 text-ink font-display font-semibold py-3 px-7 rounded-full hover:border-ink/40 transition shadow-sm text-sm"
              >
                ← Back to Edit
              </button>

              <button
                onClick={downloadPhotostrip}
                disabled={isExporting}
                className="bg-curtain text-paper font-display font-semibold py-3 px-9 rounded-full shadow-[0_4px_0_0_#8f1836] hover:translate-y-0.5 hover:shadow-[0_2px_0_0_#8f1836] active:translate-y-1 active:shadow-none transition-all text-sm flex items-center gap-2"
              >
                {isExporting ? (
                  <span>Generating Print...</span>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Download Photostrip</span>
                  </>
                )}
              </button>

              <button
                onClick={retakeFromStart}
                className="bg-paper border border-ink/15 text-ink/70 font-medium py-3 px-6 rounded-full hover:bg-ink/5 transition text-xs"
              >
                Start New Strip
              </button>
            </div>

            {downloadSuccess && (
              <div className="mt-4 px-4 py-2 bg-mint/20 border border-mint text-ink font-medium text-xs rounded-full flex items-center gap-1.5 animate-bounce">
                <svg className="w-4 h-4 text-ink" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Photostrip downloaded successfully!</span>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} hidden />
    </div>
  );
};

export default Photobooth;
