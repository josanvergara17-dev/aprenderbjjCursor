import Link from "next/link";
import { ChevronLeft, ChevronRight, Upload } from "lucide-react";
import type { AppUser } from "@/lib/auth/types";
import type { VideoPage } from "@/lib/data/videos";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function pageItems(current: number, totalPages: number): number[] {
  const windowSize = 5;
  let start = Math.max(1, current - Math.floor(windowSize / 2));
  const end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function VideoGallery({
  user,
  data,
}: {
  user: AppUser;
  data: VideoPage;
}) {
  const { items, page, totalPages, total } = data;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl tracking-wide text-[#e6edf3] uppercase">
            Galería de técnicas
          </h1>
          <p className="mt-1 text-sm text-[#8b949e]">
            {total} vídeos · {data.pageSize} por página (5 columnas × 10 filas)
          </p>
        </div>
        {user.role === "master" ? (
          <Button asChild size="lg" className="bg-[#00d4ff] text-[#041018] hover:bg-[#00d4ff]/90">
            <Link href="/videos/subir">
              <Upload />
              Subir Nueva Técnica
            </Link>
          </Button>
        ) : null}
      </div>

      {items.length === 0 ? (
        <p className="rounded-lg border border-[#21262d] bg-[#0d1117] px-4 py-8 text-center text-[#8b949e]">
          Todavía no hay vídeos en la galería.
        </p>
      ) : (
        <ul className="grid grid-cols-5 gap-3 max-md:grid-cols-2 max-lg:grid-cols-3">
          {items.map((video) => (
            <li key={video.id} className="group">
              <article className="overflow-hidden rounded-lg border border-[#21262d] bg-[#0d1117] transition group-hover:border-[#00d4ff]/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={video.thumbnailUrl}
                  alt=""
                  className="aspect-video w-full object-cover bg-[#161b22]"
                />
                <h2 className="px-2 py-2 text-sm text-[#e6edf3] line-clamp-2">{video.title}</h2>
              </article>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 ? (
        <nav
          className="mt-8 flex flex-wrap items-center justify-center gap-2"
          aria-label="Paginación"
        >
          <Button asChild variant="outline" size="sm" disabled={page <= 1}>
            <Link
              href={page <= 1 ? `/videos?page=${page}` : `/videos?page=${page - 1}`}
              aria-disabled={page <= 1}
              className={cn(page <= 1 && "pointer-events-none opacity-50")}
            >
              <ChevronLeft />
              Anterior
            </Link>
          </Button>
          {pageItems(page, totalPages).map((pageNumber) => (
            <Button
              key={pageNumber}
              asChild
              size="sm"
              variant={pageNumber === page ? "default" : "outline"}
            >
              <Link href={`/videos?page=${pageNumber}`}>{pageNumber}</Link>
            </Button>
          ))}
          <Button asChild variant="outline" size="sm" disabled={page >= totalPages}>
            <Link
              href={
                page >= totalPages ? `/videos?page=${page}` : `/videos?page=${page + 1}`
              }
              aria-disabled={page >= totalPages}
              className={cn(page >= totalPages && "pointer-events-none opacity-50")}
            >
              Siguiente
              <ChevronRight />
            </Link>
          </Button>
        </nav>
      ) : null}
    </div>
  );
}
