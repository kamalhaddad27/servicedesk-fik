import React, { useEffect, useState } from "react";
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
import { ImageUpload } from "../ui/image-upload";
import { getProfile } from "@/lib/action/user.action";
import { updateProfileImage } from "@/lib/action/profile.action";
import { toast } from "sonner";
import { LoadingSpinner } from "../ui/loading-spinner";

interface ITabProfile {
  user: User | null;
}

const TabProfile = ({ user }: ITabProfile) => {
  const [dataUser, setDataUser] = useState<User | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Untuk menonaktifkan tombol saat update

  useEffect(() => {
    getProfile().then((user) => setDataUser(user));
  }, []);

  const handleUploadComplete = async (url: string) => {
    setIsSubmitting(true);
    const result = await updateProfileImage(url);
    if (result.success) {
      toast.success(result.message);
      // Perbarui state lokal untuk menampilkan gambar baru secara instan
      setDataUser((prev) => (prev ? { ...prev, image: url } : null));
    } else {
      toast.error(result.message);
    }
    setIsSubmitting(false);
  };

  if (!dataUser) return <LoadingSpinner />;

  return (
    <TabsContent value="profile" className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3 items-start">
        <Card className="md:col-span-1">
          <CardHeader className="bg-primary-50 border-b border-primary-100">
            <CardTitle className="text-lg">Foto Profil</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center pt-6 pb-4">
            <ImageUpload
              currentImageUrl={user?.image}
              onUploadComplete={handleUploadComplete}
              isSubmitting={isSubmitting}
            />
          </CardContent>
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
                    user={user}
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
                <span>{user?.name}</span>
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="flex items-center flex-wrap gap-2 mt-1">
                <Mail className="h-4 w-4 text-primary" />
                <span>{user?.email}</span>
              </p>
            </div>
            {user?.role !== "mahasiswa" && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Departemen
                </p>
                <p className="flex items-center gap-2 mt-1">
                  <Building className="h-4 w-4 text-primary" />
                  <span>{user?.department || "-"}</span>
                </p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Peran</p>
              <p className="flex items-center gap-2 mt-1">
                <Award className="h-4 w-4 text-primary" />
                <span>{user?.role}</span>
              </p>
            </div>
            {user?.role === "mahasiswa" && (
              <>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Program Studi
                  </p>
                  <p className="flex items-center gap-2 mt-1">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span>{user?.major || "-"}</span>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    NIM
                  </p>
                  <p className="flex items-center gap-2 mt-1">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span>{user?.nim || "-"}</span>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Angkatan
                  </p>
                  <p className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{user?.academicYear || "-"}</span>
                  </p>
                </div>
              </>
            )}

            {user?.role === "dosen" && (
              <>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    NIP
                  </p>
                  <p className="flex items-center gap-2 mt-1">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span>{user?.nip || "-"}</span>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Jabatan
                  </p>
                  <p className="flex items-center gap-2 mt-1">
                    <Award className="h-4 w-4 text-primary" />
                    <span>{user?.position || "-"}</span>
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
