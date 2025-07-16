import { z } from "zod";

export const ticketSchema = z.object({
  subject: z.string().min(5, {
    message: "Judul tiket harus minimal 5 karakter",
  }),
  description: z.string().min(10, {
    message: "Deskripsi tiket harus minimal 10 karakter",
  }),
  category: z.string().min(1, {
    message: "Kategori harus dipilih",
  }),
  subcategory: z.string().optional(),
  type: z.string({
    required_error: "Tipe tiket harus dipilih",
  }),
  department: z.string().min(1, {
    message: "Departemen harus dipilih",
  }),
  priority: z.string().min(1, {
    message: "Prioritas harus dipilih",
  }),
});

export type TTicketSchema = z.infer<typeof ticketSchema>;
