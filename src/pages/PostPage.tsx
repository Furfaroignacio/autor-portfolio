import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Container } from "../components/ui/Container";
import { getPostBySlug } from "../data/posts";

function stripFrontmatter(md: string) {
  // saca bloque --- --- si existe
  return md.replace(/^---[\s\S]*?---\s*/m, "");
}

export function PostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;

  const content = useMemo(() => {
    if (!post) return "";
    return stripFrontmatter(post.content);
  }, [post]);

  if (!post) {
    return (
      <section className="py-16">
        <Container>
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
    
    <div className="mt-8 rounded-3xl border border-black/10 bg-white/60 p-8 shadow-sm">




    <section className="py-16">
      <Container>
        <Link
          to="/blog"
          className="text-sm text-neutral-600 hover:text-neutral-900 underline underline-offset-4"
        >
          ← Volver al blog
        </Link>
        <img
  src={post.cover}
  alt={post.title}
  className="mt-6 h-64 w-full rounded-3xl object-cover border border-black/10 shadow-sm"
  loading="lazy"
/>

        <p className="mt-6 text-sm text-neutral-500">{post.date}</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
  {post.title}
</h1>


        <div className="prose prose-neutral mt-8 max-w-none prose-p:leading-relaxed prose-headings:font-serif prose-a:text-[rgb(var(--accent))]">
  <ReactMarkdown>{content}</ReactMarkdown>
</div>

      </Container>
    </section>
    </div>
  );
}
