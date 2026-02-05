import { supabase } from "../lib/supabase";

export type PostStatus = "draft" | "published";

export type PostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  content_md: string;
  cover_url: string | null;
  featured: boolean;
  status: PostStatus;
  published_at: string | null;
  updated_at: string;
};

export async function getPublishedPosts() {
  const { data, error } = await supabase
    .from("posts")
    .select("id,slug,title,excerpt,category,cover_url,featured,published_at,updated_at,status")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as PostRow[];
}

export async function getPublishedPostBySlug(slug: string) {
  const { data, error } = await supabase
    .from("posts")
    .select("id,slug,title,excerpt,category,content_md,cover_url,featured,published_at,updated_at,status")
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as PostRow | null;
}
