"use server";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { responAction } from "./responseAction";
import { TLoginSchema, TRegisterSchema } from "@/lib/validator/auth";

const JWT_SECRET = process.env.JWT_SECRET!;

// REGISTER ACTION
export async function register(values: TRegisterSchema) {
  try {
    // Cek apakah email atau nomor telepon sudah ada
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email: values.email }, { phone: values.phone }] },
    });

    if (existingUser) {
      return responAction({
        statusError: true,
        messageError: "Email atau nomor telepon sudah terdaftar.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(values.password, 10);

    // Buat user baru (tambahkan field lain sesuai skema prisma Anda)
    await prisma.user.create({
      data: {
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: hashedPassword,
        // Default role, nim, nip, dll bisa ditambahkan di sini
        role: "user",
      },
    });

    return responAction({
      statusSuccess: true,
      messageSuccess: "Registrasi berhasil! Silakan login.",
    });
  } catch (error) {
    console.error("REGISTER_ERROR:", error);
    return responAction({
      statusError: true,
      messageError: "Terjadi kesalahan internal.",
    });
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
