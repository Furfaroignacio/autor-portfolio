import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";
import { uploadBlogImage } from "../../lib/uploadImage";
import ReactMarkdown from "react-markdown";

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

const CATEGORIES = ["Update", "Writing Tips", "Behind the Scenes", "Review"] as const;

function fmt(iso: string | null) {
  return iso ? iso.slice(0, 10) : "—";
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function stripMarkdown(md: string) {
  return md
    .replace(/^---[\s\S]*?---\s*/m, "") // frontmatter
    .replace(/```[\s\S]*?```/g, "") // code blocks
    .replace(/`[^`]*`/g, "") // inline code
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "") // images
    .replace(/\[[^\]]*\]\([^)]+\)/g, "") // links
    .replace(/[#>*_-]{1,}/g, " ") // markdown symbols
    .replace(/\s+/g, " ")
    .trim();
}

function makeExcerptFromContent(md: string, max = 160) {
  const text = stripMarkdown(md);
  if (!text) return "";
  return text.length > max ? text.slice(0, max).trim() + "…" : text;
}

const SELECT_FIELDS =
  "id,slug,title,excerpt,category,content_md,cover_url,featured,status,published_at,updated_at";

export function AdminPosts() {
  const [items, setItems] = useState<AdminPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // editor
  const [editing, setEditing] = useState<AdminPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // UI
  const [onlyPublished, setOnlyPublished] = useState(false);
  const [tab, setTab] = useState<"edit" | "preview">("edit");

  // cambios sin guardar
  const [dirty, setDirty] = useState(false);
  const dirtyRef = useRef(false);
  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);

  // para evitar autosave spameado
  const lastSavedHash = useRef<string>("");

  const filtered = useMemo(() => {
    if (!onlyPublished) return items;
    return items.filter((p) => p.status === "published");
  }, [items, onlyPublished]);

  async function load() {
    try {
      setLoading(true);
      setErr(null);

      const { data, error } = await supabase
        .from("posts")
        .select(SELECT_FIELDS)
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

  function confirmLoseChanges(): boolean {
    if (!dirtyRef.current) return true;
    return confirm("Tenés cambios sin guardar. ¿Seguro querés continuar y perderlos?");
  }

  function startNew() {
    if (!confirmLoseChanges()) return;

    setMsg(null);
    setTab("edit");
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
    } as AdminPost);
    setDirty(false);
    lastSavedHash.current = "";
  }

  function startEdit(p: AdminPost) {
    if (!confirmLoseChanges()) return;

    setMsg(null);
    setTab("edit");
    setEditing({ ...p });
    setDirty(false);
    lastSavedHash.current = "";
  }

  function closeEditor() {
    if (!confirmLoseChanges()) return;
    setEditing(null);
    setMsg(null);
    setDirty(false);
    lastSavedHash.current = "";
  }

  function setField<K extends keyof AdminPost>(key: K, value: AdminPost[K]) {
    setEditing((cur) => {
      if (!cur) return cur;
      return { ...cur, [key]: value };
    });
    setDirty(true);
  }

  function friendlySlugError(e: any) {
    const raw = (e?.message ?? "").toLowerCase();
    // depende de cómo venga el error, pero esto cubre la mayoría
    if (raw.includes("duplicate") || raw.includes("unique") || raw.includes("slug")) {
      return "Ese slug ya existe. Cambialo (por ejemplo agregando -2) y volvé a guardar.";
    }
    return e?.message ?? "Error guardando";
  }

  async function save(options?: { publish?: boolean; silent?: boolean }) {
    if (!editing) return;

    const silent = !!options?.silent;

    // validaciones mínimas
    const title = editing.title.trim();
    if (!title) {
      if (!silent) setMsg("El título es obligatorio.");
      return;
    }

    const slug = (editing.slug || slugify(title)).trim();
    if (!slug) {
      if (!silent) setMsg("El slug es obligatorio.");
      return;
    }

    const wantsPublish = !!options?.publish;
    const nextStatus: PostStatus = wantsPublish ? "published" : editing.status;
    const nextPublishedAt =
      nextStatus === "published"
        ? (editing.published_at ?? new Date().toISOString())
        : null;

    const payload = {
      title,
      slug,
      excerpt: editing.excerpt.trim(),
      category: editing.category,
      content_md: editing.content_md,
      cover_url: editing.cover_url?.trim() || null,
      featured: !!editing.featured,
      status: nextStatus,
      published_at: nextPublishedAt,
    };

    try {
      setSaving(true);
      if (!silent) setMsg(null);

      // NEW => insert
      if (editing.id === "NEW") {
        const { data, error } = await supabase
          .from("posts")
          .insert(payload)
          .select(SELECT_FIELDS)
          .single();

        if (error) throw error;

        if (!silent) setMsg(wantsPublish ? "Post creado y publicado ✅" : "Post creado ✅");
        await load();
        setEditing(data as AdminPost);
        setDirty(false);
        lastSavedHash.current = JSON.stringify(payload);
        return;
      }

      // update
      const { data, error } = await supabase
        .from("posts")
        .update(payload)
        .eq("id", editing.id)
        .select(SELECT_FIELDS)
        .single();

      if (error) throw error;

      if (!silent) setMsg(wantsPublish ? "Cambios guardados y publicado ✅" : "Cambios guardados ✅");
      await load();
      setEditing(data as AdminPost);
      setDirty(false);
      lastSavedHash.current = JSON.stringify(payload);
    } catch (e: any) {
      if (!silent) setMsg(friendlySlugError(e));
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(p: AdminPost) {
    try {
      setMsg(null);

      const next: PostStatus = p.status === "published" ? "draft" : "published";
      const published_at = next === "published" ? new Date().toISOString() : null;

      const { data, error } = await supabase
        .from("posts")
        .update({ status: next, published_at })
        .eq("id", p.id)
        .select(SELECT_FIELDS)
        .single();

      if (error) throw error;

      setMsg(`Estado actualizado: ${next} ✅`);
      await load();
      setEditing((cur) => (cur?.id === p.id ? (data as AdminPost) : cur));
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
      setDirty(false);
      lastSavedHash.current = "";
    } catch (e: any) {
      setMsg(e?.message ?? "Error eliminando");
    }
  }

  // Autosave (solo update, no NEW). Corre cada 12s si hay cambios.
  useEffect(() => {
    const t = setInterval(async () => {
      if (!editing) return;
      if (editing.id === "NEW") return;
      if (!dirtyRef.current) return;
      if (saving) return;

      // evitamos autosave si no cambió realmente el payload
      const title = editing.title.trim();
      const slug = (editing.slug || slugify(title)).trim();
      const payloadHash = JSON.stringify({
        title,
        slug,
        excerpt: editing.excerpt.trim(),
        category: editing.category,
        content_md: editing.content_md,
        cover_url: editing.cover_url?.trim() || null,
        featured: !!editing.featured,
        status: editing.status,
        published_at: editing.published_at ?? null,
      });

      if (payloadHash === lastSavedHash.current) {
        setDirty(false);
        return;
      }

      await save({ silent: true });
      setMsg("Autosave ✅");
    }, 12000);

    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing, saving]);

  const previewMd = useMemo(() => {
    if (!editing) return "";
    // si tenés frontmatter, lo ignoramos en preview también
    return (editing.content_md ?? "").replace(/^---[\s\S]*?---\s*/m, "");
  }, [editing]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* LISTA */}
      <div className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl">Posts</h2>
            <p className="mt-1 text-sm text-black/60">
              {onlyPublished
                ? "Mostrando solo publicados."
                : "Mostrando todos (draft + publicados)."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setOnlyPublished((v) => !v)}
              className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm hover:bg-black/5 transition"
            >
              {onlyPublished ? "Ver todos" : "Solo publicados"}
            </button>

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

        {loading && <p className="mt-4 text-black/60">Cargando…</p>}
        {err && <p className="mt-4 text-red-700">{err}</p>}

        {!loading && !err && (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-black/10 bg-white/60">
            <table className="min-w-[780px] w-full text-sm">
              <thead className="border-b border-black/10 text-xs font-semibold tracking-wider text-black/60">
                <tr>
                  <th className="px-4 py-3 text-left w-[45%]">Título</th>
                  <th className="px-4 py-3 text-left w-[25%]">Slug</th>
                  <th className="px-4 py-3 text-left w-[12%]">Estado</th>
                  <th className="px-4 py-3 text-left w-[13%]">Fecha</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-black/5 last:border-b-0 hover:bg-white/50"
                  >
                    <td className="px-4 py-3">
                      <button
                        className="text-left font-medium hover:underline underline-offset-4"
                        onClick={() => startEdit(p)}
                      >
                        {p.title || "(Sin título)"}
                      </button>
                      <div className="mt-1 text-xs text-black/50">
                        {p.excerpt
                          ? p.excerpt.slice(0, 80) + (p.excerpt.length > 80 ? "…" : "")
                          : "—"}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-black/70">{p.slug}</td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          p.status === "published"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-black/60">
                      {fmt(p.published_at ?? p.updated_at)}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => startEdit(p)}
                          className="rounded-xl border border-black/10 bg-white px-3 py-1.5 text-xs hover:bg-black/5 transition"
                        >
                          Editar
                        </button>

                        <button
                          onClick={() => toggleStatus(p)}
                          className="rounded-xl border border-black/10 bg-white px-3 py-1.5 text-xs hover:bg-black/5 transition"
                        >
                          {p.status === "published" ? "Draft" : "Publicar"}
                        </button>

                        <a
                          href={`/blog/${p.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-xl border border-black/10 bg-white px-3 py-1.5 text-xs hover:bg-black/5 transition"
                        >
                          Ver
                        </a>

                        <button
                          onClick={() => remove(p)}
                          className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-700 hover:bg-red-100 transition"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-black/60" colSpan={5}>
                      No hay posts para mostrar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {msg && <p className="mt-4 text-sm text-black/60">{msg}</p>}
      </div>

      {/* EDITOR */}
      <div className="min-w-0">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl">Editor</h2>
            {editing && (
              <p className="mt-1 text-sm text-black/60">
                {dirty ? "Cambios sin guardar" : "Todo guardado"}
              </p>
            )}
          </div>

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
          <div className="mt-4 rounded-2xl border border-black/10 bg-white/60 p-6 shadow-sm lg:sticky lg:top-20">
            {/* Tabs */}
            <div className="mb-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTab("edit")}
                className={`rounded-xl px-3 py-1.5 text-sm transition ${
                  tab === "edit"
                    ? "bg-black text-white"
                    : "border border-black/10 bg-white hover:bg-black/5"
                }`}
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => setTab("preview")}
                className={`rounded-xl px-3 py-1.5 text-sm transition ${
                  tab === "preview"
                    ? "bg-black text-white"
                    : "border border-black/10 bg-white hover:bg-black/5"
                }`}
              >
                Preview
              </button>

              <div className="ml-auto text-xs text-black/50">
                ID: {editing.id === "NEW" ? "NEW" : editing.id}
              </div>
            </div>

            {tab === "preview" ? (
              <div className="rounded-2xl border border-black/10 bg-white p-5">
                <div className="prose prose-neutral max-w-none prose-p:leading-relaxed prose-headings:font-serif prose-a:text-[rgb(var(--accent))]">
                  <ReactMarkdown>{previewMd || "Escribí contenido para ver el preview."}</ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                {/* Título */}
                <div>
                  <label className="text-xs font-semibold tracking-wider text-black/60">
                    TÍTULO
                  </label>
                  <input
                    value={editing.title}
                    onChange={(e) => setField("title", e.target.value)}
                    className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
                  />
                </div>

                {/* Slug + Category */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold tracking-wider text-black/60">
                      SLUG
                    </label>
                    <input
                      value={editing.slug}
                      onChange={(e) => setField("slug", e.target.value)}
                      placeholder="se-autogenera-si-lo-dejas-vacio"
                      className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
                    />
                    <button
                      type="button"
                      onClick={() => setField("slug", slugify(editing.title))}
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
                      onChange={(e) => setField("category", e.target.value)}
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

                {/* Excerpt */}
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <label className="text-xs font-semibold tracking-wider text-black/60">
                      EXCERPT
                    </label>
                    <button
                      type="button"
                      onClick={() => setField("excerpt", makeExcerptFromContent(editing.content_md))}
                      className="text-xs underline underline-offset-4 text-black/60 hover:text-black"
                    >
                      Generar excerpt
                    </button>
                  </div>

                  <textarea
                    value={editing.excerpt}
                    onChange={(e) => setField("excerpt", e.target.value)}
                    rows={3}
                    className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
                  />
                </div>

                {/* Cover */}
                <div>
                  <label className="text-xs font-semibold tracking-wider text-black/60">
                    COVER
                  </label>

                  <div className="mt-2 overflow-hidden rounded-2xl border border-black/10 bg-white">
                    <img
                      src={editing.cover_url ?? "/images/blog/post1.jpg"}
                      alt="Cover preview"
                      className="h-40 w-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="mt-3 grid gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        try {
                          setMsg("Subiendo imagen…");
                          const url = await uploadBlogImage(file);
                          setField("cover_url", url);
                          setMsg("Imagen subida ✅");
                        } catch (err: any) {
                          setMsg(err?.message ?? "Error subiendo imagen");
                        }
                      }}
                    />

                    <input
                      type="text"
                      placeholder="o pegá una URL manual"
                      value={editing.cover_url ?? ""}
                      onChange={(e) => setField("cover_url", e.target.value)}
                      className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
                    />
                  </div>
                </div>

                {/* Featured + Status */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-sm text-black/70">
                    <input
                      type="checkbox"
                      checked={editing.featured}
                      onChange={(e) => setField("featured", e.target.checked)}
                    />
                    Featured
                  </label>

                  <div className="text-sm text-black/60">
                    Estado:{" "}
                    <span
                      className={`ml-2 rounded-full px-2 py-1 text-xs ${
                        editing.status === "published"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {editing.status}
                    </span>
                  </div>
                </div>

                {/* Markdown */}
                <div>
                  <label className="text-xs font-semibold tracking-wider text-black/60">
                    CONTENIDO (Markdown)
                  </label>
                  <textarea
                    value={editing.content_md}
                    onChange={(e) => setField("content_md", e.target.value)}
                    rows={12}
                    className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 font-mono text-sm outline-none focus:ring-2 focus:ring-black/10 min-h-[260px]"
                  />
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => save()}
                    disabled={saving}
                    className="rounded-xl bg-black px-4 py-2 text-sm text-white hover:bg-black/90 transition disabled:opacity-60"
                  >
                    {saving ? "Guardando…" : "Guardar"}
                  </button>

                  <button
                    onClick={() => save({ publish: true })}
                    disabled={saving}
                    className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm hover:bg-black/5 transition disabled:opacity-60"
                  >
                    {saving ? "Procesando…" : "Guardar y publicar"}
                  </button>

                  {editing.id !== "NEW" && (
                    <>
                      <button
                        onClick={() => toggleStatus(editing)}
                        className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm hover:bg-black/5 transition"
                      >
                        {editing.status === "published" ? "Pasar a draft" : "Publicar"}
                      </button>

                      <a
                        href={`/blog/${editing.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm hover:bg-black/5 transition"
                      >
                        Abrir post
                      </a>

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
            )}
          </div>
        )}
      </div>
    </div>
  );
}
