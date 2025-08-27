"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Calendar,
  User,
  Tag,
  Info,
  Play,
  Clock,
  Sparkles,
  Network,
} from "lucide-react";
import { MangaConnectionCard } from "./cards";
import Link from "next/link";
import { CardContainer } from "./card-container";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

interface Chapter {
  chapterName: string;
  chapterNumber: string;
  timeOfUpload: string | string[];
}

interface MangaData {
  id?: string;
  title: string;
  description?: string;
  image?: string;
  authors?: string[];
  status?: string;
  genres?: string[];
  year?: number;
  updatedOn?: string[];
  chapters?: Chapter[];
}

interface Connection {
  relationType: string;
  node?: {
    title?: { romaji?: string; english?: string; native?: string };
    coverImage?: { medium?: string; large?: string };
    type?: string;
    id?: string;
  };
}

export default function MangaPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<MangaData | null>(null);
  const [ALData, setALData] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "about" | "chapters" | "connections"
  >("chapters");

  // Pagination + ordering
  const [page, setPage] = useState(1);
  const [invert, setInvert] = useState(false);
  const perPage = 10;

  // Fetch manga data + connections
  useEffect(() => {
    if (!id) return;

    async function fetchData() {
      setLoading(true);
      try {
        const alRes = await fetch(
          `https://anispace-api.vercel.app/api/connections/manga?kakalot=${id}`
        );
        const ALjson = alRes.ok ? await alRes.json() : {};
        const ALID = ALjson?.id;

        const res = await fetch(
          `https://anispace-api.vercel.app/api/manga/${id}`
        );
        const json = res.ok ? await res.json() : {};
        setData(json);

        if (ALID) {
          const relationsRes = await fetch(
            `https://anispace-api.vercel.app/api/manga/${ALID}/relations`
          );
          const relations = relationsRes.ok ? await relationsRes.json() : [];
          setALData(relations || []);
        }
      } catch (err) {
        console.error(err);
        setALData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  // Chapter ordering
  const orderedChapters = useMemo(() => {
    if (!data?.chapters?.length) return [];
    return invert ? [...data.chapters].reverse() : data.chapters;
  }, [data?.chapters, invert]);

  const totalPages = Math.max(1, Math.ceil(orderedChapters.length / perPage));
  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const visibleChapters = useMemo(
    () => orderedChapters.slice((page - 1) * perPage, page * perPage),
    [orderedChapters, page]
  );

  function getPageWindow(current: number, total: number, span = 1) {
    const pages: (number | "dots")[] = [];
    const start = Math.max(2, current - span);
    const end = Math.min(total - 1, current + span);

    pages.push(1);
    if (start > 2) pages.push("dots");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < total - 1) pages.push("dots");
    if (total > 1) pages.push(total);
    return pages;
  }

  const pageWindow = getPageWindow(page, totalPages, 1);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative w-full h-[250px] sm:h-[400px] overflow-hidden  mb-4 flex">
        {loading ? (
          <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
        ) : data?.image ? (
          <Image
            src={data.image}
            alt={data.title}
            fill
            className="object-cover opacity-80"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="relative z-10 flex gap-4 sm:gap-6 px-4 sm:px-8 py-6 sm:py-8">
          {/* Poster */}
          {loading ? (
            <Skeleton className="sm:w-40  rounded-lg" />
          ) : (
            <Image
              src={data?.image ?? "/placeholder.svg"}
              alt={data?.title ?? "poster"}
              height={192}
              width={45}
              className="rounded-lg object-cover  w-28 sm:w-[25vh] shadow-lg"
            />
          )}
          {/* Info */}
          <div className="flex-1 flex flex-col justify-end gap-2 sm:gap-3">
            {loading ? (
              <>
                <Skeleton className="h-8 w-40 sm:w-56" />
                <Skeleton className="h-6 w-24 sm:w-32" />
              </>
            ) : (
              <>
                <h1 className="text-lg sm:text-2xl font-bold flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  {data?.title}
                </h1>
                <div className="flex gap-2 flex-wrap">
                  {data?.status && <Badge>{data.status}</Badge>}
                  {data?.genres?.map((g) => (
                    <Badge key={g} variant="secondary">
                      <Tag className="h-3 w-3" /> {g}
                    </Badge>
                  ))}
                </div>
                <div className="mt-2">
                  <Link href={`/manga/${id}/1`}>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Sparkles className="h-4 w-4" /> Read First
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 pb-10">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as any)}
          className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto bg-neutral-800/50">
            <TabsTrigger value="about">
              <Info className="h-4 w-4 mr-1" /> About
            </TabsTrigger>
            <TabsTrigger value="chapters">
              <BookOpen className="h-4 w-4 mr-1" /> Chapters
            </TabsTrigger>
            <TabsTrigger value="connections">
              <Network className="h-4 w-4 mr-1" /> Connections
            </TabsTrigger>
          </TabsList>

          {/* ABOUT TAB */}
          <TabsContent value="about" className="mt-6">
            <p className="text-sm leading-relaxed">
              {loading ? (
                <>
                  <Skeleton className="h-4 w-[90%]" />
                  <Skeleton className="h-4 w-[80%]" />
                </>
              ) : (
                (data?.description ?? "No description available.")
              )}
            </p>
          </TabsContent>

          {/* CHAPTERS TAB */}
          <TabsContent value="chapters" className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <BookOpen className="h-5 w-5" /> Chapters
              </h2>
              {orderedChapters.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setInvert((v) => !v);
                    setPage(1);
                  }}
                  className="gap-1 text-xs">
                  <ArrowUpDown className="h-3 w-3" />{" "}
                  {invert ? "Oldest first" : "Newest first"}
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-lg" />
                  ))
                : visibleChapters.map((ch) => (
                    <Link
                      href={`/manga/${id}/${ch.chapterNumber}`}
                      key={ch.chapterNumber}
                      className="rounded-lg p-3 border bg-background/50 hover:bg-background transition">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold truncate">
                          Ch. {ch.chapterNumber} — {ch.chapterName}
                        </div>
                        <Play className="h-4 w-4 opacity-70" />
                      </div>
                      <div className="text-xs opacity-70 mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {Array.isArray(ch.timeOfUpload)
                          ? ch.timeOfUpload.join(" ")
                          : ch.timeOfUpload}
                      </div>
                    </Link>
                  ))}
            </div>

            {/* Pagination */}
            {orderedChapters.length > 0 && (
              <div className="mt-6 flex flex-col items-center gap-2">
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="secondary"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {pageWindow.map((p, idx) =>
                    p === "dots" ? (
                      <span key={idx} className="px-2">
                        …
                      </span>
                    ) : (
                      <Button
                        key={p}
                        size="sm"
                        variant={p === page ? "default" : "outline"}
                        onClick={() => setPage(p)}>
                        {p}
                      </Button>
                    )
                  )}
                  <Button
                    size="icon"
                    variant="secondary"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-xs opacity-70">
                  Page {page} of {totalPages}
                </span>
              </div>
            )}
          </TabsContent>

          {/* CONNECTIONS TAB */}
          <TabsContent value="connections" className="mt-6">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <CardContainer>
                {ALData.filter((c) => c?.node).map((connection, idx) => (
                  <MangaConnectionCard key={idx} connection={connection} />
                ))}
              </CardContainer>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
