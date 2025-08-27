"use client";
import { useState, useEffect } from "react";
import { PopularManga } from "@/components/home/latest-manga";
import MangaSlider from "@/components/manga-slider";
import NavBar from "@/components/nav-bar";
import Image from "next/image";
import LatestManga from "@/components/home/popular-manga";
import GenreFooter from "@/components/genre-footer";

interface Manga {
  id: string;

  title: string;

  image: string;

  latestChapter?: string;

  description?: string;
}

export default function Home() {
  const [popularManga, setPopularManga] = useState<Manga[]>([]);

  const [latestManga, setLatestManga] = useState<Manga[]>([]);

  const [ongoingManga, setOngoingManga] = useState<Manga[]>([]);

  // const [currentBgIndex, setCurrentBgIndex] = useState(0);

  useEffect(() => {
    fetch("https://anispace-api.vercel.app/api/manga/all/ongoing")
      .then((res) => res.json())

      .then((data) => {
        const mangaList = data.results || [];

        setOngoingManga(mangaList);
      })

      .catch((err) => console.error("Error fetching popular manga:", err));

    fetch("https://anispace-api.vercel.app/api/manga/popular")
      .then((res) => res.json())

      .then((data) => {
        setPopularManga(data.results || []);
      })

      .catch((err) => console.error("Error fetching latest manga:", err));

    fetch("https://anispace-api.vercel.app/api/manga/latest")
      .then((res) => res.json())

      .then((data) => {
        setLatestManga(data.results || []);
      })

      .catch((err) => console.error("Error fetching latest manga:", err));
  }, []);
  return (
    <>
      <NavBar />
      <div className="lg:p-6 lg:pt-20 ">
        <MangaSlider />
        {/* <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20"></div> */}
        <PopularManga latestManga={popularManga} />
        <center>
          <LatestManga items={latestManga} />
        </center>
      </div>
      <GenreFooter />
    </>
  );
}
