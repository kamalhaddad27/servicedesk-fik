import React, { useState } from "react";
import { TabsContent } from "../ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import {
  Award,
  BookOpen,
  Building,
  Calendar,
  Camera,
  Edit,
  Mail,
  UserIcon,
} from "lucide-react";
import { User } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import UpdateProfile from "./update-profile";

interface ITabProfile {
  dataUser: User | null;
}

const TabProfile = ({ dataUser }: ITabProfile) => {
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
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
              <p className="text-sm text-muted-foreground">{dataUser?.role}</p>
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
            <div className="flex items-center justify-between w-full">
              <div>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Informasi Pribadi</CardTitle>
                </div>
                <CardDescription>Detail informasi profil Anda</CardDescription>
              </div>
              <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                      Perbarui detail diri anda
                    </DialogDescription>
                  </DialogHeader>
                  <UpdateProfile
                    user={dataUser}
                    onSuccess={() => setIsEditOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6 grid md:grid-cols-2">
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
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="flex items-center flex-wrap gap-2 mt-1">
                <Mail className="h-4 w-4 text-primary" />
                <span>{dataUser?.email}</span>
              </p>
            </div>
            {dataUser?.role !== "mahasiswa" && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Departemen
                </p>
                <p className="flex items-center gap-2 mt-1">
                  <Building className="h-4 w-4 text-primary" />
                  <span>{dataUser?.department || "-"}</span>
                </p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Peran</p>
              <p className="flex items-center gap-2 mt-1">
                <Award className="h-4 w-4 text-primary" />
                <span>{dataUser?.role}</span>
              </p>
            </div>
            {dataUser?.role === "mahasiswa" && (
              <>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Fakultas
                  </p>
                  <p className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{dataUser?.college || "-"}</span>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Program Studi
                  </p>
                  <p className="flex items-center gap-2 mt-1">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span>{dataUser?.major || "-"}</span>
                  </p>
                </div>
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
              </>
            )}

            {dataUser?.role === "dosen" && (
              <>
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
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
};

export default TabProfile;
