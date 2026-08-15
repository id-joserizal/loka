'use client'

import { useState, useRef, useTransition, useEffect } from 'react'
import {
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Check,
  Loader2,
  Palette,
  Quote,
  Layers,
  FileImage,
  BookOpen,
  ArrowRight,
} from 'lucide-react'
import { toPng } from 'html-to-image'
import JSZip from 'jszip'

export interface InstagramCarouselModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  coverImageUrl?: string | null
  authorName?: string
  authorAvatar?: string | null
  excerpt?: string | null
  content?: any
}

interface SlideItem {
  id: string
  type: 'cover' | 'quote' | 'cta'
  headline?: string
  text?: string
  quoteAuthor?: string
}

type ThemeType = 'loka-warm' | 'dark-editorial' | 'minimalist'

export function InstagramCarouselModal({
  isOpen,
  onClose,
  title,
  coverImageUrl,
  authorName = 'Penulis LOKA',
  authorAvatar,
  excerpt,
  content,
}: InstagramCarouselModalProps) {
  const [slides, setSlides] = useState<SlideItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [theme, setTheme] = useState<ThemeType>('loka-warm')
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState<string | null>(null)
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')

  const slideRefs = useRef<(HTMLDivElement | null)[]>([])

  // Extract key quotes & structure content for Carousel Slides
  useEffect(() => {
    if (!isOpen) return

    const extractedQuotes: string[] = []

    // Parse Tiptap JSON AST
    if (content && typeof content === 'object' && Array.isArray(content.content)) {
      content.content.forEach((node: any) => {
        if (node.type === 'blockquote') {
          const text = node.content?.map((c: any) => c.text).filter(Boolean).join(' ')
          if (text && text.length > 10) extractedQuotes.push(text)
        } else if (node.type === 'heading' && (node.attrs?.level === 2 || node.attrs?.level === 3)) {
          const text = node.content?.map((c: any) => c.text).filter(Boolean).join(' ')
          if (text && text.length > 10) extractedQuotes.push(text)
        } else if (node.type === 'paragraph') {
          // Check if paragraph contains bold marks or significant text
          const hasBold = node.content?.some((c: any) => c.marks?.some((m: any) => m.type === 'bold'))
          const text = node.content?.map((c: any) => c.text).filter(Boolean).join(' ')
          if (hasBold && text && text.length > 20 && text.length < 200) {
            extractedQuotes.push(text)
          }
        }
      })
    } else if (typeof content === 'string') {
      // Raw HTML fallback
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = content
      const blockquotes = tempDiv.querySelectorAll('blockquote, h2, h3')
      blockquotes.forEach((el) => {
        const text = el.textContent?.trim()
        if (text && text.length > 10) extractedQuotes.push(text)
      })
    }

    // Fallback if no blockquotes/headings found: split excerpt or default quotes
    if (extractedQuotes.length === 0) {
      if (excerpt && excerpt.trim()) {
        extractedQuotes.push(excerpt.trim())
      } else {
        extractedQuotes.push(
          `"Tulisan menarik tentang ${title} yang menguraikan sudut pandang penting dan mendalam."`
        )
      }
    }

    // Deduplicate & limit highlight slides to max 3
    const uniqueQuotes = Array.from(new Set(extractedQuotes)).slice(0, 3)

    const initialSlides: SlideItem[] = [
      // Slide 1: Cover Card
      {
        id: 'slide-cover',
        type: 'cover',
        headline: title,
        text: excerpt || undefined,
      },
      // Slide 2..N: Quote Highlight Cards
      ...uniqueQuotes.map((q, idx) => ({
        id: `slide-quote-${idx}`,
        type: 'quote' as const,
        text: q.startsWith('"') ? q : `"${q}"`,
      })),
      // Slide Final: CTA Card
      {
        id: 'slide-cta',
        type: 'cta',
        headline: `Baca Artikel Selengkapnya di LOKA`,
        text: `Simak Ulasan Utuh "${title}" oleh ${authorName}`,
      },
    ]

    setSlides(initialSlides)
    setCurrentIndex(0)
  }, [isOpen, title, excerpt, content, authorName])

  if (!isOpen) return null

  const activeSlide = slides[currentIndex] || slides[0]

  // Slide navigation
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : slides.length - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < slides.length - 1 ? prev + 1 : 0))
  }

  // Handle slide text inline edit
  const startEditSlide = (slide: SlideItem) => {
    setEditingSlideId(slide.id)
    setEditingText(slide.text || slide.headline || '')
  }

  const saveEditSlide = (id: string) => {
    setSlides((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, text: s.type === 'quote' ? editingText : s.text, headline: s.type !== 'quote' ? editingText : s.headline } : s
      )
    )
    setEditingSlideId(null)
  }

  // Render Theme Styles for the Card
  const getThemeStyles = () => {
    switch (theme) {
      case 'dark-editorial':
        return {
          bg: 'bg-zinc-950 text-zinc-100',
          cardBorder: 'border-zinc-800',
          accentText: 'text-amber-400',
          secondaryText: 'text-zinc-400',
          badgeBg: 'bg-zinc-900/90 text-amber-300 border-zinc-700/80',
          quoteIconColor: 'text-amber-400/20',
          ctaBtnBg: 'bg-amber-400 text-zinc-950 font-bold',
        }
      case 'minimalist':
        return {
          bg: 'bg-white text-zinc-900',
          cardBorder: 'border-zinc-200',
          accentText: 'text-zinc-900',
          secondaryText: 'text-zinc-500',
          badgeBg: 'bg-zinc-100 text-zinc-800 border-zinc-200',
          quoteIconColor: 'text-zinc-200',
          ctaBtnBg: 'bg-zinc-900 text-white font-semibold',
        }
      case 'loka-warm':
      default:
        return {
          bg: 'bg-[#F4EFEA] text-zinc-900',
          cardBorder: 'border-zinc-300/70',
          accentText: 'text-zinc-900',
          secondaryText: 'text-zinc-600',
          badgeBg: 'bg-zinc-900 text-white border-zinc-900',
          quoteIconColor: 'text-zinc-900/15',
          ctaBtnBg: 'bg-zinc-900 text-white font-bold',
        }
    }
  }

  const currentTheme = getThemeStyles()

  // Download Single Slide PNG
  const handleDownloadSingle = async (index: number) => {
    const node = slideRefs.current[index]
    if (!node) return

    setIsExporting(true)
    setExportProgress(`Mengunduh Slide ${index + 1}...`)

    try {
      const dataUrl = await toPng(node, {
        quality: 0.98,
        pixelRatio: 2, // 2x resolution for high sharpness
        cacheBust: true,
      })

      const link = document.createElement('a')
      link.download = `loka-slide-${index + 1}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Error exporting PNG:', err)
      alert('Gagal mengunduh gambar slide.')
    } finally {
      setIsExporting(false)
      setExportProgress(null)
    }
  }

  // Download All Slides as ZIP
  const handleDownloadZip = async () => {
    setIsExporting(true)
    const zip = new JSZip()
    const folder = zip.folder('loka-carousel')

    try {
      for (let i = 0; i < slides.length; i++) {
        setExportProgress(`Memproses Slide ${i + 1} dari ${slides.length}...`)
        const node = slideRefs.current[i]
        if (!node) continue

        const dataUrl = await toPng(node, {
          quality: 0.98,
          pixelRatio: 2,
          cacheBust: true,
        })

        // Base64 to binary
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '')
        folder?.file(`slide-${i + 1}.png`, base64Data, { base64: true })
      }

      setExportProgress('Membuat berkas ZIP...')
      const contentBlob = await zip.generateAsync({ type: 'blob' })

      const link = document.createElement('a')
      const cleanSlug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .substring(0, 30)

      link.download = `loka-carousel-${cleanSlug || 'instagram'}.zip`
      link.href = URL.createObjectURL(contentBlob)
      link.click()
    } catch (err) {
      console.error('Error generating ZIP:', err)
      alert('Gagal mengekspor carousel ZIP.')
    } finally {
      setIsExporting(false)
      setExportProgress(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-zinc-950/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/70 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-zinc-900 text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-zinc-900">
                Instagram Carousel Card Generator
              </h3>
              <p className="text-xs text-zinc-500">
                Kartu visual estetik otomatis (1080×1350 px) siap unduh & posting di Instagram
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900 transition"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Workspace Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls Column (Left / Top) */}
          <div className="lg:col-span-4 space-y-5">
            {/* Theme Picker */}
            <div className="space-y-2 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" />
                <span>Pilih Tema Desain</span>
              </label>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setTheme('loka-warm')}
                  className={`p-2.5 rounded-xl text-xs font-serif font-semibold border flex flex-col items-center gap-1 transition ${
                    theme === 'loka-warm'
                      ? 'bg-[#F4EFEA] border-zinc-900 text-zinc-900 shadow-xs ring-2 ring-zinc-900/20'
                      : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-[#F4EFEA] border border-zinc-400" />
                  Loka Warm
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('dark-editorial')}
                  className={`p-2.5 rounded-xl text-xs font-serif font-semibold border flex flex-col items-center gap-1 transition ${
                    theme === 'dark-editorial'
                      ? 'bg-zinc-950 border-amber-400 text-amber-400 shadow-xs ring-2 ring-amber-400/20'
                      : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-zinc-950 border border-amber-400" />
                  Dark Editorial
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('minimalist')}
                  className={`p-2.5 rounded-xl text-xs font-sans font-semibold border flex flex-col items-center gap-1 transition ${
                    theme === 'minimalist'
                      ? 'bg-white border-zinc-900 text-zinc-900 shadow-xs ring-2 ring-zinc-900/20'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white border border-zinc-300" />
                  Minimalist
                </button>
              </div>
            </div>

            {/* Slide Navigation List */}
            <div className="space-y-2 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Daftar Slide ({slides.length})</span>
                </label>
                <span className="text-[11px] text-zinc-500 font-medium">Klik untuk sunting</span>
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {slides.map((s, idx) => (
                  <div
                    key={s.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                      idx === currentIndex
                        ? 'bg-zinc-900 text-white border-zinc-900 font-semibold shadow-xs'
                        : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/20">
                        0{idx + 1}
                      </span>
                      <span className="truncate">
                        {s.type === 'cover'
                          ? 'Slide 1: Cover Headliner'
                          : s.type === 'cta'
                          ? 'Slide Akhir: Call to Action'
                          : s.text?.substring(0, 35) + '...'}
                      </span>
                    </div>

                    {idx === currentIndex && (
                      <span className="text-[10px] bg-amber-400 text-zinc-950 font-bold px-2 py-0.5 rounded-full shrink-0">
                        Aktif
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Edit Current Active Slide */}
            <div className="space-y-2 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider flex items-center justify-between">
                <span>Edit Teks Slide 0{currentIndex + 1}</span>
                {editingSlideId === activeSlide.id ? (
                  <button
                    type="button"
                    onClick={() => saveEditSlide(activeSlide.id)}
                    className="text-emerald-600 font-bold text-[11px] hover:underline"
                  >
                    Simpan Teks
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => startEditSlide(activeSlide)}
                    className="text-zinc-500 hover:text-zinc-900 font-medium text-[11px] underline"
                  >
                    Ubah Teks
                  </button>
                )}
              </label>

              {editingSlideId === activeSlide.id ? (
                <textarea
                  rows={3}
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-300 text-xs bg-white focus:outline-none focus:border-zinc-900"
                />
              ) : (
                <p className="text-xs text-zinc-600 font-serif italic bg-white p-2.5 rounded-xl border border-zinc-200/80 line-clamp-3">
                  {activeSlide.text || activeSlide.headline}
                </p>
              )}
            </div>

            {/* Export Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleDownloadZip}
                disabled={isExporting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-zinc-900 hover:bg-black text-white text-xs font-bold shadow-md transition disabled:opacity-50"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    <span>{exportProgress || 'Mengekspor...'}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-amber-400" />
                    <span>Unduh Semua Slide (.ZIP)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleDownloadSingle(currentIndex)}
                disabled={isExporting}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl border border-zinc-300 hover:border-zinc-400 bg-white text-zinc-800 text-xs font-semibold transition hover:bg-zinc-50 disabled:opacity-50"
              >
                <FileImage className="w-4 h-4 text-zinc-500" />
                <span>Unduh Slide Ini (PNG)</span>
              </button>
            </div>
          </div>

          {/* Interactive Card Canvas Preview (Right / Center) */}
          <div className="lg:col-span-8 flex flex-col items-center justify-center space-y-4">
            {/* Slide Navigation Header Bar */}
            <div className="flex items-center justify-between w-full max-w-[360px] px-2">
              <button
                type="button"
                onClick={handlePrev}
                className="p-1.5 rounded-full bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-700 transition shadow-xs"
                title="Slide Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-semibold font-mono text-zinc-600">
                Slide {currentIndex + 1} / {slides.length}
              </span>

              <button
                type="button"
                onClick={handleNext}
                className="p-1.5 rounded-full bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-700 transition shadow-xs"
                title="Slide Selanjutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* PREVIEW CONTAINER (Scaled for screen view) */}
            <div className="relative shadow-2xl rounded-3xl overflow-hidden border border-zinc-300/80 bg-zinc-900">
              <div className="w-[340px] sm:w-[380px] aspect-[4/5] overflow-hidden relative">
                {/* ACTIVE SLIDE CARD DOM */}
                {slides.map((s, idx) => {
                  const isCurrent = idx === currentIndex
                  return (
                    <div
                      key={s.id}
                      ref={(el) => {
                        slideRefs.current[idx] = el
                      }}
                      className={`absolute inset-0 w-full h-full p-8 flex flex-col justify-between select-none ${
                        currentTheme.bg
                      } ${isCurrent ? 'opacity-100 z-10' : 'opacity-0 -z-10 pointer-events-none'}`}
                      style={{
                        // Ensure exact 4:5 aspect ratio layout
                        width: '100%',
                        height: '100%',
                      }}
                    >
                      {/* Top Bar inside Card */}
                      <div className="flex items-center justify-between z-10">
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-extrabold tracking-tight text-base">
                            LOKA
                          </span>
                          <span className="text-[10px] opacity-60 font-mono uppercase tracking-wider">
                            • Jurnal Literasi
                          </span>
                        </div>

                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${currentTheme.badgeBg}`}
                        >
                          0{idx + 1} / 0{slides.length}
                        </span>
                      </div>

                      {/* Card Content Body */}
                      <div className="relative my-auto py-6 z-10 space-y-4">
                        {s.type === 'cover' && (
                          <div className="space-y-4">
                            {coverImageUrl && (
                              <div className="w-full h-36 rounded-2xl overflow-hidden border border-black/10 shadow-sm mb-4">
                                <img
                                  src={coverImageUrl}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <h2 className="text-2xl sm:text-3xl font-serif font-extrabold leading-[1.18] tracking-tight">
                              {s.headline}
                            </h2>
                            {s.text && (
                              <p className={`text-xs sm:text-sm font-serif line-clamp-3 leading-relaxed ${currentTheme.secondaryText}`}>
                                {s.text}
                              </p>
                            )}
                          </div>
                        )}

                        {s.type === 'quote' && (
                          <div className="relative py-2 space-y-4">
                            <Quote
                              className={`absolute -top-6 -left-3 w-16 h-16 pointer-events-none ${currentTheme.quoteIconColor}`}
                            />
                            <p className="text-xl sm:text-2xl font-serif font-medium leading-[1.38] tracking-normal relative z-10 italic">
                              {s.text}
                            </p>
                          </div>
                        )}

                        {s.type === 'cta' && (
                          <div className="text-center space-y-5 py-4">
                            <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center mx-auto shadow-md">
                              <BookOpen className="w-6 h-6 text-amber-400" />
                            </div>

                            <div className="space-y-2">
                              <h3 className="text-xl sm:text-2xl font-serif font-bold leading-snug">
                                {s.headline}
                              </h3>
                              <p className={`text-xs font-serif italic ${currentTheme.secondaryText}`}>
                                {s.text}
                              </p>
                            </div>

                            <div className="pt-2">
                              <div
                                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs shadow-sm ${currentTheme.ctaBtnBg}`}
                              >
                                <span>Baca Cerita Selengkapnya</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card Footer Bar */}
                      <div className="pt-4 border-t border-current/15 flex items-center justify-between z-10 text-[11px]">
                        <div className="flex items-center gap-2">
                          {authorAvatar ? (
                            <img
                              src={authorAvatar}
                              alt=""
                              className="w-6 h-6 rounded-full object-cover border border-current/20"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-[9px]">
                              {authorName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="font-semibold truncate max-w-[140px]">
                            {authorName}
                          </span>
                        </div>

                        <span className={`text-[10px] font-medium font-serif italic ${currentTheme.secondaryText}`}>
                          loka.id
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Pagination Dots */}
            <div className="flex items-center gap-1.5 pt-1">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentIndex
                      ? 'w-6 bg-zinc-900'
                      : 'w-2 bg-zinc-300 hover:bg-zinc-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
