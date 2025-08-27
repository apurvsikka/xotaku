"use client";
import { MangaCard } from "../cards";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";  
import { Button } from "@/components/ui/button";

interface Manga {
  id: string;
  title: string;
  image: string;
  latestChapter?: string;
  description?: string;
}

interface LatestReleasesProps {
  latestManga: any[];
}

export function PopularManga({ latestManga }: LatestReleasesProps) {

  return (
    <div     className=" my-12 relative ">
      <div className="container flex">
        <div className=" rounded bg-white h-8 w-2 mx-2"></div>
        <h2 className="text-2xl font-bold mb-8 text-white flex">POPULAR SERIES
        </h2>
      </div>

        <center
          className="flex overflow-x-scroll pb-2 w-[100%]">
          {latestManga.map((manga) => (
            <div key={manga.id} className="flex-shrink-0 w-48 mt-4">
              <MangaCard manga={manga}  />
            </div>
          ))}
        </center>
    </div>
  );
}
