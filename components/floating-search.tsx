'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Play, BookOpen } from 'lucide-react'
import { timeline } from '@motionone/dom'

export default function FloatingSearch({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean
  setIsOpen: (v: boolean) => void
}) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)

  const [searchType, setSearchType] = useState<'anime' | 'manga'>('anime')
  const [query, setQuery] = useState('')

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsOpen(!isOpen)
      } else if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, setIsOpen])

  useEffect(() => {
    if (isOpen && backdropRef.current && containerRef.current) {
      const controls = timeline([
        [
          backdropRef.current,
          { opacity: [0, 1] },
          { duration: 0.45, easing: 'ease-out' },
        ],
        [
          containerRef.current,
          {
            opacity: [0, 1],
            y: [-24, 0],
            scale: [0.95, 1],
          },
          {
            delay: 0.1,
            duration: 0.35,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          },
        ],
      ])

      const timeout = setTimeout(() => {
        inputRef.current?.focus()
      }, 550)

      return () => {
        controls?.cancel()
        clearTimeout(timeout)
      }
    }
  }, [isOpen])

  const handleSubmit = () => {
    if (!query.trim()) return
    const encodedQuery = encodeURIComponent(query.trim())
    router.push(`/${searchType}/search?query=${encodedQuery}`)
    setIsOpen(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  if (!isOpen) return null

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm bg-gradient-to-bl from-gray-900/40 to-black/60 opacity-0">
      <div
        ref={containerRef}
        className="w-full max-w-md sm:max-w-lg rounded-2xl bg-neutral-900/40  shadow-lg shadow-black/30 backdrop-blur-xl px-4 py-3 opacity-0 transform-gpu transition-all duration-300 ease-in-out">
        <div className="flex items-center gap-3">
          <Search className="text-gray-300 w-5 h-5 shrink-0 scale-50 md:scale-100" />

          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={`Search ${searchType}...`}
            className="flex-1 bg-transparent text-white placeholder-gray-400 caret-gray-500 text-sm sm:text-base px-4 py-1.5 outline-none"
          />

          {/* pill switcher */}
          <div className="relative flex gap-1 px-1 py-1 rounded-full bg-gray-900/10 overflow-hidden min-w-[72px] h-[3.2vh]">
            <div
              className={`absolute top-0 left-0 h-full w-1/2 rounded-full bg-gray-300 transition-transform duration-300 ease-in-out
                ${searchType === "anime" ? "translate-x-0" : "translate-x-full"}
              `}
            />
            <button
              onClick={() => setSearchType("anime")}
              className={`relative z-10 w-8 h-full flex items-center justify-center rounded-full
                transition-colors duration-200
                ${searchType === "anime" ? "text-black" : "text-white/50 hover:bg-white/10"}
              `}>
              <Play size={10} className="pointer-events-none" />
            </button>

            <button
              onClick={() => setSearchType("manga")}
              className={`relative z-10 w-8 h-full flex items-center justify-center rounded-full
                transition-colors duration-200
                ${searchType === "manga" ? "text-black" : "text-white/50 hover:bg-white/10"}
              `}>
              <BookOpen size={10} className="pointer-events-none" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
