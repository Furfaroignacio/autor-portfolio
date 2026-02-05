import { supabase } from "./supabase";

export async function uploadBlogImage(file: File) {
  const ext = file.name.split(".").pop();
  const filename = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${ext}`;

  const path = `covers/${filename}`;

  const { error } = await supabase.storage
    .from("blog")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage.from("blog").getPublicUrl(path);
  return data.publicUrl;
}
