import React, { useState } from "react";
import {
  createSubcategory,
  deleteSubcategory,
  updateSubcategory,
} from "@/lib/action/subcategory.action";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { SubcategoryForm } from "./subcategory-form";
import { Button } from "../ui/button";
import { Edit, PlusCircle, Trash2 } from "lucide-react";

import { CategoryItemProps } from "./category-item";

const SubcategoryItem = ({ category, handleAction }: CategoryItemProps) => {
  const [isAddSubOpen, setIsAddSubOpen] = useState(false);

  return (
    <div className="pl-4 mt-4 border-l-2 ml-2 space-y-2">
      {category.subcategories.map((sub) => (
        <div
          key={sub.id}
          className="flex justify-between items-center text-sm group"
        >
          <span className="text-muted-foreground">{sub.name}</span>
          <div className="flex gap-1">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant={"ghost"} className="h-7 w-7">
                  <Edit className="min-h-3.5 min-w-3.5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Subkategori</DialogTitle>
                </DialogHeader>
                <form
                  action={(formData) =>
                    handleAction(updateSubcategory(formData))
                  }
                >
                  <Input type="hidden" name="id" value={sub.id} />
                  <Input type="hidden" name="categoryId" value={category.id} />
                  <Input
                    name="name"
                    defaultValue={sub.name}
                    required
                    className="mb-4"
                  />
                  <DialogFooter>
                    <Button type="submit" className="w-full">
                      Simpan Perubahan
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant={"ghost"}
                  size="icon"
                  className="h-7 w-7 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Anda Yakin?</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogDescription>
                  Subkategori {sub.name} akan dihapus secara permanen.
                </AlertDialogDescription>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleAction(deleteSubcategory(sub.id))}
                  >
                    Ya, Hapus
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ))}
      <Dialog open={isAddSubOpen} onOpenChange={setIsAddSubOpen}>
        <DialogTrigger asChild>
          <Button size="sm" className="w-full mt-2 text-xs">
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Subkategori
          </Button>
        </DialogTrigger>
        <DialogContent>
          <SubcategoryForm
            category={category}
            action={(formData) =>
              handleAction(
                createSubcategory(formData).then(() => setIsAddSubOpen(false))
              )
            }
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubcategoryItem;
