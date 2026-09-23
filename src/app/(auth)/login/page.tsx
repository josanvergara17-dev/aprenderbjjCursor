import { LoginForm } from "@/components/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const nextPath =
    params.next && params.next.startsWith("/") && !params.next.startsWith("//")
      ? params.next
      : "/";

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#123044_0%,_#05080f_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-[#00d4ff]/10 blur-3xl"
      />
      <div className="relative w-full max-w-md rounded-2xl border border-[#21262d] bg-[#0d1117]/90 p-8 shadow-[0_0_60px_rgb(0_212_255_/0.08)]">
        <p className="font-heading text-center text-3xl tracking-wide text-[#e6edf3] uppercase">
          No-Gi Lab
        </p>
        <p className="mt-2 mb-6 text-center text-sm text-[#8b949e]">
          Entra para ver el mapa, la galería y la revisión de técnicas.
        </p>
        <LoginForm nextPath={nextPath} />
      </div>
    </div>
  );
}
