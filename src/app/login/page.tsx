"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [from, setFrom] = useState("/");
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setFrom(params.get("from") || "/");
  }, []);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al iniciar sesión.");
      }

      router.push(data.user?.role === "WORKER" ? "/my-orders" : from);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-[center_top_-4rem] bg-no-repeat md:bg-[center_top_-6rem] lg:bg-[center_top_-8rem]"
        style={{ backgroundImage: "url('/login-gutis.png')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-sky-100/46 via-white/20 to-cyan-100/52" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.18),transparent_58%)]" />

      <header className="relative z-10 flex items-center justify-between px-6 py-5">
        <Link href="/" className="text-xl font-semibold tracking-wide text-sky-950 drop-shadow-sm">
          Agua Gutis
        </Link>
      </header>

      <main className="relative z-10 flex items-center justify-center px-4 py-10 md:justify-end md:px-10 lg:px-16">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-white/70 bg-white/58 p-6 shadow-2xl backdrop-blur-md">
            <h1 className="mb-1 text-center text-2xl font-semibold text-slate-900">Inicio de sesión</h1>
            <p className="mb-6 text-center text-sm text-slate-600">Accede para continuar</p>

            {error ? (
              <div className="mb-4 rounded border border-red-200 bg-red-50/90 p-2 text-sm text-red-700" role="alert">
                {error}
              </div>
            ) : null}

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-slate-700">Correo</label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-200 bg-white/90 px-9 py-2.5 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-400"
                    placeholder="correo@ejemplo.com"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-700">Contrasena</label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-200 bg-white/90 px-9 py-2.5 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-400"
                    placeholder="********"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2.5 font-medium text-white shadow hover:from-sky-400 hover:to-blue-500 disabled:opacity-60"
              >
                {loading ? "Entrando..." : "Iniciar sesión"}
              </button>

              <p className="text-center text-sm text-slate-600">
                El registro publico queda solo para la configuracion inicial del administrador.
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
