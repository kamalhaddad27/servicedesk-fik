"use server";

import prisma from "@/lib/prisma";

export async function getAllCategories() {
  try {
    return await prisma.category.findMany({
      orderBy: { name: "asc" },
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
