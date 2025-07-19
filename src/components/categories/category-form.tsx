"use client";

import { Category } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface CategoryFormProps {
  action: (formData: FormData) => void;
  category?: Category;
}

export function CategoryForm({ action, category }: CategoryFormProps) {
  return (
    <form action={action}>
      <DialogHeader>
        <DialogTitle>
          {category ? "Edit Kategori" : "Tambah Kategori Baru"}
        </DialogTitle>
      </DialogHeader>
      <div className="py-4">
        {category && <Input type="hidden" name="id" value={category.id} />}
        <Input
          name="name"
          defaultValue={category?.name}
          placeholder="Nama Kategori"
          required
        />
      </div>
      <DialogFooter>
        <Button type="submit">
          {category ? "Simpan Perubahan" : "Simpan"}
        </Button>
      </DialogFooter>
    </form>
  );
}
