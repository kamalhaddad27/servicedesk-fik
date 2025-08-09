"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getTicketStatusColor,
  getTicketPriorityColor,
  formatDate,
} from "@/lib/utils";
import { PlusCircle, TicketIcon } from "lucide-react";
import { Ticket } from "@prisma/client";

interface TicketListProps {
  tickets: (Ticket & {
    user: { name: string | null };
    assignedTo: { name: string | null } | null;
    category: { name: string };
  })[];
}

export function TicketList({ tickets }: TicketListProps) {
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.05 } },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return tickets.length === 0 ? (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-10">
        <div className="rounded-full bg-muted p-3">
          <TicketIcon className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-medium">Tidak ada tiket</h3>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Saat ini tidak ada tiket yang perlu ditampilkan.
        </p>
        <Button asChild className="mt-4">
          <Link href="/tickets/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Buat Tiket Baru
          </Link>
        </Button>
      </CardContent>
    </Card>
  ) : (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {tickets.map((ticket) => (
        <motion.div key={ticket.id} variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Link
                  href={`/tickets/${ticket.id}`}
                  className="hover:underline"
                >
                  <CardTitle className="text-base">{ticket.subject}</CardTitle>
                </Link>
                <div className="flex gap-2">
                  <Badge className={getTicketStatusColor(ticket.status)}>
                    {ticket.status}
                  </Badge>
                  <Badge className={getTicketPriorityColor(ticket.priority)}>
                    {ticket.priority}
                  </Badge>
                </div>
              </div>
              <CardDescription>
                Tiket #{ticket.id.slice(-6).toUpperCase()} •{" "}
                {ticket.category.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {ticket.description}
              </p>
            </CardContent>
            <CardFooter className="flex items-center justify-between pt-0">
              <div className="text-xs text-muted-foreground">
                <span>Dari: {ticket.user?.name || "N/A"}</span>
                {ticket.assignedTo?.name && (
                  <span> • Ditugaskan ke: {ticket.assignedTo.name}</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Dibuat pada:{" "}
                {formatDate(ticket.createdAt, "dd MMMM yyyy, HH:mm")}
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
