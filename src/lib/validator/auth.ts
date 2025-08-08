import { RoleUser } from "@prisma/client";
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, { message: "Username/Email tidak boleh kosong." }),
  password: z.string().min(1, { message: "Password tidak boleh kosong." }),
});

export const registerSchema = z.object({
  name: z.string().min(3, { message: "Nama minimal 3 karakter" }),
  email: z.string().email({ message: "Format email tidak valid" }),
  role: z.nativeEnum(RoleUser).optional(),
  password: z.string().min(6, { message: "Password minimal 6 karakter" }),
});

export type TLoginSchema = z.infer<typeof loginSchema>;
export type TRegisterSchema = z.infer<typeof registerSchema>;
