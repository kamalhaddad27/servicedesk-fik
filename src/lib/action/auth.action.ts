"use server";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { responAction } from "./responseAction";
import { TLoginSchema, TRegisterSchema } from "@/lib/validator/auth";
import { RoleUser } from "@prisma/client";
import { getProfile } from "./user.action";
import { revalidatePath } from "next/cache";

const JWT_SECRET = process.env.JWT_SECRET!;

// REGISTER ACTION
export async function register(values: TRegisterSchema) {
  try {
    const admin = await getProfile();
    if (!admin || admin.role !== "admin")
      throw new Error("Hanya admin yang bisa membuat pengguna.");

    if (!values.password)
      throw new Error("Password wajib diisi untuk pengguna baru.");

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email: values.email }] },
    });
    if (existingUser)
      throw new Error("Email atau nomor telepon sudah terdaftar.");

    const hashedPassword = await bcrypt.hash(values.password, 10);

    await prisma.user.create({
      data: {
        name: values.name,
        email: values.email,
        role: values.role || RoleUser.user,
        password: hashedPassword,
      },
    });

    revalidatePath("/users");
    return { success: true, message: "Pengguna baru berhasil dibuat." };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// LOGIN ACTION (Dengan Cookie)
export async function login(values: TLoginSchema) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: values.email },
    });

    if (!user) {
      return responAction({
        statusError: true,
        messageError: "Email atau password salah.",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      values.password,
      user.password
    );
    if (!isPasswordValid) {
      return responAction({
        statusError: true,
        messageError: "Email atau password salah.",
      });
    }

    // Buat JWT Token
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" } // Token berlaku selama 7 hari
    );

    // Simpan token di HTTP-Only Cookie
    (await cookies()).set("session_token", token, {
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 hari
      path: "/",
    });

    return responAction({
      statusSuccess: true,
      messageSuccess: "Login berhasil!",
    });
  } catch (error) {
    console.error("LOGIN_ERROR:", error);
    return responAction({
      statusError: true,
      messageError: "Terjadi kesalahan internal.",
    });
  }
}

// LOGOUT ACTION
export async function logout() {
  try {
    // Hapus cookie
    (await cookies()).delete("session_token");

    return responAction({
      statusSuccess: true,
      messageSuccess: "Logout berhasil.",
    });
  } catch (error) {
    console.error("LOGOUT_ERROR:", error);
    return responAction({
      statusError: true,
      messageError: "Terjadi kesalahan internal.",
    });
  }
}
