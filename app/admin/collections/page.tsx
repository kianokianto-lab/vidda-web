"use client";

import { useEffect, useState } from "react";
import type { DbCollection } from "@/lib/repos";

export default function AdminCollectionsPage() {
  const [list, setList] = useState<DbCollection[]>([]);
  const [editing, setEditing] = useState<DbCollection | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    const res = await fetch("/api/admin/collections");
    const data = await res.json();
    if (data.ok) setList(data.collections);
  };
  useEffect(() => { load(); }, []);

  const onSave = async (form: Partial<DbCollection>, id?: string) => {
    setError("");
    const url = id ? `/api/admin/collections/${id}` : "/api/admin/collections";
    const method = id ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    if (data.ok) { await load(); setEditing(null); setCreating(false); }
    else setError(data.error || "Save failed");
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete collection?")) return;
    await fetch(`/api/admin/collections/${id}`, { method: "DELETE" });
    await load();
  };

  return (
    <div>
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tightest md:text-4xl">Collections</h1>
          <p className="mt-2 text-sm opacity-70">Manage hoodies, pants, summer-26, etc.</p>
        </div>
        <button onClick={() => setCreating(true)} className="btn-pill btn-pill-primary">+ New collection</button>
      </header>

      {error && <p className="mt-4 rounded-sm bg-burgundy/10 px-4 py-3 text-sm text-burgundy">{error}</p>}

      {(creating || editing) && (
        <CollectionForm
          initial={editing ?? null}
          onSave={(form) => onSave(form, editing?.id)}
          onCancel={() => { setEditing(null); setCreating(false); }}
        />
      )}

      <div className="mt-8 overflow-hidden rounded-sm border border-ink/10 bg-white">
        {list.length === 0 ? (
          <p className="p-6 text-sm opacity-60">No collections in DB. Static collections are still in <code>lib/easyorders.ts</code>.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-ink/10 bg-ink/5 text-left text-xs uppercase tracking-eyebrow opacity-70">
              <tr><th className="px-4 py-3">Title</th><th className="px-4 py-3">Slug</th><th className="px-4 py-3">Sort</th><th className="px-4 py-3"></th></tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id} className="border-b border-ink/5">
                  <td className="px-4 py-3 font-bold">{c.title}</td>
                  <td className="px-4 py-3 font-mono text-xs opacity-70">{c.slug}</td>
                  <td className="px-4 py-3">{c.sort}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setEditing(c)} className="mr-3 text-xs underline">Edit</button>
                    <button onClick={() => onDelete(c.id)} className="text-xs text-burgundy underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function CollectionForm({
  initial, onSave, onCancel,
}: { initial: DbCollection | null; onSave: (form: Partial<DbCollection>) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    slug: initial?.slug ?? "",
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    hero_image: initial?.hero_image ?? "",
    sort: initial?.sort ?? 0,
  });
  return (
    <div className="mt-6 rounded-sm border border-burgundy/30 bg-white p-6">
      <h2 className="text-lg font-extrabold">{initial ? "Edit collection" : "New collection"}</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Input label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
        <Input label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} mono />
        <Input label="Hero image URL" value={form.hero_image ?? ""} onChange={(v) => setForm({ ...form, hero_image: v })} wide />
        <Input label="Sort order" type="number" value={String(form.sort)} onChange={(v) => setForm({ ...form, sort: Number(v) })} />
        <label className="block md:col-span-2">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-eyebrow opacity-70">Description</span>
          <textarea rows={3} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-sm border border-ink/20 px-4 py-3 text-base focus:border-burgundy focus:outline-none" />
        </label>
      </div>
      <div className="mt-5 flex gap-3">
        <button onClick={() => onSave(form)} className="btn-pill btn-pill-primary">Save</button>
        <button onClick={onCancel} className="btn-pill btn-pill-outline">Cancel</button>
      </div>
    </div>
  );
}

function Input({
  label, value, onChange, type = "text", mono, wide,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; mono?: boolean; wide?: boolean }) {
  return (
    <label className={`block ${wide ? "md:col-span-2" : ""}`}>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-eyebrow opacity-70">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={`w-full rounded-sm border border-ink/20 bg-white px-4 py-3 ${mono ? "font-mono text-sm" : "text-base"} focus:border-burgundy focus:outline-none`} />
    </label>
  );
}
