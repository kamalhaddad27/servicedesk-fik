"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { motion } from "framer-motion"
import { Camera, CheckCircle, Edit, Mail, UserIcon, Building, BookOpen, Calendar, Award, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        department: user.department || "",
      })
    }
  }, [user])

  if (!user) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // In a real implementation, this would call the API
      // await ApiService.updateUser(user.id, formData)
      
      // For now, we'll simulate an API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update the user in auth context
      updateUser({ ...user, ...formData })
      
      toast({
        title: "Profil berhasil diperbarui",
        description: "Informasi profil Anda telah diperbarui dengan sukses.",
      })
      
      setIsEditing(false)
    } catch (error) {
      toast({
        title: "Gagal memperbarui profil",
        description: "Terjadi kesalahan saat memperbarui profil. Silakan coba lagi.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const roleLabels: Record<string, string> = {
    mahasiswa: "Mahasiswa",
    dosen: "Dosen",
    admin: "Administrator",
    executive: "Executive",
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Profil Pengguna</h1>
        <p className="text-muted-foreground">
          Lihat dan kelola informasi profil Anda
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="w-full max-w-md justify-start overflow-auto py-2 mb-4">
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
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-1">
              <CardHeader className="bg-primary-50 border-b border-primary-100">
                <CardTitle className="text-lg">Foto Profil</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center pt-6 pb-4">
                <div className="relative mb-4">
                  <Avatar className="h-32 w-32 border-4 border-primary-100">
                    <AvatarFallback className="bg-primary-50 text-primary-700 text-4xl">
                      {user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                    {user?.profileImage && (
                      <AvatarImage src={user.profileImage || "/placeholder.svg"} alt={user.name || "User"} />
                    )}
                  </Avatar>
                  <Button 
                    size="icon" 
                    className="absolute bottom-0 right-0 rounded-full bg-primary hover:bg-primary-600"
                    disabled
                  >
                    <Camera className="h-4 w-4" />
                    <span className="sr-only">Upload photo</span>
                  </Button>
                </div>
                <div className="text-center">
                  <h3 className="font-medium text-lg">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{roleLabels[user.role] || user.role}</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center border-t border-primary-100 bg-primary-50/50 p-3">
                <Button variant="outline" className="w-full border-primary-200 text-primary hover:bg-primary-50" disabled>
                  Ganti Foto
                </Button>
              </CardFooter>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader className="bg-primary-50 border-b border-primary-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Informasi Pribadi</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-primary hover:bg-primary-50 hover:text-primary-700"
                  >
                    {isEditing ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Selesai
                      </>
                    ) : (
                      <>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </>
                    )}
                  </Button>
                </div>
                <CardDescription>
                  {isEditing ? "Edit informasi profil Anda" : "Detail informasi profil Anda"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nama Lengkap</Label>
                      <Input 
                        id="name" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleInputChange} 
                        placeholder="Masukkan nama lengkap"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        value={formData.email} 
                        onChange={handleInputChange} 
                        placeholder="Masukkan email"
                        disabled
                      />
                      <p className="text-xs text-muted-foreground">Email tidak dapat diubah</p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Nomor Telepon</Label>
                        <Input 
                          id="phone" 
                          name="phone" 
                          value={formData.phone} 
                          onChange={handleInputChange} 
                          placeholder="Masukkan nomor telepon"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department">Departemen</Label>
                        <Input 
                          id="department" 
                          name="department" 
                          value={formData.department} 
                          onChange={handleInputChange} 
                          placeholder="Masukkan departemen"
                          disabled
                        />
                        <p className="text-xs text-muted-foreground">Departemen tidak dapat diubah</p>
                      </div>
                    </div>
                    <div className="pt-2">
                      <Button 
                        type="submit" 
                        className="bg-primary hover:bg-primary-600"
                        disabled={isLoading}
                      >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Simpan Perubahan
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Nama Lengkap</p>
                        <p className="flex items-center gap-2 mt-1">
                          <UserIcon className="h-4 w-4 text-primary" />
                          <span>{user.name}</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                        <p className="flex items-center gap-2 mt-1">
                          <Mail className="h-4 w-4 text-primary" />
                          <span>{user.email}</span>
                        </p>
                      </div>
                    </div>
                    <Separator className="my-4" />
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Departemen</p>
                        <p className="flex items-center gap-2 mt-1">
                          <Building className="h-4 w-4 text-primary" />
                          <span>{user.department || "-"}</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Peran</p>
                        <p className="flex items-center gap-2 mt-1">
                          <Award className="h-4 w-4 text-primary" />
                          <span>{roleLabels[user.role] || user.role}</span>
                        </p>
                      </div>
                    </div>
                    {user.role === "mahasiswa" && (
                      <>
                        <Separator className="my-4" />
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">NIM</p>
                            <p className="flex items-center gap-2 mt-1">
                              <BookOpen className="h-4 w-4 text-primary" />
                              <span>{user.nim || "-"}</span>
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Angkatan</p>
                            <p className="flex items-center gap-2 mt-1">
                              <Calendar className="h-4 w-4 text-primary" />
                              <span>{user.angkatan || "-"}</span>
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                    {user.role === "dosen" && (
                      <>
                        <Separator className="my-4" />
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">NIP</p>
                            <p className="flex items-center gap-2 mt-1">
                              <BookOpen className="h-4 w-4 text-primary" />
                              <span>{user.nip || "-"}</span>
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Jabatan</p>
                            <p className="flex items-center gap-2 mt-1">
                              <Award className="h-4 w-4 text-primary" />
                              <span>{user.position || "-"}</span>
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="bg-primary-50 border-b border-primary-100">
              <CardTitle className="text-lg">Aktivitas Terbaru</CardTitle>
              <CardDescription>Riwayat aktivitas terbaru Anda di sistem</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {[1, 2, 3].map((_, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-4 border-b border-muted pb-4 last:border-0"
                  >
                    <div className="rounded-full bg-primary-50 p-2">
                      <div className="h-8 w-8 rounded-full bg-muted/50" />
                    </div>
                    <div className="flex-1">
                      <div className="h-4 w-3/4 rounded-md bg-muted/50 mb-2" />
                      <div className="h-3 w-1/2 rounded-md bg-muted/30" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t border-primary-100 bg-primary-50/50 p-3 flex justify-center">
              <p className="text-sm text-muted-foreground">
                Fitur aktivitas terbaru akan segera tersedia
              </p>
            </CardFooter>
          </Card>
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
                  <Input id="current-password" type="password" placeholder="Masukkan password saat ini" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Password Baru</Label>
                  <Input id="new-password" type="password" placeholder="Masukkan password baru" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Konfirmasi Password</Label>
                  <Input id="confirm-password" type="password" placeholder="Konfirmasi password baru" />
                </div>
                <div className="pt-2">
                  <Button className="bg-primary hover:bg-primary-600">
                    Ubah Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-primary-50 border-b border-primary-100">
              <CardTitle className="text-lg">Pengaturan Keamanan</CardTitle>
              <CardDescription>Kelola pengaturan keamanan akun Anda</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-muted pb-4">
                  <div>
                    <h4 className="font-medium">Autentikasi Dua Faktor</h4>
                    <p className="text-sm text-muted-foreground">
                      Tingkatkan keamanan akun dengan autentikasi dua faktor
                    </p>
                  </div>
                  <Button variant="outline" className="border-primary-200 text-primary hover:bg-primary-50" disabled>
                    Aktifkan
                  </Button>
                </div>
                <div className="flex items-center justify-between border-b border-muted pb-4">
                  <div>
                    <h4 className="font-medium">Sesi Aktif</h4>
                    <p className="text-sm text-muted-foreground">
                      Kelola perangkat yang saat ini login ke akun Anda
                    </p>
                  </div>
                  <Button variant="outline" className="border-primary-200 text-primary hover:bg-primary-50" disabled>
                    Kelola
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Riwayat Login</h4>
                    <p className="text-sm text-muted-foreground">
                      Lihat riwayat login ke akun Anda
                    </p>
                  </div>
                  <Button variant="outline" className="border-primary-200 text-primary hover:bg-primary-50" disabled>
                    Lihat
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-primary-100 bg-primary-50/50 p-3 flex justify-center">
              <p className="text-sm text-muted-foreground">
                Fitur keamanan lanjutan akan segera tersedia
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
