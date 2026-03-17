"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [from, setFrom] = useState('/');
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setFrom(params.get('from') || '/');
  }, []);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, remember }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      router.push(from);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbk_izNkEgNOAZ1KDsA918MTe5GIbE1h9u7w&s')" }}
      />
      <div className="absolute inset-0 bg-black/20" />

      <header className="relative z-10 flex items-center justify-between px-6 py-5">
        <Link href="/" className="text-xl font-semibold tracking-wide text-white">
          Agua Gutis
        </Link>
      </header>

      <main className="relative z-10 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-md">
            <h1 className="mb-1 text-center text-2xl font-semibold text-white">Login</h1>
            <p className="mb-6 text-center text-sm text-white/70">Accede para continuar</p>

            {error && (
              <div className="mb-4 rounded border border-red-400 bg-red-50/10 p-2 text-sm text-red-200" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-white/80">Email</label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-white/60">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-9 py-2 text-white outline-none transition placeholder:text-white/60 focus:border-white/40"
                    placeholder="correo@ejemplo.com"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm text-white/80">Contraseña</label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-white/60">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-9 py-2 text-white outline-none transition placeholder:text-white/60 focus:border-white/40"
                    placeholder="********"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-white/80">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-white/30 bg-transparent"
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                  />
                  Recuérdame
                </label>
                <span className="text-white/80">¿Olvidaste tu contraseña?</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2 font-medium text-white shadow hover:from-sky-400 hover:to-blue-500 disabled:opacity-60"
              >
                {loading ? 'Entrando...' : 'Iniciar sesión'}
              </button>

              <p className="text-center text-sm text-white/80">
                ¿No tienes cuenta?{' '}
                <Link href="/register" className="font-medium text-white hover:underline">
                  Regístrate
                </Link>
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
