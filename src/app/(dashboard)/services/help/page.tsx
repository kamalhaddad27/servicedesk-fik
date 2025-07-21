"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Search,
  HelpCircle,
  FileText,
  MessageSquare,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { back } = useRouter();

  // FAQ data
  const faqItems = [
    {
      question: "Bagaimana cara membuat tiket baru?",
      answer:
        "Untuk membuat tiket baru, klik tombol 'Buat Tiket' di sidebar atau di halaman Tiket. Isi formulir dengan detail masalah Anda, pilih kategori yang sesuai, dan klik 'Kirim'.",
      category: "general",
    },
    {
      question: "Berapa lama waktu penyelesaian tiket?",
      answer:
        "Waktu penyelesaian tiket bervariasi tergantung prioritas dan kompleksitas masalah. Tiket prioritas rendah biasanya diselesaikan dalam 3 hari kerja, prioritas sedang dalam 2 hari kerja, prioritas tinggi dalam 1 hari kerja, dan prioritas urgent dalam 4 jam.",
      category: "general",
    },
    {
      question: "Bagaimana cara melacak status tiket saya?",
      answer:
        "Anda dapat melacak status tiket di halaman 'Tiket'. Klik pada tiket untuk melihat detail dan riwayat aktivitas. Status tiket akan ditampilkan sebagai 'pending', 'in-progress', 'completed', atau 'cancelled'.",
      category: "general",
    },
    {
      question: "Bagaimana cara menambahkan lampiran ke tiket?",
      answer:
        "Saat membuat atau membalas tiket, Anda dapat menambahkan lampiran dengan mengklik tombol 'Tambah Lampiran' atau ikon klip kertas. Pilih file dari perangkat Anda dan klik 'Unggah'.",
      category: "technical",
    },
    {
      question:
        "Apa yang harus dilakukan jika tiket saya tidak kunjung ditanggapi?",
      answer:
        "Jika tiket Anda belum ditanggapi dalam jangka waktu yang wajar, Anda dapat mengirim pesan pengingat di tiket tersebut atau menghubungi admin melalui halaman 'Kontak Support'.",
      category: "general",
    },
    {
      question: "Bagaimana cara mengubah prioritas tiket?",
      answer:
        "Hanya admin dan petugas yang dapat mengubah prioritas tiket. Jika Anda merasa prioritas tiket perlu diubah, tambahkan komentar di tiket tersebut dengan permintaan perubahan prioritas.",
      category: "technical",
    },
    {
      question: "Apakah saya akan mendapat notifikasi saat tiket diperbarui?",
      answer:
        "Ya, Anda akan menerima notifikasi di aplikasi dan email (jika diaktifkan) setiap kali ada pembaruan pada tiket Anda, termasuk komentar baru, perubahan status, atau penyelesaian tiket.",
      category: "technical",
    },
    {
      question: "Bagaimana cara mengakses riwayat tiket lama?",
      answer:
        "Anda dapat melihat semua tiket lama di halaman 'Tiket' dengan memfilter berdasarkan status 'completed' atau 'cancelled'. Anda juga dapat menggunakan fitur pencarian untuk menemukan tiket berdasarkan kata kunci.",
      category: "technical",
    },
  ];

  // Filter FAQ based on search query and active tab
  const filteredFaq = faqItems.filter((item) => {
    const matchesSearch =
      searchQuery === "" ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Pusat Bantuan</h1>
          <p className="text-sm text-muted-foreground">
            Temukan jawaban untuk pertanyaan Anda
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary-foreground/5 rounded-lg -z-10" />
        <Card className="border-none bg-transparent shadow-none">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              Bagaimana kami dapat membantu Anda?
            </CardTitle>
            <CardDescription>
              Cari jawaban atau telusuri kategori bantuan di bawah
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex w-full max-w-lg mx-auto items-center space-x-2">
              <Input
                type="search"
                placeholder="Cari bantuan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10"
              />
              <Button type="submit">
                <Search className="h-4 w-4 mr-2" />
                Cari
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Pertanyaan yang Sering Diajukan</CardTitle>
            <CardDescription>
              Jawaban untuk pertanyaan umum tentang Service Desk FIK
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">Semua</TabsTrigger>
                <TabsTrigger value="general">Umum</TabsTrigger>
                <TabsTrigger value="technical">Teknis</TabsTrigger>
              </TabsList>
              <Accordion type="single" collapsible className="w-full">
                {filteredFaq.length > 0 ? (
                  filteredFaq.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center gap-2">
                          {faq.question}
                          <Badge
                            variant="outline"
                            className={cn(
                              "ml-2",
                              faq.category === "general"
                                ? "bg-blue-100 text-blue-800 border-blue-200"
                                : "bg-purple-100 text-purple-800 border-purple-200"
                            )}
                          >
                            {faq.category === "general" ? "Umum" : "Teknis"}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-muted-foreground">{faq.answer}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <HelpCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium">Tidak ada hasil</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Tidak ada FAQ yang cocok dengan pencarian Anda
                    </p>
                  </div>
                )}
              </Accordion>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
