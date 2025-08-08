"use server";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { responAction } from "./responseAction";
import { TLoginSchema, TRegisterSchema } from "@/lib/validator/auth";
import { RoleUser } from "@prisma/client";
import { revalidatePath } from "next/cache";

const JWT_SECRET = process.env.JWT_SECRET!;

// REGISTER ACTION
export async function register(values: TRegisterSchema) {
  try {
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
        role: values.role || RoleUser.mahasiswa,
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
    const { email: username, password } = values;
    const isMahasiswaLogin = /^\d+$/.test(username);

    if (isMahasiswaLogin) {
      // --- ALUR LOGIN MAHASISWA ---
      const basicAuth = Buffer.from(
        `${process.env.UPNVJ_BASIC_AUTH_USERNAME}:${process.env.UPNVJ_BASIC_AUTH_PASSWORD}`
      ).toString("base64");
      const response = await fetch(process.env.UPNVJ_API_URL!, {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicAuth}`,
          [process.env.UPNVJ_API_KEY_NAME!]: process.env.UPNVJ_API_KEY_SECRET!,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ username, password }),
      });
      if (!response.ok)
        throw new Error("Gagal terhubung ke server autentikasi.");

      const result = await response.json();

      // --- PERBAIKAN DI SINI ---
      if (result.success !== true) {
        // Cek properti 'success'
        throw new Error(result.message || "NIM atau Password salah.");
      }

      let user = await prisma.user.findUnique({ where: { nim: username } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            name: result.data.nama,
            email: `${username}@mahasiswa.upnvj.ac.id`,
            nim: username,
            role: RoleUser.mahasiswa,
            password: await bcrypt.hash(password, 10),
          },
        });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role, name: user.name, nim: user.nim },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      (await cookies()).set("session_token", token, {
        // httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });

      return { success: true, message: "Login sebagai mahasiswa berhasil!" };
    } else {
      // --- ALUR LOGIN LAMA (ADMIN/STAFF/DOSEN) ---
      const user = await prisma.user.findUnique({ where: { email: username } });
      if (!user || user.role === "mahasiswa")
        throw new Error("Email atau password salah.");

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) throw new Error("Email atau password salah.");

      const token = jwt.sign(
        { id: user.id, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      (await cookies()).set("session_token", token, {
        // httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });

      return { success: true, message: "Login berhasil!" };
    }
  } catch (error: any) {
    console.error("LOGIN_ERROR:", error);

    return { success: false, message: error.message || "Terjadi kesalahan." };
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
