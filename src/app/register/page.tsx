"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, Lock, Phone, IdCard, UserRound } from "lucide-react";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phone, documentId, email, password })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "No se pudo registrar la cuenta.");
      }

      setSuccess(data.message || "Cuenta creada correctamente. Esperando que se verifique la cuenta.");
      setFullName("");
      setPhone("");
      setDocumentId("");
      setEmail("");
      setPassword("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo registrar la cuenta.");
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
        <div className="w-full max-w-lg">
          <div className="rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-md">
            <h1 className="mb-1 text-center text-2xl font-semibold text-white">Registro de repartidor</h1>
            <p className="mb-6 text-center text-sm text-white/70">Crea tu cuenta para que el administrador la verifique</p>

            {error && (
              <div className="mb-4 rounded border border-red-400 bg-red-50/10 p-2 text-sm text-red-200" role="alert">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 rounded border border-emerald-300 bg-emerald-50/10 p-3 text-sm text-emerald-100" role="status">
                {success}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-white/80">Nombre completo</label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-white/60">
                    <UserRound size={16} />
                  </span>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-9 py-2 text-white outline-none transition placeholder:text-white/60 focus:border-white/40"
                    placeholder="Nombre y apellidos"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-white/80">Teléfono</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-white/60">
                      <Phone size={16} />
                    </span>
                    <input
                      type="text"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      className="w-full rounded-lg border border-white/20 bg-white/10 px-9 py-2 text-white outline-none transition placeholder:text-white/60 focus:border-white/40"
                      placeholder="9 dígitos"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-white/80">Documento</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-white/60">
                      <IdCard size={16} />
                    </span>
                    <input
                      type="text"
                      value={documentId}
                      onChange={(event) => setDocumentId(event.target.value)}
                      className="w-full rounded-lg border border-white/20 bg-white/10 px-9 py-2 text-white outline-none transition placeholder:text-white/60 focus:border-white/40"
                      placeholder="DNI o documento"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm text-white/80">Correo</label>
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
                    placeholder="Mínimo 8 caracteres"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2 font-medium text-white shadow hover:from-sky-400 hover:to-blue-500 disabled:opacity-60"
              >
                {loading ? "Registrando..." : "Registrar cuenta"}
              </button>

              <p className="text-center text-sm text-white/80">
                ¿Ya tienes cuenta?{" "}
                <Link href="/login" className="font-medium text-white hover:underline">
                  Inicia sesión
                </Link>
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
