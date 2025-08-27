"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Genre = {
  id: string;
  slug: string;
};

export default function GenreFooter() {
  const [genres, setGenres] = useState<Genre[]>([]);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await fetch(
          "https://anispace-api.vercel.app/api/manga/genres"
        );
        const data = await res.json();
        setGenres(data);
      } catch (err) {
        console.error("Failed to fetch genres:", err);
      }
    };

    fetchGenres();
  }, []);

  return (
    <div className="border-t-1  border-gray-500 my-4 bg-neutral-900 h-full">
      <center>
        <h1 className="font-black mt-12">GENRES</h1>
      </center>
      <div className="flex flex-wrap gap-2 p-4 ">
        {genres.map((genre) => (
          <Link key={genre.slug} href={`/manga/genre/${genre.slug}`}>
            <Button
              variant="destructive"
              className="rounded-full px-2 py-1 text-sm text-white hover:bg-white/60 bg-gray-700 transition">
              {genre.id}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}
