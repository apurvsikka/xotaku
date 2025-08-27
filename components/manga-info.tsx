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
  Lightbulb,
} from "lucide-react";
import { MangaCard, MangaConnectionCard } from "./cards";
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
  node: {
    title: { romaji: string; english: string; native: string };
    coverImage: { medium: string; large: string };
  };
}

export default function MangaPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<MangaData | null>(null);
  const [ALData, setALData] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "about" | "chapters" | "connections" | "suggestions"
  >("chapters");

  // Pagination + ordering
  const [page, setPage] = useState(1);
  const [invert, setInvert] = useState(false);
  const perPage = 10;

  // Fetch manga data and connections
  useEffect(() => {
    if (!id) return;

    async function fetchData() {
      setLoading(true);
      try {
        // First get ALID
        const alRes = await fetch(
          `https://anispace-api.vercel.app/api/connections/manga?kakalot=${id}`
        );
        if (!alRes.ok) throw new Error(`Failed: ${alRes.status}`);
        const ALjson = await alRes.json();
        const ALID = ALjson.id;

        // Fetch manga details
        const res = await fetch(
          `https://anispace-api.vercel.app/api/manga/${id}`
        );
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const json = await res.json();
        setData(json);

        // Fetch connections
        const relationsRes = await fetch(
          `https://anispace-api.vercel.app/api/manga/${ALID}/relations`
        );
        if (!relationsRes.ok) throw new Error(`Failed: ${relationsRes.status}`);
        const relations = await relationsRes.json();
        setALData(relations);
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
    const push = (v: number | "dots") => pages.push(v);

    const start = Math.max(2, current - span);
    const end = Math.min(total - 1, current + span);

    push(1);
    if (start > 2) push("dots");
    for (let i = start; i <= end; i++) push(i);
    if (end < total - 1) push("dots");
    if (total > 1) push(total);
    return pages;
  }
  console.log(ALData);

  const pageWindow = getPageWindow(page, totalPages, 1);

  return (
    <div
      className="min-h-screen mt-16"
      style={{ background: "var(--background)", color: "var(--foreground)" }}>
      {/* Hero section */}
      <div className="relative w-full h-[400px] overflow-hidden rounded-lg mb-4 flex bg-[linear-gradient(135deg,#000,var(--background))]">
        {loading ? (
          <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
        ) : data?.image ? (
          <Image
            src={data.image}
            alt={data.title}
            fill
            className="object-cover [data-ratio=portrait]:object-top opacity-80"
          />
        ) : null}
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 shadow-[inset_0_0_200px_rgba(0,0,0,0.9)]" />
        <div className="relative z-10 flex gap-6 px-6 md:px-10 py-8">
          {/* Poster */}
          {loading ? (
            <Skeleton className="w-40 sm:w-48 aspect-[3/4] rounded-xl" />
          ) : (
            <Image
              src={data?.image ?? "/placeholder.svg"}
              alt={data?.title ?? "poster"}
              width={192}
              height={256}
              className="rounded-xl object-cover w-40 sm:w-48 h-auto shadow-lg"
            />
          )}
          {/* Info */}
          <div className="flex-1 flex flex-col justify-end gap-3">
            {loading ? (
              <>
                <Skeleton className="h-10 w-56 sm:w-64 rounded-lg" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </>
            ) : (
              <>
                <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 drop-shadow-lg">
                  <BookOpen className="h-5 w-5" />
                  {data?.title}
                </h1>
                <div className="flex gap-2 flex-wrap">
                  {data?.status && <Badge>{data.status}</Badge>}
                  {data?.genres?.map((g) => (
                    <Badge
                      key={g}
                      variant="secondary"
                      className="flex items-center gap-1">
                      <Tag className="h-3 w-3" /> {g}
                    </Badge>
                  ))}
                </div>
              </>
            )}
            <div className="flex gap-3 mt-2">
              <Link href={`/manga/${id}/1`}>
                <Button variant="outline" className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" /> Add to List
                </Button>
              </Link>
            </div>
            {!loading && (
              <div className="flex flex-wrap gap-4 text-sm opacity-80 mt-1">
                {data?.authors?.length && (
                  <span className="flex items-center gap-2">
                    <User className="h-4 w-4" /> {data.authors.join(", ")}
                  </span>
                )}
                {data?.year && (
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> {data.year}
                  </span>
                )}
                {data?.updatedOn?.length && (
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" /> {data.updatedOn.join(" ")}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-10">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as any)}
          className="w-full">
          <center>
            <TabsList className="grid grid-cols-2 sm:grid-cols-3 w-content  max-w-2x bg-neutral-700/50">
              <TabsTrigger value="about" className="flex items-center gap-2">
                <Info className="h-4 w-4" /> About
              </TabsTrigger>
              <TabsTrigger value="chapters" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Chapters
              </TabsTrigger>
              <TabsTrigger
                value="connections"
                className="flex items-center gap-2">
                <Network className="h-4 w-4" /> Connections
              </TabsTrigger>
            </TabsList>
          </center>

          {/* ABOUT */}
          <TabsContent value="about" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-1 space-y-3">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Info className="h-5 w-5" /> Details
                </h2>
                {loading ? (
                  <>
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-36" />
                  </>
                ) : (
                  <ul className="space-y-1 text-sm">
                    {data?.authors?.length && (
                      <li>
                        <b>Author:</b> {data.authors.join(", ")}
                      </li>
                    )}
                    {data?.year && (
                      <li>
                        <b>Year:</b> {data.year}
                      </li>
                    )}
                    {data?.updatedOn?.length && (
                      <li>
                        <b>Last Updated:</b> {data.updatedOn.join(" ")}
                      </li>
                    )}
                    {data?.status && (
                      <li>
                        <b>Status:</b> {data.status}
                      </li>
                    )}
                  </ul>
                )}
              </div>
              <div className="col-span-2">
                <h2 className="text-xl font-semibold mb-2">Description</h2>
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[95%]" />
                    <Skeleton className="h-4 w-[90%]" />
                    <Skeleton className="h-4 w-[70%]" />
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed">{data?.description}</p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* CHAPTERS */}
          <TabsContent value="chapters" className="mt-6">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <BookOpen className="h-5 w-5" /> Chapters
              </h2>
              {!loading && orderedChapters.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setInvert((v) => !v);
                    setPage(1);
                  }}
                  className="flex items-center gap-1 text-xs">
                  <ArrowUpDown className="h-3.5 w-3.5" />{" "}
                  {invert ? "Oldest first" : "Newest first"}
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {loading
                ? Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-lg p-3 border bg-background/50">
                      <Skeleton className="h-5 w-24 mb-2" />
                      <Skeleton className="h-4 w-[85%]" />
                      <Skeleton className="h-4 w-[60%] mt-2" />
                    </div>
                  ))
                : visibleChapters.map((ch) => (
                    <Link
                      href={`${id}/${ch.chapterNumber}`}
                      key={ch.chapterNumber}
                      className="text-left rounded-xl p-3 border bg-background/60 hover:bg-background transition-all group focus:outline-none focus:ring-2 focus:ring-primary/40">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold truncate flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className="rounded-full px-2 py-0.5 text-xs">
                              Ch. {ch.chapterNumber}
                            </Badge>
                            <span className="truncate">{ch.chapterName}</span>
                          </div>
                          <div className="text-xs opacity-70 mt-1 flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5" />
                            <span>
                              {Array.isArray(ch.timeOfUpload)
                                ? ch.timeOfUpload.join(" ")
                                : ch.timeOfUpload}
                            </span>
                          </div>
                        </div>
                        <Play className="h-4 w-4 flex-shrink-0 transition-transform group-hover:scale-110" />
                      </div>
                    </Link>
                  ))}
            </div>

            {/* Pagination */}
            {!loading && orderedChapters.length > 0 && (
              <div className="mt-6 flex flex-col items-center gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-1">
                    {pageWindow.map((p, idx) =>
                      p === "dots" ? (
                        <span key={`dots-${idx}`} className="px-2 select-none">
                          …
                        </span>
                      ) : (
                        <Button
                          key={p}
                          variant={p === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPage(p)}
                          className="min-w-9">
                          {p}
                        </Button>
                      )
                    )}
                  </div>
                  <Button
                    variant="secondary"
                    size="icon"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-xs opacity-75">
                  Page {page} of {totalPages}
                </div>
              </div>
            )}
          </TabsContent>

          {/* CONNECTIONS */}
          <TabsContent
            value="connections"
            className="mt-6"
            suppressHydrationWarning>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl p-3 border bg-background/60">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-[80%]" />
                  </div>
                ))}
              </div>
            ) : (
              <CardContainer>
                {ALData?.filter(
                  (connection) => connection && connection.node
                ).map((connection, idx) => (
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
