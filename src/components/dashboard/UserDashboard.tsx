"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { PageTitle } from "../ui/page-title";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getTicketStatusColor } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, FileText, List, Check } from "lucide-react";
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

interface IUserDashboard {
  myActiveTickets: number;
  myCompletedTickets: number;
  totalTickets: number;
  recentTickets: Ticket[];
}

export function UserDashboard({ stats }: { stats: IUserDashboard }) {
  const { user } = useSession();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageTitle
          title={`Halo, ${user?.name}!`}
          description="Butuh bantuan? Ajukan tiket dan kami akan segera membantu Anda."
        />
        <Button asChild>
          <Link href="/tickets/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Buat Tiket Baru
          </Link>
        </Button>
      </div>

      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tiket Aktif Anda
            </CardTitle>
            <List className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.myActiveTickets}</div>
            <p className="text-xs text-muted-foreground">
              Tiket yang sedang diproses
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
              Masalah yang telah teratasi
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tiket</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTickets}</div>
            <p className="text-xs text-muted-foreground">
              Semua tiket yang pernah Anda buat
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <h3 className="text-lg font-semibold mb-2">
          Riwayat Tiket Terbaru Anda
        </h3>
        <Card>
          <CardContent className="pt-6">
            {stats.recentTickets.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <p>Anda belum pernah membuat tiket.</p>
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
                        <span>
                          {new Date(ticket.updatedAt).toLocaleDateString(
                            "id-ID"
                          )}
                        </span>
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
        </Card>
      </motion.div>
    </motion.div>
  );
}
