'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { slugifyName, toTemplateImageUrl } from '@/lib/frontend-data'

const ROW_STEP = 282
const HERO_TEXT_WIDTH = 640
const HERO_TEXT_HEIGHT = 474
const TILE_WIDTH = 160
const TILE_HEIGHT = 192
const TILE_X_STEP = 240

type HeroProduct = {
  id: number | string
  legacyId?: number | string | null
  name?: string | null
  primaryImageUrl?: string | null
  gallery?: Array<{ imageUrl?: string | null }> | null
}

type HeroEntry = {
  id: number | string
  authorName?: string | null
  excerpt?: string | null
  title?: string | null
}

type ViewState = {
  scale: number
  x: number
  y: number
}

type PositionedProduct = HeroProduct & {
  col: number
  row: number
}

type HomeHeroProps = {
  brandCount: number
  entries: HeroEntry[]
  products: HeroProduct[]
  productCount: number
}

const createSpiral = (count: number) => {
  if (count === 0) return [] as Array<{ col: number; row: number }>

  const coords = [{ col: 0, row: 0 }]
  let col = 0
  let row = 0
  let legLength = 1

  while (coords.length < count) {
    for (let step = 0; step < legLength && coords.length < count; step += 1) {
      col += 1
      coords.push({ col, row })
    }

    for (let step = 0; step < legLength && coords.length < count; step += 1) {
      row += 1
      coords.push({ col, row })
    }

    legLength += 1

    for (let step = 0; step < legLength && coords.length < count; step += 1) {
      col -= 1
      coords.push({ col, row })
    }

    for (let step = 0; step < legLength && coords.length < count; step += 1) {
      row -= 1
      coords.push({ col, row })
    }

    legLength += 1
  }

  return coords
}

const buildGalleryLayout = (products: HeroProduct[], startOffset = 6) => {
  const spiral = createSpiral(products.length + startOffset)

  let minCol = 0
  let maxCol = 0
  let minRow = 0
  let maxRow = 0

  for (const point of spiral) {
    if (point.col < minCol) minCol = point.col
    if (point.col > maxCol) maxCol = point.col
    if (point.row < minRow) minRow = point.row
    if (point.row > maxRow) maxRow = point.row
  }

  const colOffset = -minCol
  const rowOffset = -minRow

  return {
    items: products.map((product, index) => {
      const point = spiral[startOffset + index]

      return {
        ...product,
        col: point.col + colOffset,
        row: point.row + rowOffset,
      }
    }),
    originX: colOffset * TILE_X_STEP,
    originY: rowOffset * ROW_STEP,
    gridHeight: (maxRow - minRow + 1) * ROW_STEP,
    gridWidth: (maxCol - minCol + 1) * TILE_X_STEP,
  }
}

const clampView = (next: ViewState, container: HTMLDivElement | null, minScale: number, gridWidth: number, gridHeight: number) => {
  if (!container) return next

  const scale = Math.max(minScale, Math.min(1.8, next.scale))
  const scaledWidth = gridWidth * scale
  const scaledHeight = gridHeight * scale

  let x: number
  if (scaledWidth >= container.clientWidth) {
    x = Math.max(container.clientWidth - scaledWidth, Math.min(0, next.x))
  } else {
    x = (container.clientWidth - scaledWidth) / 2
  }

  let y: number
  if (scaledHeight >= container.clientHeight) {
    y = Math.max(container.clientHeight - scaledHeight, Math.min(0, next.y))
  } else {
    y = (container.clientHeight - scaledHeight) / 2
  }

  return { scale, x, y }
}

const getVisibleIds = (items: PositionedProduct[], view: ViewState, width: number, height: number) => {
  const padX = 960
  const padY = 4 * ROW_STEP
  const minX = -view.x / view.scale - padX
  const maxX = (-view.x + width) / view.scale + padX
  const minY = -view.y / view.scale - padY
  const maxY = (-view.y + height) / view.scale + padY

  const ids = new Set<HeroProduct['id']>()

  for (const item of items) {
    const left = item.col * TILE_X_STEP
    const top = item.row * ROW_STEP

    if (left + TILE_WIDTH >= minX && left <= maxX && top + TILE_HEIGHT >= minY && top <= maxY) {
      ids.add(item.id)
    }
  }

  return ids
}

export function HomeHero({ brandCount, entries, products, productCount }: HomeHeroProps) {
  const layout = useMemo(() => buildGalleryLayout(products, 6), [products])
  const [view, setView] = useState<ViewState>({ scale: 0.1, x: 0, y: 0 })
  const [visibleIds, setVisibleIds] = useState<Set<HeroProduct['id']>>(new Set())
  const [loading, setLoading] = useState(true)
  const [activeModal, setActiveModal] = useState<'how' | 'why' | null>(null)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const minScaleRef = useRef(0.05)
  const currentViewRef = useRef<ViewState>({ scale: 0.1, x: 0, y: 0 })
  const lastSnapshotRef = useRef<ViewState>({ scale: 0.1, x: 0, y: 0 })
  const rafRef = useRef<number | null>(null)
  const dragRef = useRef({
    active: false,
    moved: false,
    startPointerX: 0,
    startPointerY: 0,
    startX: 0,
    startY: 0,
  })
  const touchRef = useRef<{ x: number; y: number } | null>(null)
  const pinchRef = useRef<number | null>(null)
  const keyStateRef = useRef(new Set<string>())

  const syncVisible = useCallback(
    (nextView: ViewState) => {
      const container = containerRef.current
      if (!container) return

      setVisibleIds(getVisibleIds(layout.items, nextView, container.clientWidth, container.clientHeight))
    },
    [layout.items],
  )

  const applyView = useCallback(
    (nextView: ViewState) => {
      currentViewRef.current = nextView
      lastSnapshotRef.current = nextView

      if (contentRef.current) {
        contentRef.current.style.transform = `translate(${nextView.x}px, ${nextView.y}px) scale(${nextView.scale})`
      }

      setView(nextView)
      syncVisible(nextView)
    },
    [syncVisible],
  )

  const queueView = useCallback(
    (nextView: ViewState) => {
      currentViewRef.current = nextView

      if (contentRef.current) {
        contentRef.current.style.transform = `translate(${nextView.x}px, ${nextView.y}px) scale(${nextView.scale})`
      }

      if (rafRef.current == null) {
        rafRef.current = window.requestAnimationFrame(() => {
          rafRef.current = null

          const current = currentViewRef.current
          setView(current)

          const previous = lastSnapshotRef.current
          const deltaX = Math.abs(current.x - previous.x) / Math.max(current.scale, 0.0001)
          const deltaY = Math.abs(current.y - previous.y) / Math.max(current.scale, 0.0001)
          const deltaScale = Math.abs(current.scale - previous.scale) / Math.max(previous.scale || 1, 0.0001)

          if (deltaX > 72 || deltaY > 0.3 * ROW_STEP || deltaScale > 0.03) {
            lastSnapshotRef.current = current
            syncVisible(current)
          }
        })
      }
    },
    [syncVisible],
  )

  const normalizeView = useCallback(
    (nextView: ViewState) => clampView(nextView, containerRef.current, minScaleRef.current, layout.gridWidth, layout.gridHeight),
    [layout.gridHeight, layout.gridWidth],
  )

  useEffect(() => {
    try {
      const container = containerRef.current
      if (!container) return

      const clientWidth = container.clientWidth
      const clientHeight = container.clientHeight

      minScaleRef.current = Math.max(Math.min(clientWidth / layout.gridWidth, clientHeight / layout.gridHeight), clientWidth < 640 ? 0.24 : 0.28)

      const defaultScale = 1.8 / (1.33 * 1.33)
      const heroScale = Math.min(0.88 * clientWidth / 840, (0.75 * clientHeight) / (2.8 * ROW_STEP))
      const scale = Math.min(defaultScale, Math.max(heroScale, minScaleRef.current))

      const initialView = normalizeView({
        scale,
        x: clientWidth / 2 - (layout.originX + 80) * scale,
        y: clientHeight / 2 - (layout.originY + HERO_TEXT_HEIGHT / 2) * scale,
      })

      applyView(initialView)
      setLoading(false)
    } catch {
      setLoading(false)
    }
  }, [applyView, layout.gridHeight, layout.gridWidth, layout.originX, layout.originY, normalizeView])

  useEffect(() => {
    document.body.style.overflow = activeModal ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [activeModal])

  useEffect(() => {
    const handleKeyFrame = () => {
      const activeKeys = keyStateRef.current
      if (activeKeys.size === 0) return null

      const container = containerRef.current
      if (!container) return window.requestAnimationFrame(handleKeyFrame)

      let next = currentViewRef.current
      let panX = 0
      let panY = 0
      let scaleFactor = 1

      if (activeKeys.has('a')) panX += 10
      if (activeKeys.has('d')) panX -= 10
      if (activeKeys.has('w')) panY += 10
      if (activeKeys.has('s')) panY -= 10
      if (activeKeys.has('q')) scaleFactor = 0.9727626459143969
      if (activeKeys.has('e')) scaleFactor = 1.028

      if (scaleFactor !== 1) {
        const centerX = container.clientWidth / 2
        const centerY = container.clientHeight / 2
        const nextScale = Math.max(minScaleRef.current, Math.min(1.8, next.scale * scaleFactor))
        const ratio = nextScale / next.scale

        next = normalizeView({
          scale: nextScale,
          x: centerX - (centerX - next.x) * ratio,
          y: centerY - (centerY - next.y) * ratio,
        })
      } else {
        next = normalizeView({
          ...next,
          x: next.x + panX,
          y: next.y + panY,
        })
      }

      queueView(next)

      return window.requestAnimationFrame(handleKeyFrame)
    }

    let frame: number | null = null

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null

      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable) return

      const key = event.key.toLowerCase()
      if (!['w', 'a', 's', 'd', 'q', 'e'].includes(key)) return

      event.preventDefault()
      if (!keyStateRef.current.has(key)) {
        keyStateRef.current.add(key)
        if (frame == null) frame = window.requestAnimationFrame(handleKeyFrame)
      }
    }

    const onKeyUp = (event: KeyboardEvent) => {
      keyStateRef.current.delete(event.key.toLowerCase())
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      if (frame != null) window.cancelAnimationFrame(frame)
      keyStateRef.current.clear()
    }
  }, [normalizeView, queueView])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      const current = currentViewRef.current

      if (event.ctrlKey) {
        const rect = container.getBoundingClientRect()
        const localX = event.clientX - rect.left
        const localY = event.clientY - rect.top
        const nextScale = Math.max(minScaleRef.current, Math.min(1.8, current.scale * (event.deltaY < 0 ? 1.12 : 0.89)))
        const ratio = nextScale / current.scale

        queueView(
          normalizeView({
            scale: nextScale,
            x: localX - (localX - current.x) * ratio,
            y: localY - (localY - current.y) * ratio,
          }),
        )
      } else {
        queueView(
          normalizeView({
            ...current,
            x: current.x - event.deltaX,
            y: current.y - event.deltaY,
          }),
        )
      }
    }

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        touchRef.current = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY,
        }
      }

      if (event.touches.length === 2) {
        pinchRef.current = Math.hypot(
          event.touches[0].clientX - event.touches[1].clientX,
          event.touches[0].clientY - event.touches[1].clientY,
        )
      }
    }

    const onTouchMove = (event: TouchEvent) => {
      event.preventDefault()

      if (event.touches.length === 1 && touchRef.current) {
        const deltaX = event.touches[0].clientX - touchRef.current.x
        const deltaY = event.touches[0].clientY - touchRef.current.y

        touchRef.current = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY,
        }

        queueView(
          normalizeView({
            ...currentViewRef.current,
            x: currentViewRef.current.x + deltaX,
            y: currentViewRef.current.y + deltaY,
          }),
        )
      }

      if (event.touches.length === 2 && pinchRef.current) {
        const currentDistance = Math.hypot(
          event.touches[0].clientX - event.touches[1].clientX,
          event.touches[0].clientY - event.touches[1].clientY,
        )
        const ratio = currentDistance / pinchRef.current
        pinchRef.current = currentDistance

        const rect = container.getBoundingClientRect()
        const localX = (event.touches[0].clientX + event.touches[1].clientX) / 2 - rect.left
        const localY = (event.touches[0].clientY + event.touches[1].clientY) / 2 - rect.top
        const current = currentViewRef.current
        const nextScale = Math.max(minScaleRef.current, Math.min(1.8, current.scale * ratio))
        const scaleRatio = nextScale / current.scale

        queueView(
          normalizeView({
            scale: nextScale,
            x: localX - (localX - current.x) * scaleRatio,
            y: localY - (localY - current.y) * scaleRatio,
          }),
        )
      }
    }

    const clearTouch = () => {
      touchRef.current = null
      pinchRef.current = null
    }

    container.addEventListener('wheel', onWheel, { passive: false })
    container.addEventListener('touchstart', onTouchStart, { passive: true })
    container.addEventListener('touchmove', onTouchMove, { passive: false })
    container.addEventListener('touchend', clearTouch, { passive: true })

    return () => {
      container.removeEventListener('wheel', onWheel)
      container.removeEventListener('touchstart', onTouchStart)
      container.removeEventListener('touchmove', onTouchMove)
      container.removeEventListener('touchend', clearTouch)
    }
  }, [normalizeView, queueView])

  useEffect(() => () => {
    if (rafRef.current != null) {
      window.cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const handleMouseDown: React.MouseEventHandler<HTMLDivElement> = (event) => {
    if (event.button !== 0) return

    dragRef.current = {
      active: true,
      moved: false,
      startPointerX: event.clientX,
      startPointerY: event.clientY,
      startX: currentViewRef.current.x,
      startY: currentViewRef.current.y,
    }
  }

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (event) => {
    if (!dragRef.current.active) return

    const deltaX = event.clientX - dragRef.current.startPointerX
    const deltaY = event.clientY - dragRef.current.startPointerY

    if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
      dragRef.current.moved = true
    }

    queueView(
      normalizeView({
        ...currentViewRef.current,
        x: dragRef.current.startX + deltaX,
        y: dragRef.current.startY + deltaY,
      }),
    )
  }

  const handleMouseUp = () => {
    dragRef.current.active = false
  }

  const zoomAroundCenter = (factor: number) => {
    const container = containerRef.current
    if (!container) return

    const centerX = container.clientWidth / 2
    const centerY = container.clientHeight / 2
    const current = currentViewRef.current
    const nextScale = Math.max(minScaleRef.current, Math.min(1.8, current.scale * factor))
    const ratio = nextScale / current.scale

    applyView(
      normalizeView({
        scale: nextScale,
        x: centerX - (centerX - current.x) * ratio,
        y: centerY - (centerY - current.y) * ratio,
      }),
    )
  }

  return (
    <>
      <section className="relative h-[calc(100vh-56px)]">
        <div className="relative w-full h-full bg-ink overflow-hidden">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-20">
              <div className="flex gap-1">
                {[0, 1, 2].map((dot) => (
                  <div className="w-1.5 h-1.5 rounded-full bg-muted/30 animate-pulse" key={dot} style={{ animationDelay: `${dot * 140}ms` }} />
                ))}
              </div>
              <span className="text-muted/40 text-[11px] tracking-wide">Loading archive…</span>
            </div>
          ) : null}

          <div className="absolute bottom-5 left-5 z-10 flex items-center gap-2">
            <div
              className="flex items-center rounded-xl overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(0,0,0,0.08)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}
            >
              <button
                aria-label="Zoom out"
                className="w-9 h-9 flex items-center justify-center text-ash/50 hover:text-ash hover:bg-black/[0.04] transition-colors text-lg leading-none select-none"
                onClick={() => zoomAroundCenter(0.75)}
                type="button"
              >
                −
              </button>
              <div className="w-px h-4 bg-black/[0.08]" />
              <button
                aria-label="Zoom in"
                className="w-9 h-9 flex items-center justify-center text-ash/50 hover:text-ash hover:bg-black/[0.04] transition-colors text-lg leading-none select-none"
                onClick={() => zoomAroundCenter(1.33)}
                type="button"
              >
                +
              </button>
            </div>
            <span className="text-[11px] text-muted/40 pointer-events-none tabular-nums" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {Math.round(view.scale * 100)}%
            </span>
          </div>

          <div
            className="absolute inset-0"
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseUp}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            ref={containerRef}
            style={{ cursor: dragRef.current.active ? 'grabbing' : 'grab' }}
          >
            <div
              ref={contentRef}
              style={{
                position: 'absolute',
                transformOrigin: '0 0',
                willChange: 'transform',
              }}
            >
              {layout.items.map((product) => {
                const imageUrl = toTemplateImageUrl(product.primaryImageUrl || product.gallery?.[0]?.imageUrl, 'products')

                return (
                  <div
                    className="gallery-item"
                    key={product.id}
                    onClick={() => {
                      if (dragRef.current.moved) return
                      window.location.href = `/sku/${product.legacyId}`
                    }}
                    style={{
                      cursor: 'pointer',
                      display: visibleIds.has(product.id) ? 'block' : 'none',
                      height: TILE_HEIGHT,
                      left: product.col * TILE_X_STEP,
                      position: 'absolute',
                      top: product.row * ROW_STEP,
                      width: TILE_WIDTH,
                    }}
                  >
                    <div style={{ height: 170, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                      {imageUrl ? (
                        <img
                          alt=""
                          draggable="false"
                          src={imageUrl}
                          style={{
                            display: 'block',
                            height: 'auto',
                            maxHeight: 170,
                            maxWidth: 160,
                            userSelect: 'none',
                            width: 'auto',
                          }}
                        />
                      ) : null}
                    </div>
                    <div style={{ height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 6 }}>
                      <span
                        className="gallery-label"
                        style={{
                          fontFamily: 'var(--font-noto), STSong, serif',
                          fontSize: 11,
                          lineHeight: 1,
                          maxWidth: 160,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {product.name}
                      </span>
                    </div>
                  </div>
                )
              })}

              {!loading ? (
                <div
                  style={{
                    position: 'absolute',
                    left: layout.originX - 240,
                    top: layout.originY + HERO_TEXT_HEIGHT / 2,
                    transform: 'translateY(-50%)',
                    width: HERO_TEXT_WIDTH,
                    zIndex: 5,
                    pointerEvents: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: 0,
                  }}
                >
                  <h1
                    style={{
                      fontFamily: 'var(--font-noto), STSong, serif',
                      fontSize: 96,
                      fontWeight: 700,
                      color: 'rgb(11,11,13)',
                      lineHeight: 1.05,
                      marginBottom: 20,
                      letterSpacing: '-0.02em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    中国卷烟博物馆
                  </h1>
                  <p
                    style={{
                      fontFamily: 'var(--font-dm-sans), system-ui, sans-serif',
                      fontSize: 20,
                      fontWeight: 500,
                      letterSpacing: '0.22em',
                      textTransform: 'uppercase',
                      color: 'rgba(108,108,118,0.5)',
                      marginBottom: 20,
                    }}
                  >
                    Chinese Cigarette Museum
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-dm-sans), system-ui, sans-serif',
                      fontSize: 18,
                      color: 'rgba(108,108,118,0.35)',
                      letterSpacing: '0.02em',
                      marginBottom: 32,
                    }}
                  >
                    {brandCount.toLocaleString()} brands&#8194;·&#8194;{productCount.toLocaleString()} products
                  </p>
                  <a
                    href="#collection"
                    onMouseEnter={(event) => {
                      event.currentTarget.style.background = 'rgba(11,11,13,0.75)'
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.background = 'rgb(11,11,13)'
                    }}
                    style={{
                      pointerEvents: 'auto',
                      fontFamily: 'var(--font-dm-sans), system-ui, sans-serif',
                      fontSize: 17,
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                      color: 'rgb(255,255,255)',
                      background: 'rgb(11,11,13)',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 10,
                      transition: 'background 0.15s, transform 0.1s',
                      marginBottom: 28,
                      padding: '12px 28px',
                      borderRadius: 40,
                      cursor: 'pointer',
                    }}
                  >
                    Browse collection
                    <svg fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeWidth="2" viewBox="0 0 10 10" width="16">
                      <path d="M5 2v6M2 6l3 3 3-3" />
                    </svg>
                  </a>
                  <div style={{ display: 'flex', gap: 14, marginBottom: 36, pointerEvents: 'auto' }}>
                    {[
                      { key: 'how', label: 'How it works', glyph: '说' },
                      { key: 'why', label: 'Why this exists', glyph: '缘' },
                    ].map((item) => (
                      <button
                        key={item.key}
                        onClick={() => setActiveModal(item.key as 'how' | 'why')}
                        onMouseEnter={(event) => {
                          event.currentTarget.style.background = 'rgba(11,11,13,0.08)'
                          event.currentTarget.style.color = 'rgba(11,11,13,0.7)'
                        }}
                        onMouseLeave={(event) => {
                          event.currentTarget.style.background = 'rgba(108,108,118,0.07)'
                          event.currentTarget.style.color = 'rgba(108,108,118,0.45)'
                        }}
                        style={{
                          fontFamily: 'var(--font-dm-sans), system-ui, sans-serif',
                          fontSize: 16,
                          fontWeight: 500,
                          letterSpacing: '0.04em',
                          color: 'rgba(108,108,118,0.45)',
                          background: 'rgba(108,108,118,0.07)',
                          border: 'none',
                          borderRadius: 28,
                          padding: '10px 22px',
                          cursor: 'pointer',
                          transition: 'background 0.15s, color 0.15s',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                        type="button"
                      >
                        <span
                          style={{
                            fontFamily: 'var(--font-noto), STSong, serif',
                            fontSize: 18,
                            fontWeight: 700,
                            opacity: 0.7,
                            lineHeight: 1,
                          }}
                        >
                          {item.glyph}
                        </span>
                        {item.label}
                      </button>
                    ))}
                  </div>
                  <a
                    href="https://x.com/0x_ultra"
                    onMouseEnter={(event) => {
                      event.currentTarget.style.color = 'rgba(108,108,118,0.6)'
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.color = 'rgba(108,108,118,0.28)'
                    }}
                    rel="noopener noreferrer"
                    style={{
                      pointerEvents: 'auto',
                      fontFamily: 'var(--font-dm-sans), system-ui, sans-serif',
                      fontSize: 16,
                      color: 'rgba(108,108,118,0.28)',
                      textDecoration: 'none',
                      letterSpacing: '0.01em',
                      transition: 'color 0.15s',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 7,
                    }}
                    target="_blank"
                  >
                    <svg fill="currentColor" height="15" viewBox="0 0 24 24" width="15">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    by @0x_ultra
                  </a>
                </div>
              ) : null}
            </div>
          </div>

        </div>
      </section>

      <div className="hidden sm:block">
        <div className="fixed top-[56px] right-0 bottom-0 w-80 bg-white border-l border-black/[0.07] shadow-2xl flex flex-col z-40 transition-transform duration-200 ease-in-out translate-x-full">
          <button className="absolute left-0 -translate-x-full top-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 px-2 py-3 bg-white border border-r-0 border-black/[0.08] rounded-l-xl shadow-md hover:shadow-lg transition-shadow" type="button">
            <svg className="text-ash/50" fill="none" height="14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" viewBox="0 0 24 24" width="14">
              <path d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
            </svg>
            <span className="text-[8px] font-bold text-green-500 leading-none">{entries.length}</span>
          </button>
          <div className="flex items-center justify-between px-4 py-3 border-b border-black/[0.06] flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-ash">Ciggie Chat</span>
              <span className="flex items-center gap-1 text-[10px] text-muted/40">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                {entries.length} online
              </span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ scrollBehavior: 'smooth' }}>
            {entries.map((entry) => (
              <div className="flex gap-2" key={entry.id}>
                <Link className="flex-shrink-0 mt-0.5" href={`/u/${slugifyName(entry.authorName || 'anonymous')}`}>
                  <div className="w-6 h-6 rounded-full bg-ink-3 text-[10px] text-ash/80 flex items-center justify-center">
                    {(entry.authorName || 'A').slice(0, 1).toUpperCase()}
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Link className="text-[11px] font-semibold truncate max-w-[120px] transition-colors text-ash/80 hover:text-ash" href={`/u/${slugifyName(entry.authorName || 'anonymous')}`}>
                      {entry.authorName || 'anonymous'}
                    </Link>
                    <span className="text-[10px] text-muted/30 flex-shrink-0">now</span>
                  </div>
                  <p className="text-[12px] text-ash/70 break-words leading-snug">{entry.excerpt || entry.title}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-black/[0.06]">
            <Link className="text-[12px] font-medium text-ash/70 hover:text-ash transition-colors" href="/admin">
              Sign in to chat →
            </Link>
          </div>
        </div>
      </div>

      {activeModal ? (
        <div
          onClick={() => setActiveModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0,0,0,0.28)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 24,
              boxShadow: '0 32px 80px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)',
              fontFamily: 'var(--font-dm-sans), system-ui, sans-serif',
              maxWidth: 520,
              padding: '40px 44px',
              position: 'relative',
              width: '100%',
            }}
          >
            <button
              onClick={() => setActiveModal(null)}
              onMouseEnter={(event) => {
                event.currentTarget.style.background = 'rgba(11,11,13,0.12)'
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background = 'rgba(11,11,13,0.06)'
              }}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'rgba(11,11,13,0.06)',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                cursor: 'pointer',
                fontSize: 16,
                color: 'rgba(11,11,13,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.15s',
              }}
              type="button"
            >
              ×
            </button>

            {activeModal === 'how' ? (
              <>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: 'rgb(11,11,13)', marginBottom: 6, letterSpacing: '-0.02em' }}>How it works</h2>
                <p style={{ fontSize: 13, color: 'rgba(108,108,118,0.6)', marginBottom: 28, letterSpacing: '0.01em' }}>
                  Everything you need to explore Chinese cigarettes.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {[
                    { glyph: '图', title: 'Interactive gallery', body: 'Pan and zoom across thousands of pack artworks arranged in a spiral. Every pack is clickable — tap to open its full detail page.' },
                    { glyph: '搜', title: 'Search in Chinese & English', body: 'Search by brand name, product name, Pinyin, or English translation. Results show instantly with images.' },
                    { glyph: '藏', title: 'Build & share your collection', body: 'Sign in with Google to favorite packs and log what you have smoked. Set a username and share your public profile.' },
                    { glyph: '志', title: 'Rich product data', body: 'Each SKU includes pack imagery, tar and nicotine ratings, pricing, brand history, and translated descriptions.' },
                    { glyph: '新', title: 'Always growing', body: 'New products and brands can be added continuously so the archive keeps expanding over time.' },
                  ].map((item) => (
                    <div key={item.title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-noto), STSong, serif',
                          fontSize: 15,
                          fontWeight: 700,
                          color: 'rgba(11,11,13,0.35)',
                          lineHeight: 1,
                          marginTop: 2,
                          flexShrink: 0,
                          width: 20,
                          textAlign: 'center',
                        }}
                      >
                        {item.glyph}
                      </span>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: 'rgb(11,11,13)', marginBottom: 3 }}>{item.title}</p>
                        <p style={{ fontSize: 13, color: 'rgba(108,108,118,0.7)', lineHeight: 1.55 }}>{item.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: 'rgb(11,11,13)', marginBottom: 6, letterSpacing: '-0.02em' }}>Why this exists</h2>
                <p style={{ fontSize: 13, color: 'rgba(108,108,118,0.6)', marginBottom: 28 }}>A personal project born out of obsession.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    'I have been fascinated by Chinese cigarettes for years — the pack artwork, the regional brands, and the history in every design.',
                    'There was nowhere online to explore this world in a clear, beautiful way. Everything was scattered and hard to browse.',
                    'So this archive turns that world into something you can actually move through, compare, and revisit.',
                    'If you are a collector, a traveller, or just curious, this is for you.',
                  ].map((paragraph, index) => (
                    <p
                      key={paragraph}
                      style={{
                        fontSize: 14,
                        color: index === 3 ? 'rgb(11,11,13)' : 'rgba(11,11,13,0.65)',
                        lineHeight: 1.65,
                        fontWeight: index === 3 ? 500 : 400,
                      }}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  )
}
