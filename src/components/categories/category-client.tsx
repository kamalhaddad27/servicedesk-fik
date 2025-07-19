"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Category, Subcategory } from "@prisma/client";
import { createCategory } from "@/lib/action/category.action";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { CategoryForm } from "./category-form";
import { CategoryItem } from "./category-item";

type CategoryWithSubcategories = Category & { subcategories: Subcategory[] };

export function CategoryClient({
  initialData,
}: {
  initialData: CategoryWithSubcategories[];
}) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleAction = async (
    action: Promise<{ success: boolean; message: string }>
  ) => {
    const result = await action;
    if (result.success) {
      toast.success(result.message);
      setIsCreateOpen(false);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Daftar Kategori</CardTitle>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <PlusCircle className="mr-2 h-4 w-4" /> Tambah Kategori
            </Button>
          </DialogTrigger>
          <DialogContent>
            <CategoryForm
              action={(formData) => handleAction(createCategory(formData))}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {initialData.map((category) => (
          <CategoryItem
            key={category.id}
            category={category}
            handleAction={handleAction}
          />
        ))}
      </CardContent>
    </Card>
  );
}
