// lib/validator/auth.ts
import { z } from "zod";

export const loginSchema = z.object({
  // Menggunakan validasi email standar yang lebih tepat
  email: z.string().email({
    message: "Format email tidak valid",
  }),
  password: z
    .string()
    .min(6, { message: "Minimal karakter password adalah 6 karakter" })
    .max(50, { message: "Maksimal karakter password adalah 50" }),
});

export const registerSchema = z.object({
  name: z.string().min(3, { message: "Nama minimal 3 karakter" }),
  email: z.string().email({ message: "Format email tidak valid" }),
  phone: z.string().min(10, { message: "Nomor telepon tidak valid" }),
  password: z.string().min(6, { message: "Password minimal 6 karakter" }),
});

export type TLoginSchema = z.infer<typeof loginSchema>;
export type TRegisterSchema = z.infer<typeof registerSchema>;
