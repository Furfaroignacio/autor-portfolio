import { supabase } from "./supabase";

export async function fetchPublishedPosts() {
  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, slug, title, excerpt, category, cover_url, published_at"
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function fetchPostBySlug(slug: string) {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error) throw error;
  return data;
}
