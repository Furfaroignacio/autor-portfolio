import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { SectionTitle } from "../components/ui/SectionTitle";
import { fetchPublishedPosts } from "../lib/posts";

function categoryLabel(c: string) {
  return c.toUpperCase();
}

export function BlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err] = useState<string | null>(null);

  useEffect(() => {
  fetchPublishedPosts()
    .then(setPosts)
    .finally(() => setLoading(false));
}, []);

  const ordered = useMemo(() => {
    return posts.slice().sort((a, b) => {
      const da = a.published_at ?? a.updated_at;
      const db = b.published_at ?? b.updated_at;
      return da < db ? 1 : -1;
    });
  }, [posts]);

  return (
    <>
      <Helmet>
        <title>Blog — Guido Maria Furfaro</title>
        <meta
          name="description"
          content="Notas, reseñas y reflexiones del proceso creativo. Escritura, lectura y detrás de escena."
        />
      </Helmet>

      <section className="py-16">
        <Container>
          <SectionTitle
            title="Blog"
            subtitle="Notas, reseñas y reflexiones del proceso creativo."
          />

          {loading && <p className="mt-6 text-black/60">Cargando…</p>}
          {err && <p className="mt-6 text-red-700">{err}</p>}

          {!loading && !err && (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {ordered.map((p) => (
                <article
                  key={p.id}
                  className="group overflow-hidden rounded-3xl border border-black/10 bg-white/40 shadow-sm transition hover:bg-white/60 hover:shadow-md"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={p.cover_url ?? "/images/blog/post1.jpg"}
                      alt={p.title}
                      className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      loading="lazy"
                    />

                    <div className="absolute left-4 top-4 flex items-center gap-2">
                      {p.featured ? (
                        <span className="rounded-full bg-[rgb(var(--accent))] px-3 py-1 text-xs font-semibold text-white shadow-sm">
                          UPDATE
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-xs font-semibold tracking-[0.18em] text-[rgb(var(--accent))]">
                      {categoryLabel(p.category)}
                    </p>

                    <h3 className="mt-3 font-serif text-2xl tracking-tight leading-snug">
                      <Link
                        to={`/blog/${p.slug}`}
                        className="hover:underline underline-offset-4"
                      >
                        {p.title}
                      </Link>
                    </h3>

                    <p className="mt-3 text-black/70 leading-relaxed">
                      {p.excerpt}
                    </p>

                    <div className="mt-5 flex items-center justify-between">
                      <p className="text-sm text-black/55">
                        {(p.published_at ?? p.updated_at).slice(0, 10)}
                      </p>

                      <Link
                        to={`/blog/${p.slug}`}
                        className="text-sm font-medium text-black/80 group-hover:text-black transition"
                      >
                        Leer →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
