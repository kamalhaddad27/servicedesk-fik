"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ApiService } from "@/lib/api";
import { PageTitle } from "@/components/ui/page-title";
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
import { Progress } from "@/components/ui/progress";
import {
  formatDate,
  getTicketStatusColor,
  getTicketPriorityColor,
  getSLAStatusColor,
} from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  PlusCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  FileText,
  AlertTriangle,
} from "lucide-react";
import type { Ticket } from "@/types";
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

export function DosenDashboard() {
  const { user } = useSession();
  const [activeTab, setActiveTab] = useState("assigned");

  const {
    data: assignedTickets = [],
    isLoading: isLoadingAssigned,
    isError: isErrorAssigned,
  } = useQuery<Ticket[]>({
    queryKey: ["tickets", "assigned"],
    queryFn: () => ApiService.getAssignedTickets(),
  });

  const {
    data: myTickets = [],
    isLoading: isLoadingMy,
    isError: isErrorMy,
  } = useQuery<Ticket[]>({
    queryKey: ["tickets", "my"],
    queryFn: () => ApiService.getMyTickets(),
  });
  // Filter tickets based on active tab
  const displayedTickets =
    activeTab === "assigned" ? assignedTickets : myTickets;

  // Count tickets by status for assigned tickets
  const pendingCount = assignedTickets.filter(
    (ticket) => ticket.status === "pending"
  ).length;
  const inProgressCount = assignedTickets.filter(
    (ticket) => ticket.status === "in-progress"
  ).length;
  const completedCount = assignedTickets.filter(
    (ticket) => ticket.status === "completed"
  ).length;
  const atRiskCount = assignedTickets.filter(
    (ticket) => ticket.slaStatus === "at-risk"
  ).length;

  // Count tickets by SLA status
  const onTimeCount = assignedTickets.filter(
    (ticket) => ticket.slaStatus === "on-time"
  ).length;
  const atRiskSLACount = assignedTickets.filter(
    (ticket) => ticket.slaStatus === "at-risk"
  ).length;
  const breachedCount = assignedTickets.filter(
    (ticket) => ticket.slaStatus === "breached"
  ).length;

  const isLoading = isLoadingAssigned || isLoadingMy;
  const isError = isErrorAssigned || isErrorMy;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <div className="text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-lg font-medium">Gagal memuat data</h3>
        <p className="text-sm text-muted-foreground">
          Terjadi kesalahan saat memuat tiket.
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
        description="Pantau dan kelola tiket yang ditugaskan kepada Anda."
      />

      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menunggu</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              Tiket yang menunggu tindakan
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dalam Proses</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressCount}</div>
            <p className="text-xs text-muted-foreground">
              Tiket yang sedang diproses
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selesai</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
            <p className="text-xs text-muted-foreground">
              Tiket yang telah diselesaikan
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Berisiko</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{atRiskCount}</div>
            <p className="text-xs text-muted-foreground">
              Tiket yang berisiko melewati SLA
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Status SLA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs">Tepat Waktu</span>
                <span className="text-xs font-medium">{onTimeCount}</span>
              </div>
              <Progress
                value={(onTimeCount / assignedTickets.length) * 100 || 0}
                className="h-2 bg-green-100"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs">Berisiko</span>
                <span className="text-xs font-medium">{atRiskSLACount}</span>
              </div>
              <Progress
                value={(atRiskSLACount / assignedTickets.length) * 100 || 0}
                className="h-2 bg-yellow-100"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs">Terlambat</span>
                <span className="text-xs font-medium">{breachedCount}</span>
              </div>
              <Progress
                value={(breachedCount / assignedTickets.length) * 100 || 0}
                className="h-2 bg-red-100"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Tiket Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            {assignedTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Tidak ada tiket yang ditugaskan
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignedTickets.slice(0, 3).map((ticket) => (
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
                        <span>#{ticket.ticketNumber}</span>
                        <span>•</span>
                        <span>{ticket.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getTicketStatusColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                      {ticket.slaStatus && (
                        <Badge className={getSLAStatusColor(ticket.slaStatus)}>
                          {ticket.slaStatus}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link href="/tickets/assigned">Lihat Semua Tiket</Link>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Tiket</h2>
          <Button asChild>
            <Link href="/tickets/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Buat Tiket Baru
            </Link>
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList>
            <TabsTrigger value="assigned">Ditugaskan</TabsTrigger>
            <TabsTrigger value="my">Tiket Saya</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="mt-4">
            {displayedTickets.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <div className="rounded-full bg-muted p-3">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium">Tidak ada tiket</h3>
                  <p className="mt-2 text-center text-sm text-muted-foreground">
                    {activeTab === "assigned"
                      ? "Tidak ada tiket yang ditugaskan kepada Anda saat ini."
                      : "Anda belum memiliki tiket. Buat tiket baru untuk memulai."}
                  </p>
                  {activeTab === "my" && (
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
                {displayedTickets.map((ticket) => (
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
                            {ticket.slaStatus && (
                              <Badge
                                className={getSLAStatusColor(ticket.slaStatus)}
                              >
                                {ticket.slaStatus}
                              </Badge>
                            )}
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
                        {ticket.progress > 0 && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs">
                              <span>Progress</span>
                              <span>{ticket.progress}%</span>
                            </div>
                            <Progress
                              value={ticket.progress}
                              className="h-2 mt-1"
                            />
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="flex items-center justify-between pt-0">
                        <p className="text-xs text-muted-foreground">
                          {ticket.creator?.name
                            ? `Dari: ${ticket.creator.name} • `
                            : ""}
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
