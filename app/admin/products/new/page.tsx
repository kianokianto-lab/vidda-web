import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tightest md:text-4xl">New product</h1>
      <p className="mt-2 text-sm opacity-70">Add a product to the database. After save you can edit / delete from the list.</p>
      <div className="mt-8"><ProductForm /></div>
    </div>
  );
}
