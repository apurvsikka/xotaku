"use client";

import React, { useEffect, useState } from "react";
import { Slider } from "@/components/slider";
import Gogoanime from "@consumet/extensions/dist/providers/anime/gogoanime";
import { ANIME } from "@consumet/extensions";


const getThemeGradient = (i: number) => {
  const gradients = [
    "linear-gradient(135deg, #667eea, #764ba2)",
    "linear-gradient(135deg, #f093fb, #f5576c)",
    "linear-gradient(135deg, #4facfe, #00f2fe)",
  ];
  return gradients[i % gradients.length];
};

const truncate = (txt: string, len: number) =>
  txt.length > len ? txt.slice(0, len).trim() + "..." : txt;

export default function AnimeSilder() {
  const [slides, setSlides] = useState<any[]>([]);

  useEffect(() => {
    const zoro = new ANIME.Zoro();
    const fetchManga = async () => {
      const data = await zoro.fetchMostPopular()
      setSlides(
        data.results.slice(0, 10).map((m, i) => ({
          id: m.id,
          title: truncate(m.title as any, 50),
          description: truncate(m.japaneseTitle, 150),
          image: m.image,
        }))
      );
    };
    fetchManga();
  }, []);

  if (slides.length === 0)
    return (
      <div style={{ color: "white" }}>
        {" "}
        <div className="relative w-full h-[70vh] min-h-[500px] max-h-[800px] bg-black flex items-center justify-center lg:rounded-lg overflow-hidden">
          <div className="animate-spin w-12 h-12 border-4 border-white/20 border-t-white rounded-full"></div>

          <span className="ml-4 text-white text-xl font-medium">
            Loading manga...
          </span>
        </div>
      </div>
    );

  return (
    <Slider
      slides={slides}
      primaryActionLabel={"Read Now"}
      secondaryActionLabel={"Details"}
    />
  );
}
