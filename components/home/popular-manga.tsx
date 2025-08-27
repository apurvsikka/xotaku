import { CardContainer } from "@/components/card-container";
import { MangaCard } from "@/components/cards";
import Link from "next/link";
import { Button } from "../ui/button";
import { ChevronRight } from "lucide-react";
interface Manga {
  id: string;

  title: string;

  image: string;

  latestChapter?: string;

  description?: string;
}
interface ReleasesProps {
  items: any;
}

export default function LatestManga({ items }: ReleasesProps) {
  return (
    <div className=" p-0 relative z-20 mt-12">
                
      <h2 className=" text-2xl font-bold mb-8 text-white flex">
       <div className=" rounded bg-white h-8 w-2 mx-2"></div> LATEST MANGA
      </h2>
      <CardContainer>
        {items.map((item: any, index: number) => (
          <div key={item.id || index} className="mt-2">
            <MangaCard manga={item} />
          </div>
        ))}
      </CardContainer>
    </div>
  );
}
