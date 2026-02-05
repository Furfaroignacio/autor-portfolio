import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Helmet } from "react-helmet-async";
import { Container } from "../components/ui/Container";
import { fetchPostBySlug} from "../lib/posts"
import { type PostRow } from "../data/posts.api";


function stripFrontmatter(md: string) {
  return md.replace(/^---[\s\S]*?---\s*/m, "");
}

export function PostPage() {
  const { slug } = useParams<{ slug: string }>();

  const [post, setPost] = useState<PostRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        if (!slug) {
          setPost(null);
          return;
        }
        const data = await fetchPostBySlug(slug);
        setPost(data);
      } catch (e: any) {
        setErr(e?.message ?? "Error cargando post");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const content = useMemo(() => {
    if (!post) return "";
    return stripFrontmatter(post.content_md ?? "");
  }, [post]);

  if (loading) {
    return (
      <section className="py-16">
        <Container>
          <p className="text-black/60">Cargando…</p>
        </Container>
      </section>
    );
  }

  if (err) {
    return (
      <section className="py-16">
        <Container>
          <p className="text-red-700">{err}</p>
          <Link to="/blog" className="mt-4 inline-block underline underline-offset-4">
            Volver al blog
          </Link>
        </Container>
      </section>
    );
  }

  if (!post) {
    return (
      <section className="py-16">
        <Container>
          <Helmet>
            <title>Post no encontrado — Guido Maria Furfaro</title>
          </Helmet>

          <p className="text-neutral-700">Post no encontrado.</p>
          <Link
            to="/blog"
            className="mt-4 inline-block underline underline-offset-4"
          >
            Volver al blog
          </Link>
        </Container>
      </section>
    );
  }

  return (
    <>
      <Helmet>
        <title>{post.title} — Guido Maria Furfaro</title>
        <meta name="description" content={post.excerpt} />
      </Helmet>

      <section className="py-16">
        <Container>
          <div className="rounded-3xl border border-black/10 bg-white/60 p-8 shadow-sm">
            <Link
              to="/blog"
              className="text-sm text-neutral-600 hover:text-neutral-900 underline underline-offset-4"
            >
              ← Volver al blog
            </Link>

            <img
              src={post.cover_url ?? "/images/blog/post1.jpg"}
              alt={post.title}
              className="mt-6 h-64 w-full rounded-3xl object-cover border border-black/10 shadow-sm"
              loading="lazy"
            />

            <p className="mt-6 text-sm text-neutral-500">
              {(post.published_at ?? post.updated_at).slice(0, 10)}
            </p>

            <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              {post.title}
            </h1>

            <div className="prose prose-neutral mt-8 max-w-none prose-p:leading-relaxed prose-headings:font-serif prose-a:text-[rgb(var(--accent))]">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
