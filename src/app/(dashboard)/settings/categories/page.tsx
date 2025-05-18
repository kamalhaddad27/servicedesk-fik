import { PageTitle } from "@/components/ui/page-title"
import { CategoriesForm } from "@/components/settings/categories-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Kategori Tiket - Service Desk FIK",
  description: "Kelola kategori tiket dalam sistem Service Desk FIK",
}

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <PageTitle title="Kategori Tiket" description="Kelola kategori dan subkategori tiket dalam sistem." />
      <CategoriesForm />
    </div>
  )
}
