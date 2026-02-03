import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { SectionTitle } from "../components/ui/SectionTitle";
import { posts } from "../data/posts";

function categoryLabel(c: string) {
  return c.toUpperCase();
}

export function BlogPage() {
  const ordered = posts
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1));

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

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {ordered.map((p) => (
              <article
                key={p.slug}
                className="group overflow-hidden rounded-3xl border border-black/10 bg-white/40 shadow-sm transition hover:bg-white/60 hover:shadow-md"
              >
                {/* Imagen */}
                <div className="relative overflow-hidden">
                  <img
                    src={p.cover}
                    alt={p.title}
                    className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    loading="lazy"
                  />

                  {/* Badge featured */}
                  <div className="absolute left-4 top-4 flex items-center gap-2">
                    {p.featured ? (
                      <span className="rounded-full bg-[rgb(var(--accent))] px-3 py-1 text-xs font-semibold text-white shadow-sm">
                        UPDATE
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="p-6">
                  {/* Category */}
                  <p className="text-xs font-semibold tracking-[0.18em] text-[rgb(var(--accent))]">
                    {categoryLabel(p.category)}
                  </p>

                  {/* Title */}
                  <h3 className="mt-3 font-serif text-2xl tracking-tight leading-snug">
                    <Link
                      to={`/blog/${p.slug}`}
                      className="hover:underline underline-offset-4"
                    >
                      {p.title}
                    </Link>
                  </h3>

                  {/* Excerpt */}
                  <p className="mt-3 text-black/70 leading-relaxed">
                    {p.excerpt}
                  </p>

                  {/* Meta */}
                  <div className="mt-5 flex items-center justify-between">
                    <p className="text-sm text-black/55">{p.date}</p>

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
        </Container>
      </section>
    </>
  );
}
