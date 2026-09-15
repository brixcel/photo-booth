import { useNavigate } from 'react-router-dom'

const sampleStickers = ['/stickers/mikasa-bg.png', '/stickers/eren-bg.png', '/stickers/levi-bg.png']

function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-curtain flex flex-col overflow-x-hidden">
      <div className="h-3 marquee-lights" />

      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-16 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <h1 className="font-display text-5xl md:text-6xl font-semibold text-paper leading-tight">
            Step into
            <br />
            the booth.
          </h1>
          <p className="mt-6 text-paper/80 text-lg max-w-sm">
            Snap a strip of photos, decorate it with stickers, and take home a
            keepsake &mdash; all from your browser, no app required.
          </p>
          <button
            onClick={() => navigate('/booth')}
            className="mt-10 bg-marquee text-ink font-display font-semibold text-lg px-9 py-4 rounded-full shadow-[0_6px_0_0_#8f1836] hover:translate-y-0.5 hover:shadow-[0_4px_0_0_#8f1836] active:translate-y-1 active:shadow-none transition-all"
          >
            Start the booth
          </button>
        </div>

        <div className="flex justify-center md:justify-end">
          <div className="relative -rotate-6">
            <div className="absolute -top-3 -left-4 w-14 h-6 bg-paper/70 rotate-[-8deg] shadow-sm" />
            <div className="absolute -top-3 -right-6 w-14 h-6 bg-paper/70 rotate-[10deg] shadow-sm" />

            <div className="bg-white p-3 pb-5 rounded-sm shadow-2xl w-48">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="relative bg-ink/90 rounded-[2px] overflow-hidden mb-2 last:mb-0"
                  style={{ aspectRatio: '4 / 5' }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        i === 0
                          ? 'linear-gradient(135deg,#C4234B,#8F1836)'
                          : i === 1
                          ? 'linear-gradient(135deg,#FF8FB1,#C4234B)'
                          : 'linear-gradient(135deg,#E8B23D,#C4234B)',
                    }}
                  />
                  <img
                    src={sampleStickers[i]}
                    alt=""
                    className="absolute bottom-1 right-1 w-7 h-7 drop-shadow"
                  />
                </div>
              ))}
              <p className="text-center font-display text-ink/70 text-xs mt-2">
                sept. 2026
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="h-3 marquee-lights" />
    </div>
  )
}

export default Landing
