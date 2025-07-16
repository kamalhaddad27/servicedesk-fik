"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { PageTitle } from "../ui/page-title";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getTicketStatusColor, getTicketPriorityColor } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  PlusCircle,
  CheckCircle,
  BarChart3,
  Users,
  Settings,
  TicketCheck,
} from "lucide-react";
import { useSession } from "@/context/SessionContext";
import { PriorityTicket, StatusTicket, Ticket } from "@prisma/client";

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

interface IAdminDashboard {
  totalTickets: number;
  completedTickets: number;
  activeTickets: number;
  totalUsers: number;
  ticketsByStatus: { status: StatusTicket; count: number }[];
  ticketsByPriority: { priority: PriorityTicket; count: number }[];
  recentTickets: (Ticket & { user: { name: string | null } })[];
}

export function AdminDashboard({ stats }: { stats: IAdminDashboard }) {
  const { user } = useSession();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <PageTitle
        title={`Selamat datang, ${user?.name}!`}
        description="Pantau dan kelola semua tiket dan pengguna dalam sistem."
      />

      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tiket</CardTitle>
            <TicketCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTickets}</div>
            <p className="text-xs text-muted-foreground">
              Total tiket dalam sistem
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiket Aktif</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTickets}</div>
            <p className="text-xs text-muted-foreground">
              Tiket yang sedang aktif
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiket Selesai</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedTickets}</div>
            <p className="text-xs text-muted-foreground">
              Tiket yang telah diselesaikan
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pengguna
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Jumlah pengguna terdaftar
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        variants={itemVariants} // Asumsi itemVariants sudah ada
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Status Tiket</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.ticketsByStatus.map((statusItem) => (
                <div key={statusItem.status} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs capitalize">
                      {statusItem.status}
                    </span>
                    <span className="text-xs font-medium">
                      {statusItem.count}
                    </span>
                  </div>
                  <Progress
                    value={(statusItem.count / stats.totalTickets) * 100}
                    className={`h-2 ${getTicketStatusColor(statusItem.status)}`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Tiket berdasarkan Prioritas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Ganti ticketStats menjadi stats */}
              {stats?.ticketsByPriority.map((priorityItem) => (
                <div key={priorityItem.priority} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs capitalize">
                      {priorityItem.priority}
                    </span>
                    <span className="text-xs font-medium">
                      {priorityItem.count}
                    </span>
                  </div>
                  <Progress
                    value={(priorityItem.count / stats.totalTickets) * 100}
                    className={`h-2 ${getTicketPriorityColor(
                      priorityItem.priority
                    )}`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Akses Cepat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <Button asChild variant="outline" className="justify-start">
                <Link href="/tickets/create">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Buat Tiket Baru
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link href="/users">
                  <Users className="mr-2 h-4 w-4" />
                  Kelola Pengguna
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Pengaturan Sistem
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Tiket Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6">
                Belum ada tiket
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <Link
                        href={`/tickets/${ticket.id}`}
                        className="font-medium hover:underline"
                      >
                        {ticket.subject}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>#{ticket.id.slice(-6).toUpperCase()}</span>
                        <span>•</span>
                        <span>{ticket.category}</span>
                        <span>•</span>
                        <span>
                          {ticket.user?.name ? `Dari: ${ticket.user.name}` : ""}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getTicketStatusColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link href="/tickets">Lihat Semua Tiket</Link>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  );
}
