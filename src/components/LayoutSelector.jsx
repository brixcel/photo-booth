import React from 'react';
import { getLayoutsForCount } from '../config/layouts';

const LayoutSelector = ({ photoCount, selectedLayoutId, onSelectLayout }) => {
  const availableLayouts = getLayoutsForCount(photoCount);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-ink/70">
          Choose Arrangement ({availableLayouts.length} {availableLayouts.length === 1 ? 'option' : 'options'})
        </label>
        <span className="text-xs font-medium text-curtain bg-curtain/10 px-2 py-0.5 rounded-full">
          {photoCount} {photoCount === 1 ? 'Photo' : 'Photos'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 max-h-[320px] overflow-y-auto pr-1">
        {availableLayouts.map((layout) => {
          const isSelected = selectedLayoutId === layout.id;

          return (
            <button
              key={layout.id}
              type="button"
              onClick={() => onSelectLayout(layout)}
              className={`group text-left p-2.5 rounded-xl border-2 transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'border-curtain bg-curtain/5 shadow-sm ring-2 ring-curtain/20'
                  : 'border-ink/10 bg-white/70 hover:border-ink/30 hover:bg-white'
              }`}
            >
              {/* Visual Mini-Preview */}
              <div className="w-full h-20 bg-paper/60 rounded-lg p-1.5 flex items-center justify-center overflow-hidden border border-ink/5 mb-2 relative group-hover:bg-paper transition-colors">
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full max-h-16"
                  style={{
                    filter: isSelected
                      ? 'drop-shadow(0 2px 4px rgba(196, 35, 75, 0.2))'
                      : 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.08))',
                  }}
                >
                  {/* Outer Strip preview */}
                  <rect
                    x="2"
                    y="2"
                    width="96"
                    height="96"
                    rx="4"
                    fill={isSelected ? '#ffffff' : '#fafafa'}
                    stroke={isSelected ? '#C4234B' : '#d1d5db'}
                    strokeWidth="1.5"
                  />

                  {/* Filmstrip perforations if layout is filmstrip */}
                  {layout.isFilmstrip && (
                    <>
                      <circle cx="5" cy="15" r="1.5" fill="#9ca3af" />
                      <circle cx="5" cy="50" r="1.5" fill="#9ca3af" />
                      <circle cx="5" cy="85" r="1.5" fill="#9ca3af" />
                      <circle cx="95" cy="15" r="1.5" fill="#9ca3af" />
                      <circle cx="95" cy="50" r="1.5" fill="#9ca3af" />
                      <circle cx="95" cy="85" r="1.5" fill="#9ca3af" />
                    </>
                  )}

                  {/* Layout Slots */}
                  {layout.thumbnailSlots?.map((slot, sIdx) => (
                    <rect
                      key={sIdx}
                      x={slot.x}
                      y={slot.y}
                      width={slot.w}
                      height={slot.h}
                      rx="2"
                      fill={
                        isSelected
                          ? slot.isFeatured
                            ? '#C4234B'
                            : '#FF8FB1'
                          : slot.isFeatured
                          ? '#4b5563'
                          : '#9ca3af'
                      }
                      fillOpacity={slot.isFeatured ? '0.85' : '0.55'}
                      stroke={isSelected ? '#8F1836' : '#6b7280'}
                      strokeWidth="0.8"
                    />
                  ))}
                </svg>

                {isSelected && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-curtain text-white rounded-full flex items-center justify-center shadow-sm">
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
              </div>

              {/* Layout Label and Category */}
              <div>
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span
                    className={`text-xs font-semibold leading-tight line-clamp-1 ${
                      isSelected ? 'text-curtain' : 'text-ink'
                    }`}
                  >
                    {layout.name}
                  </span>
                </div>
                <span className="text-[10px] font-medium text-ink/50 uppercase tracking-wider block">
                  {layout.category}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LayoutSelector;
