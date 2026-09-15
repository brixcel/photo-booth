import React from 'react';

const PhotoStrip = React.forwardRef(({
  photos = [],
  layout,
  bgColor = '#FFF7EF',
  stickerSet = 'aot',
  watermarkText = '',
  activeSlotIndex = null,
  onSlotClick = null,
  isExporting = false,
  shadow = true,
}, ref) => {
  if (!layout) return null;

  // Available stickers
  const stickers = [
    '/stickers/mikasa-bg.png',
    '/stickers/levi-bg.png',
    '/stickers/eren-bg.png',
    '/stickers/annie-bg.png',
  ];

  // Sticker placements per slot to look natural and cute
  const getStickerForSlot = (index) => {
    if (stickerSet === 'none') return null;
    const stickerSrc = stickers[index % stickers.length];
    
    // Vary corners for visual balance
    const positions = [
      { bottom: '4px', right: '4px', transform: 'rotate(6deg)' },
      { top: '4px', right: '4px', transform: 'rotate(-8deg)' },
      { bottom: '4px', left: '4px', transform: 'rotate(-4deg)' },
      { top: '4px', left: '4px', transform: 'rotate(8deg)' },
    ];
    const pos = positions[index % positions.length];

    return {
      src: stickerSrc,
      style: {
        position: 'absolute',
        width: '38px',
        height: '38px',
        zIndex: 10,
        pointerEvents: 'none',
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))',
        ...pos,
      },
    };
  };

  // Determine text color brightness based on bgColor
  const isDarkBg = () => {
    if (!bgColor || bgColor.startsWith('linear')) return false;
    if (bgColor === '#18181B' || bgColor === '#211A1D' || bgColor === '#4A1525' || bgColor === '#C4234B') {
      return true;
    }
    return false;
  };

  const dark = isDarkBg();
  const textColor = dark ? '#ffffff' : '#211A1D';
  const subTextColor = dark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(33, 26, 29, 0.6)';
  const innerCardBg = dark ? 'rgba(255, 255, 255, 0.1)' : '#ffffff';

  return (
    <div
      ref={ref}
      id="photostrip-canvas"
      className={`photostrip-container relative transition-all select-none ${
        shadow && !isExporting ? 'shadow-2xl' : ''
      }`}
      style={{
        width: '100%',
        maxWidth: `${layout.stripWidth}px`,
        backgroundColor: bgColor,
        padding: layout.isFilmstrip ? '14px 18px' : '14px',
        borderRadius: layout.isFilmstrip ? '4px' : '8px',
        boxSizing: 'border-box',
        display: 'inline-block',
        color: textColor,
      }}
    >
      {/* 35mm Filmstrip decorative sprockets if filmstrip layout */}
      {layout.isFilmstrip && (
        <>
          <div className="absolute top-0 bottom-0 left-1.5 w-2 flex flex-col justify-between py-2 pointer-events-none opacity-40">
            {Array.from({ length: 14 }).map((_, i) => (
              <div key={`sprocket-l-${i}`} className="w-2 h-3 rounded-[1px] bg-ink/70 my-0.5" />
            ))}
          </div>
          <div className="absolute top-0 bottom-0 right-1.5 w-2 flex flex-col justify-between py-2 pointer-events-none opacity-40">
            {Array.from({ length: 14 }).map((_, i) => (
              <div key={`sprocket-r-${i}`} className="w-2 h-3 rounded-[1px] bg-ink/70 my-0.5" />
            ))}
          </div>
        </>
      )}

      {/* Main Grid / Slots Container */}
      <div
        className="photo-grid relative"
        style={{
          ...layout.containerStyle,
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {layout.slots.map((slotConfig, idx) => {
          const photoUrl = photos[idx];
          const hasPhoto = Boolean(photoUrl);
          const isCurrentActive = activeSlotIndex === idx;
          const slotSticker = hasPhoto ? getStickerForSlot(idx) : null;

          // Slot grid styling
          const slotStyle = {
            gridColumn: slotConfig.colSpan ? `span ${slotConfig.colSpan}` : 'auto',
            gridRow: slotConfig.rowSpan ? `span ${slotConfig.rowSpan}` : 'auto',
            aspectRatio: slotConfig.aspectRatio !== 'auto' ? slotConfig.aspectRatio : undefined,
            minHeight: slotConfig.aspectRatio === 'auto' ? '140px' : undefined,
          };

          return (
            <div
              key={idx}
              onClick={() => onSlotClick && onSlotClick(idx)}
              className={`relative overflow-hidden rounded-md transition-all ${
                onSlotClick && !isExporting ? 'cursor-pointer hover:opacity-95' : ''
              } ${isCurrentActive && !isExporting ? 'ring-2 ring-curtain ring-offset-2' : ''}`}
              style={{
                ...slotStyle,
                backgroundColor: innerCardBg,
                boxShadow: layout.isPolaroid
                  ? '0 3px 6px rgba(0,0,0,0.12)'
                  : '0 1px 3px rgba(0,0,0,0.08)',
                border: dark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.06)',
              }}
            >
              {hasPhoto ? (
                <>
                  <img
                    src={photoUrl}
                    alt={`Photobooth slot ${idx + 1}`}
                    className="w-full h-full object-cover block"
                    style={{
                      display: 'block',
                      width: '100%',
                      height: '100%',
                    }}
                  />

                  {/* Slot Sticker */}
                  {slotSticker && (
                    <img
                      src={slotSticker.src}
                      alt="sticker"
                      style={slotSticker.style}
                    />
                  )}
                </>
              ) : (
                /* Intentional, clean, aesthetically pleasing placeholder */
                <div
                  className="w-full h-full flex flex-col items-center justify-center p-3 text-center select-none"
                  style={{
                    backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
                    border: '1.5px dashed ' + (dark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.15)'),
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center mb-1.5"
                    style={{
                      backgroundColor: dark ? 'rgba(255,255,255,0.12)' : 'rgba(196, 35, 75, 0.1)',
                      color: dark ? '#ffffff' : '#C4234B',
                    }}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <span
                    className="text-[11px] font-medium tracking-wide"
                    style={{ color: subTextColor }}
                  >
                    Photo {idx + 1}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Photostrip Footer & Watermark */}
      <div
        className="photostrip-footer mt-3 pt-2 text-center"
        style={{
          borderTop: dark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.08)',
        }}
      >
        <div className="flex items-center justify-between px-1">
          <span
            className="text-[10px] font-semibold uppercase tracking-widest font-sans"
            style={{ color: subTextColor }}
          >
            PHOTOBOOTH
          </span>
          <span
            className="text-[11px] font-serif italic tracking-wide"
            style={{ color: textColor }}
          >
            {watermarkText || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>
    </div>
  );
});

PhotoStrip.displayName = 'PhotoStrip';

export default PhotoStrip;