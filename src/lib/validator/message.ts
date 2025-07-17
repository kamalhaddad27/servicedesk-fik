import { z } from "zod";

export const messageSchema = z.object({
  message: z.string().min(1, "Pesan tidak boleh kosong."),
  isInternal: z.boolean().default(false),
});

export type TMassageSchema = z.infer<typeof messageSchema>;
