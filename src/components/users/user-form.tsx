"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useUsers } from "@/hooks/use-users"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { User } from "@/types"

// Form schema
const userFormSchema = z.object({
  name: z.string().min(2, { message: "Nama minimal 2 karakter" }),
  email: z.string().email({ message: "Email tidak valid" }),
  password: z.string().min(6, { message: "Password minimal 6 karakter" }).optional(),
  nim: z.string().optional(),
  nip: z.string().optional(),
  role: z.string().min(1, { message: "Role harus dipilih" }),
  department: z.string().min(1, { message: "Departemen harus dipilih" }),
  position: z.string().optional(),
  programStudi: z.string().optional(),
  fakultas: z.string().optional(),
  angkatan: z.string().optional(),
})

interface UserFormProps {
  user?: User
  onSuccess?: () => void
}

export function UserForm({ user, onSuccess }: UserFormProps) {
  const { createUserByAdmin, updateUserByAdmin } = useUsers()
  const isEditing = !!user

  // Form definition
  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      password: "",
      nim: user?.nim || "",
      nip: user?.nip || "",
      role: user?.role || "",
      department: user?.department || "",
      position: user?.position || "",
      programStudi: user?.programStudi || "",
      fakultas: user?.fakultas || "",
      angkatan: user?.angkatan || "",
    },
  })

  // Selected role
  const selectedRole = form.watch("role")

  // Form submission
  const onSubmit = async (values: z.infer<typeof userFormSchema>) => {
    try {
      if (isEditing && user) {
        await updateUserByAdmin.mutateAsync({
          id: user.id,
          userData: values,
        })
      } else {
        await createUserByAdmin.mutateAsync(values)
      }
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error saving user:", error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama</FormLabel>
                <FormControl>
                  <Input placeholder="Nama lengkap" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Email" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
                    <SelectItem value="dosen">Dosen</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih departemen" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="informatika">Informatika</SelectItem>
                    <SelectItem value="sistem_informasi">Sistem Informasi</SelectItem>
                    <SelectItem value="teknik_komputer">Teknik Komputer</SelectItem>
                    <SelectItem value="akademik">Akademik</SelectItem>
                    <SelectItem value="keuangan">Keuangan</SelectItem>
                    <SelectItem value="kemahasiswaan">Kemahasiswaan</SelectItem>
                    <SelectItem value="umum">Umum</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {!isEditing && (
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input placeholder="Password" type="password" {...field} />
                  </FormControl>
                  <FormDescription>Minimal 6 karakter</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jabatan</FormLabel>
                <FormControl>
                  <Input placeholder="Jabatan" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedRole === "mahasiswa" && (
            <>
              <FormField
                control={form.control}
                name="nim"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NIM</FormLabel>
                    <FormControl>
                      <Input placeholder="Nomor Induk Mahasiswa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="programStudi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Program Studi</FormLabel>
                    <FormControl>
                      <Input placeholder="Program Studi" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fakultas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fakultas</FormLabel>
                    <FormControl>
                      <Input placeholder="Fakultas" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="angkatan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Angkatan</FormLabel>
                    <FormControl>
                      <Input placeholder="Angkatan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {(selectedRole === "dosen" || selectedRole === "admin" || selectedRole === "executive") && (
            <FormField
              control={form.control}
              name="nip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NIP</FormLabel>
                  <FormControl>
                    <Input placeholder="Nomor Induk Pegawai" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {(createUserByAdmin.isError || updateUserByAdmin.isError) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {createUserByAdmin.error instanceof Error
                ? createUserByAdmin.error.message
                : updateUserByAdmin.error instanceof Error
                  ? updateUserByAdmin.error.message
                  : "Terjadi kesalahan saat menyimpan data pengguna."}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Batal
          </Button>
          <Button type="submit" disabled={createUserByAdmin.isPending || updateUserByAdmin.isPending}>
            {createUserByAdmin.isPending || updateUserByAdmin.isPending
              ? "Menyimpan..."
              : isEditing
                ? "Perbarui Pengguna"
                : "Tambah Pengguna"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
