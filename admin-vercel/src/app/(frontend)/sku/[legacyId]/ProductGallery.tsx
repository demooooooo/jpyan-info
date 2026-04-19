'use client'

import { useMemo, useState } from 'react'

type ProductGalleryProps = {
  images: string[]
}

export function ProductGallery({ images }: ProductGalleryProps) {
  const gallery = useMemo(() => [...new Set(images.filter(Boolean))], [images])
  const [activeIndex, setActiveIndex] = useState(0)

  if (!gallery.length) {
    return (
      <div className="relative bg-ink-3 border border-gold/10 aspect-square sm:aspect-video flex items-center justify-center overflow-hidden">
        <span className="text-[12px] text-muted/40">暂无图片</span>
      </div>
    )
  }

  const safeIndex = Math.min(activeIndex, gallery.length - 1)
  const currentImage = gallery[safeIndex]

  const move = (direction: 1 | -1) => {
    setActiveIndex((current) => {
      const next = current + direction
      if (next < 0) return gallery.length - 1
      if (next >= gallery.length) return 0
      return next
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative bg-ink-3 border border-gold/10 aspect-square sm:aspect-video flex items-center justify-center overflow-hidden">
        <img
          alt={`Image ${safeIndex + 1}`}
          className="max-h-full max-w-full object-contain p-4"
          key={currentImage}
          src={currentImage}
          style={{ animation: 'fadeUp 0.22s ease both' }}
        />
        {gallery.length > 1 ? (
          <>
            <button
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-ink/70 hover:bg-ink border border-gold/15 hover:border-gold/40 text-muted hover:text-gold transition-all flex items-center justify-center text-lg"
              onClick={() => move(-1)}
              type="button"
            >
              ‹
            </button>
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-ink/70 hover:bg-ink border border-gold/15 hover:border-gold/40 text-muted hover:text-gold transition-all flex items-center justify-center text-lg"
              onClick={() => move(1)}
              type="button"
            >
              ›
            </button>
          </>
        ) : null}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center">
          <span className="font-mono text-[10px] text-muted/60 bg-ink/80 px-2 py-0.5">
            {safeIndex + 1} / {gallery.length}
          </span>
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto [overscroll-behavior:contain] [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {gallery.map((imageUrl, index) => (
          <button
            className={`flex-shrink-0 w-14 h-14 bg-ink-3 border transition-colors overflow-hidden ${
              index === safeIndex ? 'border-gold/50' : 'border-gold/8 hover:border-gold/25'
            }`}
            key={`${imageUrl}-${index}`}
            onClick={() => setActiveIndex(index)}
            type="button"
          >
            <img alt={`Thumb ${index + 1}`} className="w-full h-full object-contain p-1" loading="lazy" src={imageUrl} />
          </button>
        ))}
      </div>
    </div>
  )
}
