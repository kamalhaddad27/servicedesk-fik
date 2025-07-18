"use server";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { Prisma, RoleUser, StaffDepartment, User } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { TUpdateUserSchema } from "../validator/user";

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

// GET USER
interface GetUsersParams {
  page?: number;
  limit?: number;
  query?: string;
  role?: RoleUser;
  department?: StaffDepartment;
}

export async function getUsers({
  page = 1,
  limit = 10,
  query,
  role,
  department,
}: GetUsersParams) {
  try {
    const admin = await getProfile();
    if (!admin || admin.role !== "admin")
      throw new Error("Hanya admin yang bisa mengakses.");

    const skip = (page - 1) * limit;
    const where: Prisma.UserWhereInput = {};

    if (query) {
      where.OR = [
        { name: { contains: query } },
        { email: { contains: query } },
      ];
    }
    if (role) where.role = role;
    if (department) where.department = department;

    const [users, totalItems] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    return { data: users, totalPages, totalItems };
  } catch (error: any) {
    return { data: [], totalPages: 0, totalItems: 0, error: error.message };
  }
}

export async function getUserById(userId: string) {
  try {
    const admin = await getProfile();
    if (!admin || admin.role !== "admin") throw new Error("Akses ditolak.");

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            createdTickets: true,
            assignedTickets: true,
          },
        },
      },
    });
    return user;
  } catch (error) {
    return null;
  }
}

// DELETE USER
export async function deleteUser(userId: string) {
  try {
    const admin = await getProfile();
    if (!admin || admin.role !== "admin")
      throw new Error("Hanya admin yang bisa menghapus pengguna.");

    if (admin.id === userId)
      throw new Error("Anda tidak bisa menghapus akun Anda sendiri.");

    await prisma.user.delete({
      where: { id: userId },
    });

    revalidatePath("/users");
  } catch (error: any) {
    return { error: error.message };
  }

  redirect("/users");
}

// UPDATE USER
export async function updateUser({
  userId,
  values,
}: {
  userId: string;
  values: TUpdateUserSchema;
}) {
  try {
    const admin = await getProfile();
    if (!admin || admin.role !== "admin")
      throw new Error("Hanya admin yang bisa mengedit pengguna.");

    const dataToUpdate: Prisma.UserUpdateInput = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      role: values.role,
      department: values.department,
      nip: values.nip,
      nim: values.nim,
      major: values.major,
      college: values.college,
    };

    // Jika password baru diisi, hash dan sertakan dalam data update
    if (values.password) {
      dataToUpdate.password = await bcrypt.hash(values.password, 10);
    }

    await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    revalidatePath("/users");
    revalidatePath(`/users/${userId}`);

    return { success: true, message: "Data pengguna berhasil diperbarui." };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
