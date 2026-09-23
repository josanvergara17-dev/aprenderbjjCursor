import { redirect } from "next/navigation";
import { loadAdminTechniquesPageData } from "@/app/actions/admin-techniques";
import { AdminTechniquesPanel } from "@/components/admin-techniques-panel";
import { getCurrentUser } from "@/lib/auth/session";
import { isMockMode } from "@/lib/supabase/config";

export default async function AdminTechniquesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/");

  const techniques = await loadAdminTechniquesPageData();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <h1 className="font-heading text-3xl tracking-wide text-[#e6edf3] uppercase">
        Admin · Mapa de técnicas
      </h1>
      <p className="mt-1 mb-6 text-sm text-[#8b949e]">
        Crea nodos, sube portadas y define conexiones padre → hijo. El mapa público lee estas tablas.
      </p>
      {isMockMode() ? (
        <p className="mb-4 rounded-lg border border-amber-800/40 bg-amber-950/30 px-3 py-2 text-sm text-amber-100">
          Modo mock: puedes ver la lista demo. Para guardar cambios, usa Supabase real (
          `NEXT_PUBLIC_USE_MOCK_AUTH=false`) y ejecuta las migraciones SQL.
        </p>
      ) : null}
      <AdminTechniquesPanel techniques={techniques} />
    </div>
  );
}
