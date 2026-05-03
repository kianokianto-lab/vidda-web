"use client";

import { useEffect, useState } from "react";
import type { DbImage } from "@/lib/repos";

export default function AdminImagesPage() {
  const [list, setList] = useState<DbImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    const r = await fetch("/api/admin/images");
    const d = await r.json();
    if (d.ok) setList(d.images);
  };
  useEffect(() => { load(); }, []);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true); setError("");
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const d = await r.json();
        if (!d.ok) { setError(d.error || "Upload failed"); break; }
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete image?")) return;
    await fetch(`/api/admin/images/${id}`, { method: "DELETE" });
    await load();
  };

  return (
    <div>
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tightest md:text-4xl">Images</h1>
          <p className="mt-2 text-sm opacity-70">Upload images. Files are stored under <code>public/uploads/</code>. URLs pasteable into product / section forms.</p>
        </div>
        <label className="btn-pill btn-pill-primary cursor-pointer">
          {uploading ? "Uploading…" : "+ Upload images"}
          <input type="file" accept="image/*" multiple onChange={onUpload} disabled={uploading} className="hidden" />
        </label>
      </header>

      {error && <p className="mt-4 rounded-sm bg-burgundy/10 px-4 py-3 text-sm text-burgundy">{error}</p>}

      <div className="mt-8 grid gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {list.length === 0 ? (
          <p className="col-span-full rounded-sm border border-ink/10 bg-white p-8 text-center text-sm opacity-60">No uploads yet.</p>
        ) : list.map((img) => (
          <figure key={img.id} className="group relative overflow-hidden rounded-sm border border-ink/10 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.path} alt={img.alt ?? ""} className="aspect-square w-full object-cover" />
            <figcaption className="p-2 text-xs">
              <p className="truncate font-mono opacity-60">{img.path}</p>
              <button
                onClick={() => navigator.clipboard.writeText(img.path)}
                className="mt-1 text-xs underline"
              >Copy URL</button>
              <button onClick={() => onDelete(img.id)} className="ml-2 text-xs text-burgundy underline">Delete</button>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
