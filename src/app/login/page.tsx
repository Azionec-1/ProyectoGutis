"use client";

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const search = useSearchParams();
  const router = useRouter();

  const from = search.get('from') || '/';

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, remember })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión');
      router.push(from);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Fondo con imagen externa */}
      <div
        className="absolute inset-0 bg-no-repeat bg-cover bg-center"
        style={{ backgroundImage: "url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbk_izNkEgNOAZ1KDsA918MTe5GIbE1h9u7w&s')" }}
      />
      {/* Overlay sutil para contraste */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Header con logo */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5">
        <a href="/" className="text-white text-xl font-semibold tracking-wide">
          Agua Gutis
        </a>
        {/* Sin navegación: se elimina Home, About, Services, Contact y Login */}
      </header>

      {/* Contenido centrado */}
      <main className="relative z-10 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-md shadow-2xl">
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
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-9 py-2 text-white placeholder-white/60 outline-none transition focus:border-white/40"
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
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-9 py-2 text-white placeholder-white/60 outline-none transition focus:border-white/40"
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
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  Recuérdame
                </label>
                <a href="#" className="text-white/80 hover:text-white">¿Olvidaste tu contraseña?</a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2 font-medium text-white shadow hover:from-sky-400 hover:to-blue-500 disabled:opacity-60"
              >
                {loading ? 'Entrando…' : 'Login'}
              </button>

              <p className="text-center text-sm text-white/80">
                ¿No tienes cuenta?{' '}
                <a href="/register" className="font-medium text-white hover:underline">Regístrate</a>
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
