"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useUsers } from "@/hooks/use-users"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { UserForm } from "./user-form"
import { AlertCircle, ArrowLeft, Mail, Building, Briefcase, User, Calendar, School, GraduationCap } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface UserDetailProps {
  userId: number
}

export function UserDetail({ userId }: UserDetailProps) {
  const router = useRouter()
  const { useUserDetail, deleteUser } = useUsers()
  const [activeTab, setActiveTab] = useState("profile")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Fetch user details
  const { data: user, isLoading, isError, error } = useUserDetail(userId)

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    const roleColors: Record<string, string> = {
      mahasiswa: "bg-blue-100 text-blue-800",
      dosen: "bg-green-100 text-green-800",
      admin: "bg-purple-100 text-purple-800",
      executive: "bg-amber-100 text-amber-800",
    }
    return roleColors[role] || "bg-gray-100 text-gray-800"
  }

  // Handle delete user
  const handleDeleteUser = async () => {
    try {
      await deleteUser.mutateAsync(userId)
      setIsDeleteDialogOpen(false)
      router.push("/users")
    } catch (error) {
      console.error("Error deleting user:", error)
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (isError || !user) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error instanceof Error ? error.message : "Gagal memuat detail pengguna. Silakan coba lagi nanti."}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>

        <div className="flex items-center gap-2">
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Edit Pengguna</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Edit Pengguna</DialogTitle>
                <DialogDescription>Perbarui informasi pengguna.</DialogDescription>
              </DialogHeader>
              <UserForm user={user} onSuccess={() => setIsEditDialogOpen(false)} />
            </DialogContent>
          </Dialog>

          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">Hapus</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Hapus Pengguna</DialogTitle>
                <DialogDescription>
                  Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  Batal
                </Button>
                <Button variant="destructive" onClick={handleDeleteUser} disabled={deleteUser.isPending}>
                  {deleteUser.isPending ? "Menghapus..." : "Hapus Pengguna"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{user.name}</CardTitle>
                  <CardDescription>
                    {user.nim ? `NIM: ${user.nim}` : user.nip ? `NIP: ${user.nip}` : ""}
                  </CardDescription>
                </div>
                <Badge className={getRoleBadgeColor(user.role)}>{user.role}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="profile">Profil</TabsTrigger>
                  <TabsTrigger value="tickets">Tiket</TabsTrigger>
                  <TabsTrigger value="performance">Kinerja</TabsTrigger>
                </TabsList>
                <TabsContent value="profile" className="mt-4 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="text-sm font-medium">Informasi Kontak</h3>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center">
                          <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{user.email}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium">Departemen & Jabatan</h3>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center">
                          <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{user.department}</span>
                        </div>
                        {user.position && (
                          <div className="flex items-center">
                            <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{user.position}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {user.role === "mahasiswa" && (
                      <>
                        <div>
                          <h3 className="text-sm font-medium">Informasi Akademik</h3>
                          <div className="mt-2 space-y-2">
                            <div className="flex items-center">
                              <School className="mr-2 h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{user.programStudi || "-"}</span>
                            </div>
                            <div className="flex items-center">
                              <GraduationCap className="mr-2 h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{user.fakultas || "-"}</span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">Angkatan {user.angkatan || "-"}</span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="tickets">
                  <div className="mt-4">
                    <h3 className="text-sm font-medium">Tiket Terkait</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Daftar tiket yang dibuat atau ditangani oleh pengguna ini akan ditampilkan di sini.
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="performance">
                  <div className="mt-4">
                    <h3 className="text-sm font-medium">Kinerja Pengguna</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Metrik kinerja pengguna akan ditampilkan di sini.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Informasi Pengguna</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  <User className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="mt-2 text-lg font-medium">{user.name}</h3>
                <Badge className={`mt-1 ${getRoleBadgeColor(user.role)}`}>{user.role}</Badge>
              </div>

              <div>
                <h3 className="text-xs font-medium text-muted-foreground">ID Pengguna</h3>
                <p className="mt-1 text-sm">{user.id}</p>
              </div>

              <div>
                <h3 className="text-xs font-medium text-muted-foreground">Status</h3>
                <p className="mt-1 text-sm">{user.status || "Aktif"}</p>
              </div>

              <div>
                <h3 className="text-xs font-medium text-muted-foreground">Aktivitas</h3>
                <div className="mt-1 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Tiket Dibuat</span>
                    <span>0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tiket Ditangani</span>
                    <span>0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tiket Selesai</span>
                    <span>0</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <a href={`mailto:${user.email}`}>Kirim Email</a>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
