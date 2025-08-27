"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"

export default function MangaReader({ images }: { images: string[] }) {
  const [currentPage, setCurrentPage] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // handle jumping to a specific page
  const handleJump = (page: number) => {
    if (page >= 0 && page < images.length) {
      setCurrentPage(page)
      containerRef.current?.scrollTo({
        left: page * containerRef.current.clientWidth,
        behavior: "smooth",
      })
    }
  }

  // handle next/prev
  const handleNext = () => handleJump(currentPage + 1)
  const handlePrev = () => handleJump(currentPage - 1)

  return (
    <div className=" text-white min-h-screen flex flex-col z-50">
      {/* Reader container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-x-hidden flex snap-x snap-mandatory">
        {images.map((src, idx) => (
          <img
            key={idx}
            src={src}
            alt={`Page ${idx + 1}`}
            className="snap-center flex-shrink-0"
          />
        ))}
      </div>

      {/* Toolbar (bottom) */}
      <div className="sticky bottom-0 w-full bg-sidebar/60 backdrop-blur-md p-2 flex items-center gap-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={handlePrev}
          disabled={currentPage === 0}>
          <ChevronLeft />
        </Button>

        {/* Progress bar */}
        <div className="flex-1 flex flex-col gap-1">
          <Progress
            value={((currentPage + 1) / images.length) * 100}
            className="h-2"
          />
          <div className="text-xs text-center">
            Page {currentPage + 1} / {images.length}
          </div>
        </div>

        {/* Page input */}
        <Input
          type="number"
          className="w-20 text-center"
          value={currentPage + 1}
          min={1}
          max={images.length}
          onChange={(e) => handleJump(Number(e.target.value) - 1)}
        />

        <Button
          size="icon"
          variant="ghost"
          onClick={handleNext}
          disabled={currentPage === images.length - 1}>
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
