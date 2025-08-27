"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import styled from "styled-components";

interface MangaResult {
  id: string;
  title: string;
  image: string;
  link: string;
  latestChapter: number;
}

interface SearchResponse {
  query: string;
  currentPage: number;
  hasNextPage: boolean;
  pageLimit: number;
  totalResults: number;
  results: MangaResult[];
}

async function getSearchResults(query: string, page: string) {
  if (!query) return null;
  const res = await fetch(
    `https://anispace-api.vercel.app/api/manga/search?query=${encodeURIComponent(
      query
    )}&page=${page}`,
    { cache: "no-store" }
  );

  if (!res.ok) return null;
  return (await res.json()) as SearchResponse;
}

const CardWrapper = styled(Link)`
  color: var(--global-text);
  text-decoration: none;
  border-radius: 0.75rem;
  overflow: hidden;
  display: block;
`;

const CardItem = styled.div`
  position: relative;
  background: var(--background);
  color: var(--foreground) !important;
  border-radius: inherit;
`;

const CardImageWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 3/4;
`;

const CardImage = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const TitleContainer = styled.div<{ $isHovered: boolean }>`
  padding: 0.5rem;
  transition: color 0.2s ease;
  color: ${({ $isHovered }) => ($isHovered ? "#a855f7" : "white")};
`;

const Title = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CardDetails = styled.p`
  font-size: 0.75rem;
  color: #aaa;
  padding: 0 0.5rem 0.5rem;
`;

const Badge = styled.div`
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  background-color: purple;
  color: white;
  font-size: 0.65rem;
  padding: 0.1rem 0.35rem;
  border-radius: 6px;
  font-weight: bold;
  text-transform: uppercase;
`;

function MangaCard({ manga }: { manga: MangaResult }) {
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const truncateTitle = useMemo(
    () => (title: string, maxLength: number) =>
      title.length > maxLength ? `${title.slice(0, maxLength)}...` : title,
    []
  );

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 0);
    return () => clearTimeout(timer);
  }, [manga.title]);

  if (loading) {
    return (
      <div className="relative w-full bg-background flex items-center justify-center lg:rounded-lg overflow-hidden">
        <div className="animate-spin w-12 h-12 border-4 border-white/20 border-t-white rounded-full"></div>
        <span className="ml-4  text-xl font-medium">Loading manga...</span>
      </div>
    );
  }

  return (
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>
        <CardWrapper
          href={`${manga.link.split("/manga/")[1]}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}>
          <CardItem>
            <CardImageWrapper>
              <CardImage>
                <Image
                  src={manga.image}
                  alt={manga.title}
                  fill
                  className="rounded-lg hover:blur-sm"
                />
                <Badge>MANGA</Badge>
              </CardImage>
            </CardImageWrapper>

            <TitleContainer $isHovered={isHovered}>
              <Title title={manga.title} className="text-foreground">
                {truncateTitle(manga.title, 35)}
              </Title>
            </TitleContainer>

            <CardDetails>Ch. {manga.latestChapter}</CardDetails>
          </CardItem>
        </CardWrapper>
      </HoverCardTrigger>

      <HoverCardContent
        side="right"
        className="w-96 bg-background/70 border-gray-700/50 backdrop-blur-md text-foreground">
        <div className="flex gap-4">
          <img
            src={manga.image}
            alt={manga.title}
            className="w-24 h-32 object-cover rounded-md"
          />
          <div className="flex-1">
            <h4 className="font-semibold text-purple-400 text-lg">
              {manga.title}
            </h4>
            <CardDetails>Latest Ch. {manga.latestChapter}</CardDetails>
            {/* <p className="text-sm mt-2 line-clamp-4">
              No description available.
            </p> */}
          </div>
        </div>
        <Button className="w-full bg-purple-400 mt-2">
          <Link href={`${manga.link.split("manga/")[2]}`}>Read Now</Link>
        </Button>
      </HoverCardContent>
    </HoverCard>
  );
}

export default function MangaSearchPage({
  searchParams,
}: {
  searchParams: { query?: string; page?: string };
}) {
  const [data, setData] = useState<SearchResponse | null>(null);

  useEffect(() => {
    const query = searchParams.query || "";
    const page = searchParams.page || "1";
    getSearchResults(query, page).then(setData);
  }, [searchParams.query, searchParams.page]);

  if (!searchParams.query) {
    return <p className="text-gray-400 p-6">Enter a search query in the URL.</p>;
  }

  if (!data) {
    return <p className="text-red-400 p-6">Loading results...</p>;
  }

  return (
    <div className="p-6 ">
      <h1 className="text-2xl font-bold mb-4">
        Results for {searchParams.query}
      </h1>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {data.results.map((manga) => (
          <MangaCard key={manga.id} manga={manga} />
        ))}
      </div>
    </div>
  );
}
