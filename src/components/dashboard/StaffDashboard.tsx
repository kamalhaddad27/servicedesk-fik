"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { PageTitle } from "@/components/ui/page-title";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getTicketStatusColor } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { FileText, ListTodo, FileWarning, Check, FilePen } from "lucide-react";
import { useSession } from "@/context/SessionContext";
import { Ticket } from "@prisma/client";

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

interface IStaffDashboard {
  myActiveTickets: number;
  myUrgentTickets: number;
  myCompletedTickets: number;
  unassignedTickets: number;
  myRecentTasks: (Ticket & { user: { name: string | null } })[];
}

export function StaffDashboard({ stats }: { stats: IStaffDashboard }) {
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
        description="Pantau dan kelola tiket yang ditugaskan kepada Anda."
      />

      <motion.div
        variants={itemVariants}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tiket Aktif Saya
            </CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.myActiveTickets}</div>
            <p className="text-xs text-muted-foreground">
              Tugas yang perlu dikerjakan
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tiket Mendesak
            </CardTitle>
            <FileWarning className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.myUrgentTickets}</div>
            <p className="text-xs text-muted-foreground">
              Prioritas tinggi & darurat
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiket Selesai</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.myCompletedTickets}</div>
            <p className="text-xs text-muted-foreground">
              Total tiket yang diselesaikan
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiket Baru</CardTitle>
            <FilePen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unassignedTickets}</div>
            <p className="text-xs text-muted-foreground">
              Tiket yang belum ditugaskan
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Tugas Terbaru Anda</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.myRecentTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <FileText className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-sm font-medium">Tidak Ada Tugas</p>
                <p className="text-xs text-muted-foreground">
                  Saat ini tidak ada tiket aktif yang ditugaskan kepada Anda.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.myRecentTasks.map((ticket) => (
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
                        <span>Dari: {ticket.user?.name || "N/A"}</span>
                      </div>
                    </div>
                    <Badge className={getTicketStatusColor(ticket.status)}>
                      {ticket.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link href="/tickets">Lihat Semua Tiket Saya</Link>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  );
}
