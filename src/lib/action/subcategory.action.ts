"use server";

import prisma from "@/lib/prisma";
import { getProfile } from "./user.action";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const subcategorySchema = z.object({
  name: z.string().min(3, "Nama subkategori minimal 3 karakter."),
  categoryId: z.string(),
});

export async function createSubcategory(formData: FormData) {
  try {
    const user = await getProfile();
    if (!user || user.role !== "admin") throw new Error("Akses ditolak.");

    const validatedData = subcategorySchema.parse({
      name: formData.get("name"),
      categoryId: formData.get("categoryId"),
    });

    await prisma.subcategory.create({
      data: validatedData,
    });

    revalidatePath("/settings/categories");
    return { success: true, message: "Subkategori berhasil dibuat." };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function updateSubcategory(formData: FormData) {
  try {
    const user = await getProfile();
    if (!user || user.role !== "admin") throw new Error("Akses ditolak.");

    const id = formData.get("id") as string;
    const validatedData = subcategorySchema.parse({
      name: formData.get("name"),
      categoryId: formData.get("categoryId"),
    });

    await prisma.subcategory.update({
      where: { id },
      data: { name: validatedData.name },
    });

    revalidatePath("/settings/categories");
    return { success: true, message: "Subkategori berhasil diperbarui." };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function deleteSubcategory(subcategoryId: string) {
  try {
    const user = await getProfile();
    if (!user || user.role !== "admin") throw new Error("Akses ditolak.");

    await prisma.subcategory.delete({
      where: { id: subcategoryId },
    });

    revalidatePath("/settings/categories");
    return { success: true, message: "Subkategori berhasil dihapus." };
  } catch (error: any) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return {
        success: false,
        message: "Gagal menghapus: Subkategori masih digunakan oleh tiket.",
      };
    }
    return { success: false, message: "Gagal menghapus subkategori." };
  }
}
