import { RoleUser, StaffDepartment } from "@prisma/client";
import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(3, "Nama wajib diisi"),
  email: z.string().email("Email tidak valid"),
  role: z.nativeEnum(RoleUser),
  password: z.string().min(6, "Password minimal 6 karakter"),
  phone: z.string().optional(),
  department: z.nativeEnum(StaffDepartment).optional(),
  nip: z.string().optional(),
  nim: z.string().optional(),
  major: z.string().optional(),
  college: z.string().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(3, "Nama wajib diisi"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().optional(),
  role: z.nativeEnum(RoleUser),
  department: z.nativeEnum(StaffDepartment).optional(),
  nip: z.string().optional(),
  nim: z.string().optional(),
  major: z.string().optional(),
  college: z.string().optional(),

  password: z
    .string()
    .min(6, "Password minimal 6 karakter")
    .optional()
    .or(z.literal("")),
});

export type TUpdateUserSchema = z.infer<typeof updateUserSchema>;
export type TCreateUserSchema = z.infer<typeof createUserSchema>;
