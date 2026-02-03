import postUpdate from "../content/posts/update-blog.md?raw";
import postWriting from "../content/posts/writing-atmosphere.md?raw";
import postReview from "../content/posts/review-libro.md?raw";

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  category: "Update" | "Writing Tips" | "Behind the Scenes" | "Review";
  featured?: boolean;
  cover: string;
  content: string;
};

export const posts: PostMeta[] = [
  {
    slug: "lanzamiento-del-blog",
    title: "Por qué decidí abrir este blog",
    date: "2026-02-01",
    excerpt:
      "Un espacio para compartir el proceso creativo, reseñas y reflexiones sobre escritura y lectura.",
    category: "Update",
    featured: true,
    cover: "/images/blog/post1.jpg",
    content: postUpdate,
  },
  {
    slug: "la-atmosfera-como-personaje",
    title: "La atmósfera como personaje en una historia",
    date: "2026-01-28",
    excerpt:
      "Cómo el clima, los espacios y el silencio pueden contar tanto como los personajes.",
    category: "Writing Tips",
    cover: "/images/blog/post2.jpg",
    content: postWriting,
  },
  {
    slug: "review-libro-favorito",
    title: "Reseña: un libro que cambió mi forma de escribir",
    date: "2026-01-20",
    excerpt:
      "Una mirada personal a una novela que me marcó y por qué la recomiendo.",
    category: "Review",
    cover: "/images/blog/post3.jpg",
    content: postReview,
  },
];

export function getPostBySlug(slug: string) {
  return posts.find((p) => p.slug === slug);
}
