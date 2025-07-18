"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Camera,
  CheckCircle,
  Edit,
  Mail,
  UserIcon,
  Building,
  BookOpen,
  Calendar,
  Award,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User } from "@prisma/client";
import { getProfile } from "@/lib/action/user.action";

export default function ProfilePage() {
  const [dataUser, setDataUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getProfile();
      setDataUser(user);
    };
    fetchUser();
  }, [setDataUser]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Profil Pengguna</h1>
        <p className="text-muted-foreground">
          Lihat dan kelola informasi profil Anda
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="w-auto justify-start overflow-auto py-2 mb-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            <span>Profil</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            <span>Keamanan</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3 items-start">
            <Card className="md:col-span-1">
              <CardHeader className="bg-primary-50 border-b border-primary-100">
                <CardTitle className="text-lg">Foto Profil</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center pt-6 pb-4">
                <Button
                  size="icon"
                  className="rounded-full bg-primary hover:bg-primary-600"
                  disabled
                >
                  <Camera className="h-4 w-4" />
                  <span className="sr-only">Upload photo</span>
                </Button>
                <div className="text-center">
                  <h3 className="font-medium text-lg">{dataUser?.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {dataUser?.role}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center border-t border-primary-100 bg-primary-50/50 p-3">
                <Button
                  variant="outline"
                  className="w-full border-primary-200 text-primary hover:bg-primary-50"
                  disabled
                >
                  Ganti Foto
                </Button>
              </CardFooter>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader className="bg-primary-50 border-b border-primary-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Informasi Pribadi</CardTitle>
                </div>
                <CardDescription>Detail informasi profil Anda</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Nama Lengkap
                      </p>
                      <p className="flex items-center gap-2 mt-1">
                        <UserIcon className="h-4 w-4 text-primary" />
                        <span>{dataUser?.name}</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Email
                      </p>
                      <p className="flex items-center flex-wrap gap-2 mt-1">
                        <Mail className="h-4 w-4 text-primary" />
                        <span>{dataUser?.email}</span>
                      </p>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Departemen
                      </p>
                      <p className="flex items-center gap-2 mt-1">
                        <Building className="h-4 w-4 text-primary" />
                        <span>{dataUser?.department || "-"}</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Peran
                      </p>
                      <p className="flex items-center gap-2 mt-1">
                        <Award className="h-4 w-4 text-primary" />
                        <span>{dataUser?.role}</span>
                      </p>
                    </div>
                  </div>
                  {dataUser?.role === "mahasiswa" && (
                    <>
                      <Separator className="my-4" />
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            NIM
                          </p>
                          <p className="flex items-center gap-2 mt-1">
                            <BookOpen className="h-4 w-4 text-primary" />
                            <span>{dataUser?.nim || "-"}</span>
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Angkatan
                          </p>
                          <p className="flex items-center gap-2 mt-1">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span>{dataUser?.academicYear || "-"}</span>
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {dataUser?.role === "dosen" && (
                    <>
                      <Separator className="my-4" />
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            NIP
                          </p>
                          <p className="flex items-center gap-2 mt-1">
                            <BookOpen className="h-4 w-4 text-primary" />
                            <span>{dataUser?.nip || "-"}</span>
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Jabatan
                          </p>
                          <p className="flex items-center gap-2 mt-1">
                            <Award className="h-4 w-4 text-primary" />
                            <span>{dataUser?.position || "-"}</span>
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader className="bg-primary-50 border-b border-primary-100">
              <CardTitle className="text-lg">Ubah Password</CardTitle>
              <CardDescription>Perbarui password akun Anda</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Password Saat Ini</Label>
                  <Input
                    id="current-password"
                    name="current-password"
                    type="password"
                    placeholder="Masukkan password saat ini"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Password Baru</Label>
                  <Input
                    id="new-password"
                    name="new-password"
                    type="password"
                    placeholder="Masukkan password baru"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Konfirmasi Password</Label>
                  <Input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    placeholder="Konfirmasi password baru"
                  />
                </div>
                <div className="pt-2">
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary-600"
                  >
                    Ubah Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
