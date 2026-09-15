import { PHOTO_COUNTS, COLOR_PRESETS, STICKER_SETS } from './config/layouts';
import LayoutSelector from './components/LayoutSelector';

const SettingsPanel = ({
  photoCount,
  onPhotoCountChange,
  selectedLayout,
  onLayoutChange,
  bgColor,
  onBgColorChange,
  stickerSet,
  onStickerSetChange,
  watermarkText,
  onWatermarkTextChange,
}) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm border border-ink/10 rounded-2xl p-5 shadow-sm space-y-6">
      {/* 1. Photo Count Selection */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-2.5">
          1. Number of Photos
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {PHOTO_COUNTS.map((count) => {
            const isSelected = photoCount === count;
            return (
              <button
                key={count}
                type="button"
                onClick={() => onPhotoCountChange(count)}
                className={`py-2 text-center rounded-xl font-display font-semibold text-sm transition-all ${
                  isSelected
                    ? 'bg-curtain text-white shadow-sm ring-2 ring-curtain/30 scale-[1.02]'
                    : 'bg-paper text-ink/80 hover:bg-ink/5 border border-ink/5'
                }`}
              >
                {count} {count === 1 ? 'Pic' : 'Pics'}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Visual Layout Selector */}
      <div>
        <LayoutSelector
          photoCount={photoCount}
          selectedLayoutId={selectedLayout?.id}
          onSelectLayout={onLayoutChange}
        />
      </div>

      {/* 3. Strip Color Selection */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-ink/70">
            2. Strip Color
          </label>
          <span className="text-[11px] font-mono text-ink/50 uppercase">{bgColor}</span>
        </div>
        
        <div className="grid grid-cols-5 gap-2 mb-3">
          {COLOR_PRESETS.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => onBgColorChange(color.value)}
              className={`w-9 h-9 rounded-full border-2 transition-transform ${
                bgColor === color.value
                  ? 'border-curtain scale-110 shadow-md ring-2 ring-curtain/30'
                  : 'border-ink/10 hover:scale-105'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.label}
              aria-label={`Select ${color.label}`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="color"
            value={bgColor.startsWith('#') && bgColor.length === 7 ? bgColor : '#ffffff'}
            onChange={(e) => onBgColorChange(e.target.value)}
            className="w-8 h-8 rounded-lg border border-ink/10 cursor-pointer p-0.5"
            title="Custom color picker"
          />
          <span className="text-xs text-ink/60">Custom color picker</span>
        </div>
      </div>

      {/* 4. Sticker Pack Selection */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-2">
          3. Sticker Pack
        </label>
        <div className="flex flex-wrap gap-2">
          {STICKER_SETS.map((pack) => (
            <button
              key={pack.id}
              type="button"
              onClick={() => onStickerSetChange(pack.id)}
              className={`px-3.5 py-1.5 rounded-full border text-xs font-medium transition ${
                stickerSet === pack.id
                  ? 'border-curtain bg-curtain/10 text-curtain font-semibold'
                  : 'border-ink/15 text-ink/70 hover:border-ink/30 bg-white'
              }`}
            >
              {pack.name}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Custom Date / Watermark Footer */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-2">
          4. Strip Caption / Date
        </label>
        <input
          type="text"
          value={watermarkText}
          onChange={(e) => onWatermarkTextChange(e.target.value)}
          placeholder={new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          className="w-full px-3 py-2 bg-paper/50 border border-ink/15 rounded-lg text-xs text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-curtain/30 focus:border-curtain"
        />
      </div>
    </div>
  );
};

export default SettingsPanel;
