"use client";

import { Category, Subcategory } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface SubcategoryFormProps {
  action: (formData: FormData) => void;
  category: Category;
  subcategory?: Subcategory;
}

export function SubcategoryForm({
  action,
  category,
  subcategory,
}: SubcategoryFormProps) {
  return (
    <form action={action}>
      <DialogHeader>
        <DialogTitle>
          {subcategory ? "Edit" : "Tambah"} Subkategori untuk {category.name}
        </DialogTitle>
      </DialogHeader>
      <div className="py-4">
        <Input type="hidden" name="categoryId" value={category.id} />
        {subcategory && (
          <Input type="hidden" name="id" value={subcategory.id} />
        )}
        <Input
          name="name"
          defaultValue={subcategory?.name}
          placeholder="Nama Subkategori"
          required
        />
      </div>
      <DialogFooter>
        <Button type="submit">
          {subcategory ? "Simpan Perubahan" : "Simpan"}
        </Button>
      </DialogFooter>
    </form>
  );
}
