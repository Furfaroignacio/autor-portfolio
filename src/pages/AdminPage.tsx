import { useEffect, useState } from "react";
import { Container } from "../components/ui/Container";
import { supabase } from "../lib/supabase";
import { signInWithMagicLink, signInWithPassword, signOut } from "../auth/auth";
import { AdminPosts } from "../sections/admin/AdminPosts";

const AUTHOR_EMAIL = "furfaroignacio@gmail.com";

export function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const [sendingMagic, setSendingMagic] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
  let mounted = true;

  // sesión inicial
  supabase.auth.getSession().then(({ data }) => {
    if (!mounted) return;
    setSessionEmail(data.session?.user?.email ?? null);
  });

  // escuchar cambios (usa la session del evento)
  const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
    setSessionEmail(session?.user?.email ?? null);
  });

  return () => {
    mounted = false;
    sub.subscription.unsubscribe();
  };
}, []);


  const isAuthed = !!sessionEmail;
  const isAuthor = sessionEmail === AUTHOR_EMAIL;

  async function handleLoginPassword() {
  try {
    setSigningIn(true);
    setStatus("Iniciando sesión…");
    await signInWithPassword(email.trim(), password);
    await supabase.auth.getSession();
    setStatus(null);
  } catch (e: any) {
    setStatus(e?.message ?? "Error al iniciar sesión con contraseña");
  } finally {
    setSigningIn(false);
  }
}


  async function handleLoginMagic() {
    try {
      setSendingMagic(true);
      setStatus("Enviando link al email…");
      await signInWithMagicLink(email.trim());
      setStatus("Listo. Revisá tu email y abrí el link para entrar.");
    } catch (e: any) {
      setStatus(e?.message ?? "Error enviando magic link");
    } finally {
      setSendingMagic(false);
    }
  }

  async function handleLogout() {
    try {
      await signOut();
      setStatus(null);
    } catch (e: any) {
      setStatus(e?.message ?? "Error al cerrar sesión");
    }
  }

  return (
    <section className="py-16">
      <Container>
        <h1 className="font-serif text-3xl">Admin</h1>
        <p className="mt-2 text-neutral-600">Gestión del blog (solo autor).</p>

        <div className="mt-8 rounded-3xl border border-black/10 bg-white/60 p-6 shadow-sm">
          {!isAuthed ? (
            <>
              <p className="text-neutral-700">
                Entrá con contraseña (recomendado). El magic link puede limitarse por rate-limit.
              </p>

              <div className="mt-4 grid gap-3">
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="tuemail@dominio.com"
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
                />

                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="contraseña"
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
                />

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    onClick={handleLoginPassword}
                    disabled={signingIn || !email || !password}
                    className="rounded-xl bg-black px-4 py-3 text-sm font-medium text-white hover:bg-black/90 transition disabled:opacity-60"
                  >
                    {signingIn ? "Entrando..." : "Entrar con contraseña"}
                  </button>

                  <button
                    onClick={handleLoginMagic}
                    disabled={sendingMagic || !email}
                    className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-medium hover:bg-black/5 transition disabled:opacity-60"
                  >
                    {sendingMagic ? "Enviando..." : "Enviar magic link"}
                  </button>
                </div>
              </div>

              {status && (
                <p className="mt-4 text-sm text-neutral-600">{status}</p>
              )}
            </>
          ) : (
            <>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-neutral-700">
                  Sesión: <span className="font-medium">{sessionEmail}</span>
                </p>

                <button
                  onClick={handleLogout}
                  className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm hover:bg-black/5 transition"
                >
                  Cerrar sesión
                </button>
              </div>

              {!isAuthor ? (
                <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                  Esta cuenta no tiene permisos de autor.
                </p>
              ) : (
                <>
                  <div className="mt-6 h-px bg-black/10" />
                  <div className="mt-6">
                    <AdminPosts />
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </Container>
    </section>
  );
}
