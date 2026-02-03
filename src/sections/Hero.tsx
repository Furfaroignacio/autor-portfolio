import { Container } from "../components/ui/Container";
import { author } from "../data/author";
import { posts } from "../data/posts";
import { Link } from "react-router-dom";

export function Hero() {
  const latest = posts
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1))[0];

  return (
    <section className="py-14 sm:py-20">
      <Container>
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
          {/* Columna principal */}
          <div className="lg:col-span-7">
            <p className="text-sm text-black/60">Sitio oficial</p>

            <h1 className="mt-4 font-serif text-5xl font-semibold tracking-tight sm:text-6xl">
              {author.name}
            </h1>

            <p className="mt-4 text-lg text-black/70">{author.tagline}</p>

            <p className="mt-8 max-w-2xl text-black/70 leading-relaxed">
              {author.bio}
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href="/#books"
                className="rounded-xl bg-[rgb(var(--accent))] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition"
              >
                Ver libros
              </a>

              <Link
                to="/blog"
                className="rounded-xl border border-black/10 bg-white/40 px-4 py-2 text-sm font-medium text-black/80 hover:bg-white/60 transition"
              >
                Leer el blog
              </Link>
            </div>
          </div>

          {/* Columna editorial (compacta) */}
          <aside className="lg:col-span-5">
            <div className="rounded-3xl border border-black/10 bg-white/50 p-6 shadow-sm">
              <p className="text-xs font-semibold tracking-[0.18em] text-[rgb(var(--accent))]">
                ÚLTIMA PUBLICACIÓN
              </p>

              {latest ? (
                <>
                  <div className="mt-4 overflow-hidden rounded-2xl border border-black/10">
                    <img
                      src={latest.cover}
                      alt={latest.title}
                      className="h-40 w-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <h3 className="mt-4 font-serif text-2xl tracking-tight">
                    <Link
                      to={`/blog/${latest.slug}`}
                      className="hover:underline underline-offset-4"
                    >
                      {latest.title}
                    </Link>
                  </h3>

                  <p className="mt-2 text-sm text-black/70">{latest.excerpt}</p>

                  <div className="mt-4">
                    <Link
                      to={`/blog/${latest.slug}`}
                      className="text-sm font-medium text-black/80 hover:text-black transition"
                    >
                      Leer →
                    </Link>
                  </div>
                </>
              ) : (
                <p className="mt-4 text-sm text-black/70">
                  Próximamente artículos y novedades.
                </p>
              )}
            </div>

            {/* Quote corta (opcional, súper Stitch) */}
            <div className="mt-6 rounded-3xl border border-black/10 bg-black/90 p-6 text-white shadow-sm">
              <p className="text-sm text-white/70">Cita</p>
              <p className="mt-3 font-serif text-xl leading-relaxed">
                “La escritura es una forma de recordar lo que todavía no pasó.”
              </p>
            </div>
          </aside>
        </div>
      </Container>
    </section>
  );
}
