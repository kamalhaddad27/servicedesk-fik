import { CategoryClient } from "@/components/categories/category-client";
import { PageTitle } from "@/components/ui/page-title";
import { getAllCategories } from "@/lib/action/category.action";

export default async function CategorySettingsPage() {
  const categories = await getAllCategories();

  return (
    <div className="space-y-6">
      <PageTitle
        title="Manajemen Kategori"
        description="Tambah, edit, atau hapus kategori dan subkategori untuk tiket."
      />

      <CategoryClient initialData={categories} />
    </div>
  );
}
