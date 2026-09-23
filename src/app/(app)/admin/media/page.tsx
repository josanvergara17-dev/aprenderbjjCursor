import Link from "next/link";
import { redirect } from "next/navigation";
import { loadAdminMediaPageData } from "@/app/actions/admin-media";
import { AdminMediaPanel } from "@/components/admin-media-panel";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";
import { isMockMode } from "@/lib/supabase/config";

export default async function AdminMediaPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/");

  const rows = await loadAdminMediaPageData();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl tracking-wide text-[#e6edf3] uppercase">
            Admin · Media
          </h1>
          <p className="mt-1 text-sm text-[#8b949e]">
            Portadas del mapa en lote y acceso rápido a subir la clase oficial (Mux) por nodo.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/techniques">Editar grafo</Link>
        </Button>
      </div>
      <AdminMediaPanel rows={rows} supabaseRequired={isMockMode()} />
    </div>
  );
}
