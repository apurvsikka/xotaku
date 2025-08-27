"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import styled, { css, keyframes } from "styled-components";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import React from "react";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "./ui/hover-card";
import { Button } from "./ui/button";

function slugify(text: string) {
  // if (!text) return "21st-century-boys"; // fallback if null/undefined
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function getSafeTitle(connection: Connection): string {
  const titles = connection.node.title;
  if (!titles) return "unknown";

  if (titles.english) return titles.english;
  if (titles.romaji) return titles.romaji;
  if (titles.native) return titles.native;
  return "unknown";
}

function getSlug(connection: Connection): string {
  const safeTitle = getSafeTitle(connection);
  try {
    return slugify(safeTitle);
  } catch {
    return "unknown";
  }
}

// === Types ===
interface Manga {
  id: string;
  title: string;
  image: string;
  latestChapter?: string;
  description?: string;
}

interface MangaCardProps {
  manga: Manga;
}



// === Hook: detect screen size ===
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

// === Skeleton ===
const BaseSkeleton = styled.div`
  background: var(--global-primary-skeleton);
  border-radius: var(--global-border-radius);
`;

const pulseAnimation = keyframes`
    0%, 100% { background-color: var(--global-primary-skeleton); }
    50% { background-color: var(--global-secondary-skeleton); }
  `;

const SkeletonCard = styled(BaseSkeleton)`
  width: 100%;
  height: 0;
  padding-top: calc(100% * 184 / 133);
  margin-bottom: 5.1rem;
  animation: ${pulseAnimation} 1.2s infinite ease-in-out;
`;

// === Styled Components ===
const CardWrapper = styled(Link)`
  color: var(--global-text);
  text-decoration: none;
  display: block;
  animation: slideUp 0.4s ease;
  &:hover,
  &:active,
  &:focus {
    z-index: 2;
  }
`;

const CardItem = styled.div`
  width: 85%;
  border-radius: var(--global-border-radius);
  cursor: pointer;
  transform: scale(1);
  transition: 0.2s ease-in-out;
  position: relative;
`;

const PlayIcon = styled(Play)`
  position: absolute;
  top: 50%;
  left: 50%;
  color: #fff;
  transform: translate(-50%, -50%);
  fill: #fff;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
  width: 48px;
  height: 48px;

  ${CardItem}:hover & {
    opacity: 1;
  }
`;

const CardImageWrapper = styled.div`
  transition: 0.2s ease-in-out;
  backdrop-blur: 50px;
`;

export const CardImage = styled.div`
  position: relative;
  text-align: left;
  overflow: hidden;
  border-radius: var(--global-border-radius);
  padding-top: calc(100% * 184 / 133);
  background: var(--global-card-bg);
  box-shadow: 2px 2px 10px var(--global-card-shadow);
  transition:
    background-color 0.2s ease-in-out,
    transform 0.2s ease-in-out;
  animation: slideUp 0.5s ease-in-out;

  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition:
      transform 0.3s ease,
      filter 0.3s ease;
  }

  &:hover img {
    filter: blur(6px);
    transform: scale(1.15);
  }
`;

const TitleContainer = styled.div<{ $isHovered: boolean }>`
  display: flex;
  align-items: center;
  padding: 0.5rem;
  margin-top: 0.35rem;
  gap: 0.4rem;
  border-radius: var(--global-border-radius);
  cursor: pointer;
  transition: background 0.2s ease;

  background: ${(p) =>
    p.$isHovered ? "var(--global-card-title-bg)" : "transparent"};
`;

const Title = styled.h5<{ $isHovered: boolean }>`
  margin: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: ${(props) => (props.$isHovered ? "#cd78f6" : "var(--foreground)")};
  transition: 0.2s ease-in-out;

  @media (max-width: 500px) {
    font-size: 0.7rem;
  }
`;

const CardDetails = styled.div`
  width: 100%;
  font-family: Arial;
  font-weight: bold;
  font-size: 0.75rem;
  margin: 0;
  color: var(--foreground);
  display: flex;
  align-items: center;
  padding: 0.25rem 0rem;
  gap: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ImgDetail = styled.p<{ $isHovered: boolean }>`
  position: absolute;
  bottom: 0;
  left: 0;
  margin: 0.25rem;
  padding: 0.2rem 0.6rem;
  font-size: 0.8rem;
  font-weight: bold;
  color: black;
  opacity: ${(p) => (p.$isHovered ? 1 : 0)};
  background-color: #fff;
  border-radius: 10vh;
  backdrop-filter: blur(10px);
  transition: opacity 0.3s ease;
`;

// === Manga Card ===
export function MangaCard({ manga }: MangaCardProps) {
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 0);
    return () => clearTimeout(timer);
  }, [manga.id]);

  const truncateTitle = useMemo(
    () => (title: string, maxLength: number) =>
      title.length > maxLength ? `${title.slice(0, maxLength)}...` : title,
    []
  );

  if (loading)
    return (
      <div className="relative w-full bg-black flex items-center justify-center lg:rounded-lg overflow-hidden">
        <div className="animate-spin w-12 h-12 border-4 border-white/20 border-t-white rounded-full"></div>

        <span className="ml-4 text-white text-xl font-medium">
          Loading manga...
        </span>
      </div>
    );

  // === If large screen, wrap in HoverCard ===
  if (isLargeScreen) {
    return (
      <HoverCard openDelay={300} closeDelay={100}>
        <HoverCardTrigger asChild>
          <CardWrapper
            href={`manga/${manga.id}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}>
            <CardItem>
              <CardImageWrapper>
                <CardImage>
                  <Image src={manga.image} alt={manga.title} fill />
                  <PlayIcon />
                </CardImage>
              </CardImageWrapper>

              <TitleContainer
                $isHovered={isHovered}
                className="text-foreground">
                <Title $isHovered={isHovered} title={"Title: " + manga.title}>
                  {truncateTitle(manga.title, 35)}
                </Title>
              </TitleContainer>
            </CardItem>
          </CardWrapper>
        </HoverCardTrigger>

        <HoverCardContent
          side="right"
          className=" w-96 bg-background/70 border-gray-700/50 backdrop-blur-md text-foreground">
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
              <CardDetails>
                {truncateTitle(manga.latestChapter || "", 24)}
              </CardDetails>
              <p className="text-sm mt-2 line-clamp-4">
                {manga.description || "No description available."}
              </p>
            </div>
          </div>
          <Button className="w-full bg-purple-400 mt-2">
            <Link href={`/manga/${manga.id}`}>Read Now</Link>
          </Button>
        </HoverCardContent>
      </HoverCard>
    );
  }

  // === Small screens: just normal card ===
  return (
    <CardWrapper
      href={`manga/${manga.id}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      <CardItem>
        <CardImageWrapper>
          <CardImage>
            <Image src={manga.image} alt={manga.title} fill />
            <PlayIcon />
          </CardImage>
        </CardImageWrapper>

        <TitleContainer $isHovered={isHovered}>
          <Title $isHovered={isHovered} title={"Title: " + manga.title}>
            {truncateTitle(manga.title, 35)}
          </Title>
        </TitleContainer>

        <CardDetails>
          {truncateTitle(manga.latestChapter || "", 24)}
        </CardDetails>
      </CardItem>
    </CardWrapper>
  );
}

interface Connection {
  relationType: string;
  node: {
    type: "ANIME" | "MANGA";
    id: string;
    title: { romaji: string; english: string; native: string };
    coverImage: { medium: string; large: string };
  };
}

interface MangaConnectionCardProps {
  connection: Connection;
}

// export function MangaConnectionCard({ connection }: MangaConnectionCardProps) {
//   // Guard against undefined
//   if (!connection || !connection.node) return null;

//   const [loading, setLoading] = useState(true);
//   const [isHovered, setIsHovered] = useState(false);
//   const isLargeScreen = useMediaQuery("(min-width: 1024px)");

//   const mangaTitle =
//     connection.node.title?.romaji ||
//     connection.node.title?.english ||
//     connection.node.title?.native ||
//     "Unknown";

//   const truncateTitle = useMemo(
//     () => (title: string, maxLength: number) =>
//       title.length > maxLength ? `${title.slice(0, maxLength)}...` : title,
//     []
//   );

//   useEffect(() => {
//     const timer = setTimeout(() => setLoading(false), 0);
//     return () => clearTimeout(timer);
//   }, [connection.node.title]);

//   if (loading)
//     return (
//       <div className="relative w-full bg-black flex items-center justify-center lg:rounded-lg overflow-hidden">
//         <div className="animate-spin w-12 h-12 border-4 border-white/20 border-t-white rounded-full"></div>
//         <span className="ml-4 text-white text-xl font-medium">
//           Loading connection...
//         </span>
//       </div>
//     );

//   // Large screen: HoverCard
//   if (isLargeScreen) {
//     return (
//       <HoverCard openDelay={300} closeDelay={100}>
//         <HoverCardTrigger asChild>
//           <CardWrapper
//             href={`/manga/${encodeURIComponent(slugify(connection.node.title.english))}`}
//             onMouseEnter={() => setIsHovered(true)}
//             onMouseLeave={() => setIsHovered(false)}>
//             <CardItem>
//               <CardImageWrapper>
//                 <CardImage>
//                   <Image
//                     src={
//                       connection.node.coverImage?.large || "/placeholder.svg"
//                     }
//                     alt={mangaTitle}
//                     fill
//                   />
//                   <PlayIcon />
//                 </CardImage>
//               </CardImageWrapper>

//               <TitleContainer $isHovered={isHovered}>
//                 <Title $isHovered={isHovered} title={"Title: " + mangaTitle}>
//                   {truncateTitle(mangaTitle, 35)}
//                 </Title>
//               </TitleContainer>
//             </CardItem>
//           </CardWrapper>
//         </HoverCardTrigger>

//         <HoverCardContent
//           side="right"
//           className="w-96 bg-background/70 border-gray-700/50 backdrop-blur-md text-foreground">
//           <div className="flex gap-4">
//             <img
//               src={connection.node.coverImage?.large || "/placeholder.svg"}
//               alt={mangaTitle}
//               className="w-24 h-32 object-cover rounded-md"
//             />
//             <div className="flex-1">
//               <h4 className="font-semibold text-purple-400 text-lg">
//                 {mangaTitle}
//               </h4>
//               <CardDetails>
//                 {truncateTitle(connection.relationType || "", 24)}
//               </CardDetails>
//               <p className="text-sm mt-2 line-clamp-4">
//                 No description available.
//               </p>
//             </div>
//           </div>
//           <Button className="w-full bg-purple-400 mt-2">
//             <Link
//               href={`/manga/${slugify(connection.node.title.english || connection.node.title.romaji)}`}>
//               Read Now
//             </Link>
//           </Button>
//         </HoverCardContent>
//       </HoverCard>
//     );
//   }

//   // Small screens: normal car

// }

export function MangaConnectionCard({
  connection,
}: {
  connection: Connection;
}) {
  if (!connection || !connection.node) return null;

  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");

  const mangaTitle =
    connection.node.title?.romaji ||
    connection.node.title?.english ||
    connection.node.title?.native ||
    "Unknown";

  const truncateTitle = useMemo(
    () => (title: string, maxLength: number) =>
      title.length > maxLength ? `${title.slice(0, maxLength)}...` : title,
    []
  );

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 0);
    return () => clearTimeout(timer);
  }, [connection.node.title]);

  // Determine link based on type
  const link =
    connection.node.type === "ANIME"
      ? `/anime/${connection.node.id}`
      : `/manga/${getSlug(connection)}`;

  if (loading)
    return (
      <div className="relative w-full bg-black flex items-center justify-center lg:rounded-lg overflow-hidden">
        <div className="animate-spin w-12 h-12 border-4 border-white/20 border-t-white rounded-full"></div>
        <span className="ml-4 text-white text-xl font-medium">
          Loading connection...
        </span>
      </div>
    );

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

  const imageSrc =
    connection.node.coverImage?.large ||
    connection.node.coverImage?.medium ||
    "/placeholder.svg";

  if (isLargeScreen) {
    return (
      <HoverCard openDelay={300} closeDelay={100}>
        <HoverCardTrigger asChild>
          <CardWrapper
            href={link}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}>
            <CardItem>
              <CardImageWrapper>
                <CardImage>
                  <Image src={imageSrc} alt={mangaTitle} fill />
                  <PlayIcon />
                  <Badge>{connection.node.type}</Badge>
                </CardImage>
              </CardImageWrapper>

              <TitleContainer $isHovered={isHovered}>
                <Title $isHovered={isHovered} title={mangaTitle}>
                  {truncateTitle(mangaTitle, 35)}
                </Title>
              </TitleContainer>
            </CardItem>
          </CardWrapper>
        </HoverCardTrigger>

        <HoverCardContent
          side="right"
          className="w-96 bg-background/70 border-gray-700/50 backdrop-blur-md text-foreground">
          <div className="flex gap-4">
            <img
              src={imageSrc}
              alt={mangaTitle}
              className="w-24 h-32 object-cover rounded-md"
            />
            <div className="flex-1">
              <h4 className="font-semibold text-purple-400 text-lg">
                {mangaTitle}
              </h4>
              <CardDetails>
                {truncateTitle(connection.relationType || "", 24)}
              </CardDetails>
              <p className="text-sm mt-2 line-clamp-4">
                No description available.
              </p>
            </div>
          </div>
          {/* const mangaTitle = getSafeTitle(connection); const link =
          connection.type === "ANIME" ? `/anime/${connection.node.id}` :
          `/manga/${connection.node.id}` */}
          <Button className="w-full bg-purple-400 mt-2">
            <Link href={link}>
              {connection.node.type === "ANIME" ? "Watch Now" : "Read Now"}
            </Link>
          </Button>
        </HoverCardContent>
      </HoverCard>
    );
  }

  // Small screen
  return (
    <CardWrapper
      href={link}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      <CardItem>
        <CardImageWrapper>
          <CardImage>
            <Image src={imageSrc} alt={mangaTitle} fill />
            <PlayIcon />
            <Badge>{connection.node.type}</Badge>
          </CardImage>
        </CardImageWrapper>

        <TitleContainer $isHovered={isHovered}>
          <Title $isHovered={isHovered} title={mangaTitle}>
            {truncateTitle(mangaTitle, 35)}
          </Title>
        </TitleContainer>

        <CardDetails>
          {truncateTitle(connection.relationType || "", 24)}
        </CardDetails>
      </CardItem>
    </CardWrapper>
  );
}
