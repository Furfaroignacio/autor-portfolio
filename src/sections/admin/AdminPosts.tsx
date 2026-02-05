import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

type PostStatus = "draft" | "published";

type AdminPost = {
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

function fmt(iso: string | null) {
  return iso ? iso.slice(0, 10) : "";
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const CATEGORIES = ["Update", "Writing Tips", "Behind the Scenes", "Review"];

export function AdminPosts() {
  const [items, setItems] = useState<AdminPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // editor
  const [editing, setEditing] = useState<AdminPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const isNew = useMemo(() => !!editing && editing.id === "NEW", [editing]);

  async function load() {
  try {
    setLoading(true);
    setErr(null);

    const { data, error } = await supabase
      .from("posts")
      .select(
        "id,slug,title,excerpt,category,content_md,cover_url,featured,status,published_at,updated_at"
      )
      .order("updated_at", { ascending: false });

    if (error) throw error;

    const next = (data ?? []) as AdminPost[];
    setItems(next);
    return next;
  } catch (e: any) {
    setErr(e?.message ?? "Error cargando posts");
    return [];
  } finally {
    setLoading(false);
  }
}


  useEffect(() => {
    load();
  }, []);

  function startNew() {
    setMsg(null);
    setEditing({
      id: "NEW",
      title: "",
      slug: "",
      excerpt: "",
      category: "Update",
      content_md: "",
      cover_url: "/images/blog/post1.jpg",
      featured: false,
      status: "draft",
      published_at: null,
      updated_at: new Date().toISOString(),
    });
  }

  function startEdit(p: AdminPost) {
    setMsg(null);
    setEditing({ ...p });
  }

  function closeEditor() {
    setEditing(null);
    setMsg(null);
  }

  async function save() {
    if (!editing) return;

    // validaciones mínimas
    const title = editing.title.trim();
    if (!title) return setMsg("El título es obligatorio.");

    const slug = (editing.slug || slugify(title)).trim();
    if (!slug) return setMsg("El slug es obligatorio.");

    const payload = {
      title,
      slug,
      excerpt: editing.excerpt.trim(),
      category: editing.category,
      content_md: editing.content_md,
      cover_url: editing.cover_url?.trim() || null,
      featured: !!editing.featured,
      status: editing.status,
      published_at: editing.status === "published"
        ? (editing.published_at ?? new Date().toISOString())
        : null,
    };

    try {
      setSaving(true);
      setMsg(null);

      if (isNew) {
        const { error } = await supabase.from("posts").insert(payload);
        if (error) throw error;
        setMsg("Post creado ✅");
      } else {
        const { error } = await supabase
          .from("posts")
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
        setMsg("Cambios guardados ✅");
      }

      const nextItems = await load();

      // reabrimos el post actualizado con la data nueva
      const refreshed = isNew
        ? nextItems.find((x) => x.slug === payload.slug) ?? null
        : nextItems.find((x) => x.id === editing.id) ?? null;

      setEditing(refreshed);
    } catch (e: any) {
      setMsg(e?.message ?? "Error guardando");
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(p: AdminPost) {
    try {
      setMsg(null);
      const next: PostStatus = p.status === "published" ? "draft" : "published";

      const { error } = await supabase
        .from("posts")
        .update({
          status: next,
          published_at: next === "published" ? new Date().toISOString() : null,
        })
        .eq("id", p.id);

      if (error) throw error;
      await load();
      setMsg(`Estado actualizado: ${next} ✅`);
    } catch (e: any) {
      setMsg(e?.message ?? "Error cambiando estado");
    }
  }

  async function remove(p: AdminPost) {
    const ok = confirm(`Eliminar "${p.title}"?`);
    if (!ok) return;

    try {
      setMsg(null);
      const { error } = await supabase.from("posts").delete().eq("id", p.id);
      if (error) throw error;

      if (editing?.id === p.id) setEditing(null);
      await load();
      setMsg("Post eliminado ✅");
    } catch (e: any) {
      setMsg(e?.message ?? "Error eliminando");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* LISTA */}
      <div>
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-serif text-2xl">Posts</h2>

          <div className="flex items-center gap-2">
            <button
              onClick={load}
              className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm hover:bg-black/5 transition"
            >
              Refrescar
            </button>
            <button
              onClick={startNew}
              className="rounded-xl bg-black px-4 py-2 text-sm text-white hover:bg-black/90 transition"
            >
              Nuevo
            </button>
          </div>
        </div>

        {loading && <p className="mt-4 text-neutral-600">Cargando…</p>}
        {err && <p className="mt-4 text-red-600">{err}</p>}

        {!loading && !err && (
          <div className="mt-4 overflow-hidden rounded-2xl border border-black/10 bg-white/60">
            <div className="grid grid-cols-12 gap-2 border-b border-black/10 px-4 py-3 text-xs font-semibold tracking-wider text-black/60">
              <div className="col-span-6">Título</div>
              <div className="col-span-3">Slug</div>
              <div className="col-span-2">Estado</div>
              <div className="col-span-1 text-right">⋯</div>
            </div>

            {items.map((p) => (
              <div
                key={p.id}
                className="grid grid-cols-12 gap-2 px-4 py-3 text-sm border-b border-black/5 last:border-b-0"
              >
                <button
                  className="col-span-6 text-left font-medium hover:underline underline-offset-4"
                  onClick={() => startEdit(p)}
                >
                  {p.title}
                </button>

                <div className="col-span-3 text-black/70">{p.slug}</div>

                <div className="col-span-2">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      p.status === "published"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>

                <div className="col-span-1 text-right text-black/50">
                  {fmt(p.published_at)}
                </div>
              </div>
            ))}
          </div>
        )}

        {msg && (
          <p className="mt-4 text-sm text-black/60">
            {msg}
          </p>
        )}
      </div>

      {/* EDITOR */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl">Editor</h2>
          {editing && (
            <button
              onClick={closeEditor}
              className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm hover:bg-black/5 transition"
            >
              Cerrar
            </button>
          )}
        </div>

        {!editing ? (
          <div className="mt-4 rounded-2xl border border-black/10 bg-white/40 p-6 text-black/60">
            Seleccioná un post o tocá <b>Nuevo</b>.
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-black/10 bg-white/60 p-6">
            <div className="grid gap-4">
              <div>
                <label className="text-xs font-semibold tracking-wider text-black/60">
                  TÍTULO
                </label>
                <input
                  value={editing.title}
                  onChange={(e) =>
                    setEditing((p) => (p ? { ...p, title: e.target.value } : p))
                  }
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold tracking-wider text-black/60">
                    SLUG
                  </label>
                  <input
                    value={editing.slug}
                    onChange={(e) =>
                      setEditing((p) => (p ? { ...p, slug: e.target.value } : p))
                    }
                    placeholder="se-autogenera-si-lo-dejas-vacio"
                    className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setEditing((p) =>
                        p ? { ...p, slug: slugify(p.title) } : p
                      )
                    }
                    className="mt-2 text-xs underline underline-offset-4 text-black/60 hover:text-black"
                  >
                    Generar desde título
                  </button>
                </div>

                <div>
                  <label className="text-xs font-semibold tracking-wider text-black/60">
                    CATEGORÍA
                  </label>
                  <select
                    value={editing.category}
                    onChange={(e) =>
                      setEditing((p) =>
                        p ? { ...p, category: e.target.value } : p
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold tracking-wider text-black/60">
                  EXCERPT
                </label>
                <textarea
                  value={editing.excerpt}
                  onChange={(e) =>
                    setEditing((p) =>
                      p ? { ...p, excerpt: e.target.value } : p
                    )
                  }
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>

              <div>
                <label className="text-xs font-semibold tracking-wider text-black/60">
                  COVER URL
                </label>
                <input
                  value={editing.cover_url ?? ""}
                  onChange={(e) =>
                    setEditing((p) =>
                      p ? { ...p, cover_url: e.target.value } : p
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-black/70">
                  <input
                    type="checkbox"
                    checked={editing.featured}
                    onChange={(e) =>
                      setEditing((p) =>
                        p ? { ...p, featured: e.target.checked } : p
                      )
                    }
                  />
                  Featured
                </label>

                <span className="text-sm text-black/60">
                  Estado:{" "}
                  <b className="text-black">{editing.status}</b>
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold tracking-wider text-black/60">
                  CONTENIDO (Markdown)
                </label>
                <textarea
                  value={editing.content_md}
                  onChange={(e) =>
                    setEditing((p) =>
                      p ? { ...p, content_md: e.target.value } : p
                    )
                  }
                  rows={12}
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 font-mono text-sm outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={save}
                  disabled={saving}
                  className="rounded-xl bg-black px-4 py-2 text-sm text-white hover:bg-black/90 transition disabled:opacity-60"
                >
                  {saving ? "Guardando…" : "Guardar"}
                </button>

                {!isNew && (
                  <>
                    <button
                      onClick={() => toggleStatus(editing)}
                      className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm hover:bg-black/5 transition"
                    >
                      {editing.status === "published"
                        ? "Pasar a draft"
                        : "Publicar"}
                    </button>

                    <button
                      onClick={() => remove(editing)}
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 hover:bg-red-100 transition"
                    >
                      Eliminar
                    </button>
                  </>
                )}
              </div>

              {msg && <p className="text-sm text-black/60">{msg}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
