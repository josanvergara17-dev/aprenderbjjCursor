import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { UploadTechniqueForm } from "@/components/upload-technique-form";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";

export default async function UploadTechniquePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "master") redirect("/videos");

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <Button asChild variant="outline" size="sm" className="mb-6">
        <Link href="/videos">
          <ArrowLeft />
          Volver a la galería
        </Link>
      </Button>
      <h1 className="font-heading mb-2 text-3xl tracking-wide text-[#e6edf3] uppercase">
        Subir Nueva Técnica
      </h1>
      <p className="mb-8 text-sm text-[#8b949e]">
        Publica un vídeo oficial que aparecerá en la galería para todos los alumnos.
      </p>
      <UploadTechniqueForm />
    </div>
  );
}
