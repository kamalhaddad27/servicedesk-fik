"use server";

import prisma from "@/lib/prisma";
import { getProfile } from "./user.action";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";

export async function getAllCategories() {
  try {
    return await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        subcategories: {
          orderBy: { name: "asc" },
        },
      },
    });
  } catch (error) {
    return [];
  }
}

export async function getCategoriesWithSubcategories() {
  try {
    return await prisma.category.findMany({
      include: {
        subcategories: {
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    return [];
  }
}

const categorySchema = z.object({
  name: z.string().min(3, { message: "Nama kategori minimal 3 karakter." }),
});

export async function createCategory(formData: FormData) {
  try {
    const user = await getProfile();
    if (!user || user.role !== "admin") throw new Error("Akses ditolak.");

    const validatedData = categorySchema.parse({
      name: formData.get("name"),
    });

    await prisma.category.create({
      data: { name: validatedData.name },
    });

    revalidatePath("/settings/categories"); // Asumsi halaman Anda ada di sini
    return { success: true, message: "Kategori berhasil dibuat." };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function updateCategory(formData: FormData) {
  try {
    const user = await getProfile();
    if (!user || user.role !== "admin") throw new Error("Akses ditolak.");

    const id = formData.get("id") as string;
    const validatedData = categorySchema.parse({
      name: formData.get("name"),
    });

    await prisma.category.update({
      where: { id },
      data: { name: validatedData.name },
    });

    revalidatePath("/settings/categories");
    return { success: true, message: "Kategori berhasil diperbarui." };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function deleteCategory(categoryId: string) {
  try {
    const user = await getProfile();
    if (!user || user.role !== "admin") throw new Error("Akses ditolak.");

    await prisma.category.delete({
      where: { id: categoryId },
    });

    revalidatePath("/settings/categories");
    return { success: true, message: "Kategori berhasil dihapus." };
  } catch (error: any) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return {
        success: false,
        message: "Gagal menghapus: Kategori masih digunakan oleh tiket.",
      };
    }
    return { success: false, message: "Gagal menghapus kategori." };
  }
}
