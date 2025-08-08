"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User } from "@prisma/client";

// Impor komponen UI
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { deleteUser } from "@/lib/action/user.action";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { UserForm } from "./user-form";

export function UserDetailHeader({ user }: { user: User }) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleDelete = async () => {
    const result = await deleteUser(user.id);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Pengguna berhasil dihapus.");
    }
  };

  return (
    <div className="flex items-center justify-between">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali
      </Button>

      {user.role !== "mahasiswa" && (
        <div className="flex items-center gap-2">
          {/* Dialog Edit */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Pengguna</DialogTitle>
                <DialogDescription>
                  Perbarui detail untuk {user.name}.
                </DialogDescription>
              </DialogHeader>
              <UserForm user={user} onSuccess={() => setIsEditOpen(false)} />
            </DialogContent>
          </Dialog>

          {/* Dialog Konfirmasi Hapus */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" /> Hapus
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Anda Yakin?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tindakan ini tidak bisa dibatalkan. Ini akan menghapus
                  pengguna secara permanen.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Ya, Hapus
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}
