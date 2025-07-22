"use client";

import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { RoleUser, StaffDepartment, User } from "@prisma/client";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { register } from "@/lib/action/auth.action";
import {
  createUserSchema,
  TCreateUserSchema,
  TUpdateUserSchema,
  updateUserSchema,
} from "@/lib/validator/user";
import { updateUser } from "@/lib/action/user.action";
import { Loader2 } from "lucide-react";

interface UserFormProps {
  user?: User;
  onSuccess: () => void;
}

type FormValues = TCreateUserSchema | TUpdateUserSchema;

export function UserForm({ user, onSuccess }: UserFormProps) {
  const isEditMode = !!user;

  const form = useForm<FormValues>({
    resolver: zodResolver(isEditMode ? updateUserSchema : createUserSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      role: user?.role || RoleUser.mahasiswa,
      department: user?.department || undefined,
      nip: user?.nip || "",
      nim: user?.nim || "",
      major: user?.major || "",
      college: user?.college || "",
      password: "",
      position: user?.position || "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    let result;
    if (isEditMode) {
      result = await updateUser({
        userId: user.id,
        values: data as TUpdateUserSchema,
      });
    } else {
      result = await register(data as TCreateUserSchema);
    }

    if (result.success) {
      toast.success(result.message);
      onSuccess();
      window.location.reload();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-2 gap-3"
      >
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
                <Input type="email" placeholder="Email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="password"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  placeholder={
                    isEditMode ? "Isi untuk mengubah password" : "Password"
                  }
                  type="text"
                  {...field}
                />
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
                  <SelectItem value={RoleUser.mahasiswa}>Mahasiswa</SelectItem>
                  <SelectItem value={RoleUser.dosen}>Dosen</SelectItem>
                  <SelectItem value={RoleUser.staff}>Staff</SelectItem>
                  <SelectItem value={RoleUser.admin}>Admin</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {user?.role === "staff" && (
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih department" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={StaffDepartment.LAB}>LAB</SelectItem>
                    <SelectItem value={StaffDepartment.REKTORAT}>
                      REKTORAT
                    </SelectItem>
                    <SelectItem value={StaffDepartment.TU}>TU</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {user?.role === "dosen" && (
          <>
            <FormField
              control={form.control}
              name="nip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NIP</FormLabel>
                  <FormControl>
                    <Input placeholder="NIP" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <FormControl>
                    <Input placeholder="Position" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {user?.role === "mahasiswa" && (
          <>
            <FormField
              control={form.control}
              name="nim"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NIM</FormLabel>
                  <FormControl>
                    <Input placeholder="NIM" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="major"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>prodi</FormLabel>
                  <FormControl>
                    <Input placeholder="prodi anda" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <div className="flex justify-end gap-2 pt-4 col-span-2">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Batal
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isEditMode ? "Simpan Perubahan" : "Tambah Pengguna"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
