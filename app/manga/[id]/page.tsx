import MangaInfo from "@/components/manga-info"

interface MangaPageProps {
  params: {
    id: string
  }
}

export default function MangaPage({ params }: MangaPageProps) {
  return <MangaInfo mangaId={decodeURIComponent(params.id)} />
}
