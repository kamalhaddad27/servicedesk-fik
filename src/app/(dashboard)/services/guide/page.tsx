"use client";

import Link from "next/link";
import { ChevronLeft, Ticket, User, Settings, BarChart3 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";

export default function GuidePage() {
  const router = useRouter();

  const guides = [
    {
      id: "tickets",
      title: "Manajemen Tiket",
      icon: <Ticket className="h-5 w-5 text-primary" />,
      description: "Panduan lengkap untuk membuat dan mengelola tiket",
      sections: [
        {
          title: "Membuat Tiket Baru",
          content: (
            <div className="space-y-4">
              <p>Untuk membuat tiket baru, ikuti langkah-langkah berikut:</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  Klik menu <strong>Tiket</strong> di sidebar
                </li>
                <li>
                  Pilih <strong>Buat Tiket</strong>
                </li>
                <li>Isi formulir dengan detail permasalahan Anda</li>
                <li>Pilih kategori yang sesuai dengan permasalahan</li>
                <li>Tambahkan lampiran jika diperlukan</li>
                <li>
                  Klik tombol <strong>Kirim Tiket</strong>
                </li>
              </ol>
              <div className="bg-muted p-4 rounded-md">
                <p className="text-sm font-medium">Tip:</p>
                <p className="text-sm text-muted-foreground">
                  Semakin detail informasi yang Anda berikan, semakin cepat
                  permasalahan Anda dapat diselesaikan.
                </p>
              </div>
            </div>
          ),
        },
        {
          title: "Melacak Status Tiket",
          content: (
            <div className="space-y-4">
              <p>
                Anda dapat melacak status tiket yang telah dibuat dengan cara:
              </p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  Klik menu <strong>Tiket</strong> di sidebar
                </li>
                <li>
                  Pilih <strong>Semua Tiket</strong>
                </li>
                <li>Cari tiket yang ingin dilacak</li>
                <li>Klik pada tiket untuk melihat detail dan status terkini</li>
              </ol>
              <p>Status tiket dapat berupa:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <span className="text-warning font-medium">Pending</span> -
                  Tiket telah dibuat dan menunggu ditinjau
                </li>
                <li>
                  <span className="text-primary font-medium">In Progress</span>{" "}
                  - Tiket sedang dalam proses penanganan
                </li>
                <li>
                  <span className="text-success font-medium">Completed</span> -
                  Permasalahan telah diselesaikan
                </li>
                <li>
                  <span className="text-destructive font-medium">
                    Cancelled
                  </span>{" "}
                  - Tiket dibatalkan
                </li>
              </ul>
            </div>
          ),
        },
        {
          title: "Menambahkan Komentar",
          content: (
            <div className="space-y-4">
              <p>
                Anda dapat menambahkan komentar atau informasi tambahan pada
                tiket yang sudah dibuat:
              </p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Buka detail tiket yang ingin dikomentari</li>
                <li>Scroll ke bagian bawah halaman</li>
                <li>Tulis komentar Anda pada kotak yang tersedia</li>
                <li>
                  Klik tombol <strong>Kirim Komentar</strong>
                </li>
              </ol>
              <div className="bg-muted p-4 rounded-md">
                <p className="text-sm font-medium">Catatan:</p>
                <p className="text-sm text-muted-foreground">
                  Semua komentar akan terlihat oleh petugas yang menangani tiket
                  Anda.
                </p>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      id: "profile",
      title: "Manajemen Profil",
      icon: <User className="h-5 w-5 text-primary" />,
      description: "Panduan untuk mengelola profil dan akun pengguna",
      sections: [
        {
          title: "Mengubah Informasi Profil",
          content: (
            <div className="space-y-4">
              <p>Untuk mengubah informasi profil Anda:</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Klik avatar Anda di pojok kanan atas</li>
                <li>
                  Pilih <strong>Profil</strong>
                </li>
                <li>
                  Klik tombol <strong>Edit Profil</strong>
                </li>
                <li>Ubah informasi yang diinginkan</li>
                <li>
                  Klik tombol <strong>Simpan Perubahan</strong>
                </li>
              </ol>
            </div>
          ),
        },
        {
          title: "Mengubah Password",
          content: (
            <div className="space-y-4">
              <p>Untuk mengubah password akun Anda:</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Klik avatar Anda di pojok kanan atas</li>
                <li>
                  Pilih <strong>Profil</strong>
                </li>
                <li>
                  Klik tab <strong>Keamanan</strong>
                </li>
                <li>Masukkan password lama Anda</li>
                <li>Masukkan password baru</li>
                <li>Konfirmasi password baru</li>
                <li>
                  Klik tombol <strong>Ubah Password</strong>
                </li>
              </ol>
              <div className="bg-muted p-4 rounded-md">
                <p className="text-sm font-medium">Tip Keamanan:</p>
                <p className="text-sm text-muted-foreground">
                  Gunakan kombinasi huruf besar, huruf kecil, angka, dan simbol
                  untuk membuat password yang kuat.
                </p>
              </div>
            </div>
          ),
        },
      ],
    },
  ];

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-primary hover:bg-primary-50 hover:text-primary-700"
        >
          <Button variant={"ghost"} onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Kembali
          </Button>
        </Button>
      </div>

      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Panduan Pengguna</h1>
        <p className="text-muted-foreground">
          Pelajari cara menggunakan fitur-fitur Service Desk FIK dengan panduan
          lengkap berikut
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {guides.map((guide) => (
          <Card
            key={guide.id}
            className="overflow-hidden transition-all hover:shadow-md"
          >
            <CardHeader className="bg-primary-50 border-b border-primary-100">
              <div className="flex items-center gap-3">
                {guide.icon}
                <CardTitle className="text-lg">{guide.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <CardDescription className="text-sm text-foreground/80">
                {guide.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="tickets" className="w-full">
        <TabsList className="w-full justify-start overflow-auto py-2 mb-4">
          {guides.map((guide) => (
            <TabsTrigger
              key={guide.id}
              value={guide.id}
              className="flex items-center gap-2"
            >
              {guide.icon}
              <span>{guide.title}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        {guides.map((guide) => (
          <TabsContent
            key={guide.id}
            value={guide.id}
            className="border rounded-lg p-6"
          >
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                {guide.icon}
                <h2 className="text-2xl font-bold">{guide.title}</h2>
              </div>
              <p className="text-muted-foreground">{guide.description}</p>

              <div className="space-y-8 mt-6">
                {guide.sections.map((section, index) => (
                  <div key={index} className="space-y-4">
                    <h3 className="text-xl font-semibold text-primary-700">
                      {section.title}
                    </h3>
                    <div className="pl-4 border-l-2 border-primary-200">
                      {section.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
