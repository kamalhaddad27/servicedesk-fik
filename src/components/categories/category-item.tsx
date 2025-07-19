"use client";

import { useState } from "react";
import { Category, Subcategory } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { CategoryForm } from "./category-form";
import { deleteCategory, updateCategory } from "@/lib/action/category.action";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import SubcategoryItem from "./subcategroy-item";

type CategoryWithSubcategories = Category & { subcategories: Subcategory[] };

export interface CategoryItemProps {
  category: CategoryWithSubcategories;
  handleAction: (action: Promise<any>) => void;
}

export function CategoryItem({ category, handleAction }: CategoryItemProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <div className="border p-4 rounded-md bg-card">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-card-foreground">{category.name}</h4>
        <div className="flex gap-2">
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <CategoryForm
                category={category}
                action={(formData) =>
                  handleAction(
                    updateCategory(formData).then(() => setIsEditOpen(false))
                  )
                }
              />
            </DialogContent>
          </Dialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Anda Yakin?</AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogDescription>
                Kategori {category.name} dan semua subkategorinya akan dihapus.
              </AlertDialogDescription>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleAction(deleteCategory(category.id))}
                >
                  Ya, Hapus
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Daftar Subkategori */}
      <SubcategoryItem category={category} handleAction={handleAction} />
    </div>
  );
}
