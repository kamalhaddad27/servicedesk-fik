"use server";

import { revalidatePath } from "next/cache";
import prisma from "../prisma";
import { TUpdatePasswordSchema, TUpdateUserSchema } from "../validator/user";
import { getProfile } from "./user.action";
import bcrypt from "bcryptjs";

export async function updateProfile(values: TUpdateUserSchema) {
  try {
    const user = await getProfile();
    if (!user) throw new Error("Anda harus login.");

    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: values.name,
        email: values.email,
        department: values.department,
        nim: values.nim,
        nip: values.nip,
        academicYear: values.academicYear,
        position: values.position,
      },
    });
    revalidatePath("/profile");
    return { success: true, message: "Profil berhasil diperbarui." };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function updatePassword(values: TUpdatePasswordSchema) {
  try {
    const user = await getProfile();
    if (!user) {
      return {
        success: false,
        message: "Sesi tidak valid, silakan login kembali.",
      };
    }

    const isPasswordValid = await bcrypt.compare(
      values.currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return {
        success: false,
        message: "Password saat ini yang Anda masukkan salah.",
      };
    }

    const hashedPassword = await bcrypt.hash(values.newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return { success: true, message: "Password berhasil diubah." };
  } catch (error: any) {
    // Blok catch ini sekarang hanya untuk error tak terduga (misal: database down)
    console.error("UPDATE_PASSWORD_ERROR:", error);
    return { success: false, message: "Terjadi kesalahan pada server." };
  }
}

export async function updateProfileImage(imageUrl: string) {
  try {
    const user = await getProfile();
    if (!user) throw new Error("Anda harus login.");

    await prisma.user.update({
      where: { id: user.id },
      data: { image: imageUrl },
    });

    revalidatePath("/profile");
    return { success: true, message: "Foto profil berhasil diperbarui." };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
