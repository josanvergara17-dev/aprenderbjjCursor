import { RegisterForm } from "@/components/register-form";

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#123044_0%,_#05080f_55%)]"
      />
      <div className="relative w-full max-w-md rounded-2xl border border-[#21262d] bg-[#0d1117]/90 p-8 shadow-[0_0_60px_rgb(0_212_255_/0.08)]">
        <p className="font-heading text-center text-3xl tracking-wide text-[#e6edf3] uppercase">
          No-Gi Lab
        </p>
        <p className="mt-2 mb-6 text-center text-sm text-[#8b949e]">Crea tu cuenta de alumno o maestro.</p>
        <RegisterForm />
      </div>
    </div>
  );
}
