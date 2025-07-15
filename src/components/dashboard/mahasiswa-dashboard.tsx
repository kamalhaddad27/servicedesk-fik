"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ApiService } from "@/lib/api";
import { PageTitle } from "../ui/page-title";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  formatDate,
  getTicketStatusColor,
  getTicketPriorityColor,
} from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  PlusCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
} from "lucide-react";
import TicketIconProps from "@/components/ui/ticket-icon"; // Import the Ticket component
import { Ticket } from "@/types";
import { useSession } from "@/context/SessionContext";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

export function MahasiswaDashboard() {
  const { user } = useSession();
  const [activeTab, setActiveTab] = useState("all");

  // Fetch my tickets
  const {
    data: tickets = [],
    isLoading,
    isError,
  } = useQuery<Ticket[]>({
    queryKey: ["tickets", "my"],
    queryFn: () => ApiService.getMyTickets(),
  });

  // Filter tickets based on active tab
  const filteredTickets = tickets.filter((ticket) => {
    if (activeTab === "all") return true;
    if (activeTab === "active")
      return ["pending", "disposisi", "in-progress"].includes(ticket.status);
    if (activeTab === "completed") return ticket.status === "completed";
    return true;
  });

  // Count tickets by status
  const pendingCount = tickets.filter(
    (ticket) => ticket.status === "pending"
  ).length;
  const inProgressCount = tickets.filter((ticket) =>
    ["disposisi", "in-progress"].includes(ticket.status)
  ).length;
  const completedCount = tickets.filter(
    (ticket) => ticket.status === "completed"
  ).length;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <div className="text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-lg font-medium">Gagal memuat data</h3>
        <p className="text-sm text-muted-foreground">
          Terjadi kesalahan saat memuat tiket Anda.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <PageTitle
        title={`Selamat datang, ${user?.name}!`}
        description="Pantau dan kelola tiket layanan Anda di satu tempat."
      />

      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tiket Menunggu
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              Tiket yang sedang menunggu proses
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tiket Diproses
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressCount}</div>
            <p className="text-xs text-muted-foreground">
              Tiket yang sedang dalam proses
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiket Selesai</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
            <p className="text-xs text-muted-foreground">
              Tiket yang telah selesai diproses
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Tiket Saya</h2>
          <Button asChild>
            <Link href="/tickets/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Buat Tiket Baru
            </Link>
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList>
            <TabsTrigger value="all">Semua</TabsTrigger>
            <TabsTrigger value="active">Aktif</TabsTrigger>
            <TabsTrigger value="completed">Selesai</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="mt-4">
            {filteredTickets.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <div className="rounded-full bg-muted p-3">
                    <TicketIconProps className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium">Tidak ada tiket</h3>
                  <p className="mt-2 text-center text-sm text-muted-foreground">
                    {activeTab === "all"
                      ? "Anda belum memiliki tiket. Buat tiket baru untuk memulai."
                      : activeTab === "active"
                      ? "Anda tidak memiliki tiket aktif saat ini."
                      : "Anda belum memiliki tiket yang selesai."}
                  </p>
                  {activeTab === "all" && (
                    <Button asChild className="mt-4">
                      <Link href="/tickets/create">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Buat Tiket Baru
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredTickets.map((ticket) => (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <Link
                            href={`/tickets/${ticket.id}`}
                            className="hover:underline"
                          >
                            <CardTitle className="text-base">
                              {ticket.subject}
                            </CardTitle>
                          </Link>
                          <div className="flex gap-2">
                            <Badge
                              className={getTicketStatusColor(ticket.status)}
                            >
                              {ticket.status}
                            </Badge>
                            <Badge
                              className={getTicketPriorityColor(
                                ticket.priority
                              )}
                            >
                              {ticket.priority}
                            </Badge>
                          </div>
                        </div>
                        <CardDescription>
                          Tiket #{ticket.ticketNumber} • {ticket.category}
                          {ticket.subcategory && ` > ${ticket.subcategory}`}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {ticket.description}
                        </p>
                      </CardContent>
                      <CardFooter className="flex items-center justify-between pt-0">
                        <p className="text-xs text-muted-foreground">
                          Dibuat pada{" "}
                          {formatDate(ticket.createdAt, "dd MMM yyyy")}
                        </p>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/tickets/${ticket.id}`}>
                            Lihat Detail
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
