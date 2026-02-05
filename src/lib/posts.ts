import { supabase } from "./supabase";

export type PostStatus = "draft" | "published";

export type PostListItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  cover_url: string | null;
  featured: boolean | null;
  published_at: string | null;
  updated_at: string | null;
};

export type PostRow = PostListItem & {
  content_md: string | null;
  status: PostStatus | null;
};

function isNotFoundError(err: any) {
  // Supabase/PostgREST: cuando usás .single() y no hay filas suele ser PGRST116
  return err?.code === "PGRST116";
}

export async function fetchPublishedPosts(): Promise<PostListItem[]> {
  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, slug, title, excerpt, category, cover_url, featured, published_at, updated_at"
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as PostListItem[];
}

export async function fetchPostBySlug(slug: string): Promise<PostRow | null> {
  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, slug, title, excerpt, category, cover_url, featured, published_at, updated_at, content_md, status"
    )
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error) {
    if (isNotFoundError(error)) return null;
    throw error;
  }

  return (data ?? null) as PostRow | null;
}
