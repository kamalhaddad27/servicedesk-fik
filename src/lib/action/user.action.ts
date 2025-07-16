"use server";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { RoleUser, User } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET!;

// GET PROFILE ACTION
export async function getProfile(): Promise<User | null> {
  // 1. Ambil token dari cookie
  const token = (await cookies()).get("session_token")?.value;

  if (!token) {
    return null; // Tidak ada sesi
  }

  try {
    // 2. Verifikasi token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    // 3. Ambil data user terbaru dari database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (user) {
      // Hapus password dari objek sebelum dikirim ke client
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    }

    return null;
  } catch (error) {
    // Token tidak valid atau error lain
    console.error("GET_PROFILE_ERROR:", error);
    return null;
  }
}

// GET USER STAFF
export async function getAvailableStaff() {
  try {
    const staffUsers = await prisma.user.findMany({
      where: {
        role: RoleUser.staff,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    return staffUsers;
  } catch (error) {
    console.error("GET_STAFF_LIST_ERROR:", error);
    return [];
  }
}
