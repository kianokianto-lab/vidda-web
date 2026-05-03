import { notFound } from "next/navigation";
import { products } from "@/lib/repos";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default function EditProductPage({ params }: { params: { id: string } }) {
  const p = products.get(params.id);
  if (!p) notFound();
  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tightest md:text-4xl">Edit · {p.title}</h1>
      <p className="mt-2 text-sm opacity-70 font-mono">{p.id} · {p.slug}</p>
      <div className="mt-8"><ProductForm product={p} /></div>
    </div>
  );
}
