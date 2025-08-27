"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Hash, Book } from "lucide-react";

export default function MangaReaderPage({
  params,
}: {
  params: { id: string; chapter: string };
}) {
  const [data, setData] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [toolbarVisible, setToolbarVisible] = useState(true);

  const mangaId = params.id;
  const currentChapter = Number(params.chapter);

  // fetch chapter
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(
          `https://anispace-api.vercel.app/api/manga/${mangaId}/chapter/${currentChapter}`,
          { cache: "no-store" }
        );
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [mangaId, currentChapter]);

  // fetch chapters
  useEffect(() => {
    async function loadManga() {
      try {
        const res = await fetch(
          `https://anispace-api.vercel.app/api/manga/${mangaId}`,
          {
            cache: "no-store",
          }
        );
        const json = await res.json();
        setChapters(json.chapters.reverse());
      } catch (err) {
        console.error(err);
      }
    }
    loadManga();
  }, [mangaId]);

  const totalPages = data?.images?.length ?? 0;
  const currentPage = page + 1;

  // scroll-based page tracking

  useEffect(() => {
    const handler = () => {
      const imgs = Array.from(document.querySelectorAll("img[data-page]"));
      let closestIndex = 0;
      let closestOffset = Infinity;

      for (let i = 0; i < imgs.length; i++) {
        const rect = imgs[i].getBoundingClientRect();
        const offset = Math.abs(rect.top); // distance from viewport top
        if (offset < closestOffset) {
          closestOffset = offset;
          closestIndex = i;
        }
      }

      setPage(closestIndex);
    };

    window.addEventListener("scroll", handler, { passive: true });
    handler(); // run once on mount
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const jumpToPage = (val: number) => {
    if (val >= 1 && val <= totalPages) {
      const target = document.getElementById(`page-${val}`);
      if (target) target.scrollIntoView({ behavior: "smooth" });
    }
  };

  // chapters navigation
  const currentIndex = chapters.findIndex(
    (ch) => Number(ch.chapterNumber) === currentChapter
  );
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChapter =
    currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;
  const goToChapter = (ch: string) =>
    (window.location.href = `/manga/${mangaId}/${ch}`);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  if (!data)
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        Failed to load
      </div>
    );

  return (
    <div className="bg-black min-h-screen text-white flex flex-col">
      {/* Reader */}
      <div
        className="flex-1 overflow-y-auto"
        onClick={() => setToolbarVisible((v) => !v)} // tap screen to toggle toolbar
      >
        {data.images.map((src: string, i: number) => (
          <center>
            <img
              key={i}
              id={`page-${i + 1}`}
              data-page={i + 1}
              src={src}
              alt={`Page ${i + 1}`}
              className="object-contain"
              loading="lazy"
            />
          </center>
        ))}
      </div>

      {/* Mobile Toolbar */}
      {toolbarVisible && (
        <div className="sticky bottom-0 bg-neutral-900/95 backdrop-blur-md border-t border-neutral-700 px-3 py-2 flex flex-col gap-2">
          {/* Progress */}
          {totalPages > 0 && (
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={1}
                max={totalPages}
                value={currentPage}
                onChange={(e) => jumpToPage(Number(e.target.value))}
                className="flex-1 accent-white h-2"
              />
              <div className="flex items-center gap-1 text-xs">
                <Hash size={14} className="text-neutral-400" />
                <span>
                  {currentPage}/{totalPages}
                </span>
              </div>
            </div>
          )}

          {/* Buttons Row */}
          <div className="flex justify-between items-center">
            {/* Prev */}
            <button
              onClick={() =>
                prevChapter && goToChapter(prevChapter.chapterNumber)
              }
              disabled={!prevChapter}
              className="p-3 bg-neutral-800 rounded-full disabled:opacity-40">
              <ChevronLeft size={22} />
            </button>

            {/* Chapter select */}
            <div className="relative flex-1 mx-3">
              <Book
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <select
                value={currentChapter}
                onChange={(e) => goToChapter(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-full bg-neutral-800 text-white text-sm">
                {chapters.map((ch) => (
                  <option key={ch.chapterNumber} value={ch.chapterNumber}>
                    {ch.chapterName}
                  </option>
                ))}
              </select>
            </div>

            {/* Next */}
            <button
              onClick={() =>
                nextChapter && goToChapter(nextChapter.chapterNumber)
              }
              disabled={!nextChapter}
              className="p-3 bg-neutral-800 rounded-full disabled:opacity-40">
              <ChevronRight size={22} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
