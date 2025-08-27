"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-black select-none via-zinc-900 to-black text-white">
      {/* Title */}
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4">
        Otaku<span className="text-purple-500">X</span>
      </h1>

      {/* Tagline */}
      <p className="text-lg md:text-2xl text-gray-300 mb-10 text-center max-w-2xl">
        Dive into the world of anime and manga. Stream your favorites or
        discover something new.
      </p>

      {/* Buttons */}
      <div className="flex gap-6">
        <Link
          href="/anime"
          className="px-8 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 shadow-lg text-lg font-semibold transition"
        >
          Watch Anime
        </Link>
        <Link
          href="/manga"
          className="px-8 py-3 rounded-2xl bg-pink-600 hover:bg-pink-700 shadow-lg text-lg font-semibold transition"
        >
          Read Manga
        </Link>
      </div>
    </div>
  );
}
