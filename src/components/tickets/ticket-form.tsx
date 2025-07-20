"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import {
  createTicketSchema,
  TCreateTicketSchema,
} from "@/lib/validator/ticket";
import { Category, PriorityTicket, Subcategory } from "@prisma/client";
import { getCategoriesWithSubcategories } from "@/lib/action/category.action";
import { createTicket } from "@/lib/action/ticket.action";
import { toast } from "sonner";
import { FilePicker } from "../ui/file-uploader.tsx";
import { getSignature } from "@/lib/action/upload.action";

type CategoryWithSubcategories = Category & {
  subcategories: Subcategory[];
};

export function TicketForm() {
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  const form = useForm<TCreateTicketSchema>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      subject: "",
      description: "",
      priority: PriorityTicket.medium,
    },
  });

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getCategoriesWithSubcategories();
      setCategories(data);
    };
    fetchCategories();
  }, []);

  const selectedCategoryId = form.watch("categoryId");

  useEffect(() => {
    if (selectedCategoryId) {
      const selectedCategory = categories.find(
        (c) => c.id === selectedCategoryId
      );
      setSubcategories(selectedCategory?.subcategories || []);
      form.setValue("subcategoryId", "");
    } else {
      setSubcategories([]);
    }
  }, [selectedCategoryId, categories, form]);

  const onSubmit = async (values: TCreateTicketSchema) => {
    let attachmentData: { fileName: string; fileUrl: string } | null = null;

    if (fileToUpload) {
      try {
        const { timestamp, signature } = await getSignature();
        const formData = new FormData();
        formData.append("file", fileToUpload);
        formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);
        formData.append("signature", signature);
        formData.append("timestamp", timestamp.toString());

        const endpoint = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`;
        const response = await fetch(endpoint, {
          method: "POST",
          body: formData,
        });
        const data = await response.json();

        if (!data.secure_url) throw new Error("Upload ke Cloudinary gagal.");

        attachmentData = {
          fileName: fileToUpload.name,
          fileUrl: data.secure_url,
        };
      } catch (error) {
        toast.error("Gagal mengupload lampiran.");
        return;
      }
    }

    const finalValues = { ...values, attachment: attachmentData };
    const result = await createTicket(finalValues);
    if (result.success.status) {
      toast.error(result.success.message);
      form.reset();
    } else {
      toast.success(result.error.message);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Judul</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan judul tiket" {...field} />
                </FormControl>
                <FormDescription>
                  Masukkan judul singkat dan jelas untuk tiket Anda
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subcategoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subkategori</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={subcategories.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            !selectedCategoryId
                              ? "Pilih kategori dulu"
                              : "Pilih subkategori"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subcategories.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipe Tiket</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tipe tiket" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white">
                      <SelectItem value="pengajuan">Pengajuan</SelectItem>
                      <SelectItem value="laporan">Laporan</SelectItem>
                      <SelectItem value="permintaan">Permintaan</SelectItem>
                      <SelectItem value="lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Departemen</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih departemen" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white">
                      <SelectItem value="Akademik">Akademik</SelectItem>
                      <SelectItem value="Fasilitas">Fasilitas</SelectItem>
                      <SelectItem value="Keuangan">Keuangan</SelectItem>
                      <SelectItem value="Kemahasiswaan">
                        Kemahasiswaan
                      </SelectItem>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="Umum">Umum</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prioritas</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih prioritas" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white">
                      <SelectItem value={PriorityTicket.low}>Rendah</SelectItem>
                      <SelectItem value={PriorityTicket.medium}>
                        Sedang
                      </SelectItem>
                      <SelectItem value={PriorityTicket.high}>
                        Tinggi
                      </SelectItem>
                      <SelectItem value={PriorityTicket.urgent}>
                        Urgent
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deskripsi</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Jelaskan masalah/permintaan Anda secara detail"
                    className="h-32 resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Berikan informasi selengkap mungkin tentang tiket ini
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <FormLabel>Lampiran (Opsional)</FormLabel>
            <div className="mt-2">
              <FilePicker file={fileToUpload} onFileChange={setFileToUpload} />
            </div>
          </div>

          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full"
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Membuat
                Tiket...
              </>
            ) : (
              "Buat Tiket"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
