"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getTicketStatusColor,
  getTicketPriorityColor,
  formatDate,
} from "@/lib/utils";
import { FullTicket } from "./ticket-detail"; // Impor tipe dari komponen utama
import { TicketMessages } from "./ticket-messages";
import Image from "next/image";
import { FileText } from "lucide-react";

interface TicketMainCardProps {
  ticket: FullTicket;
}

export function TicketMainCard({ ticket }: TicketMainCardProps) {
  const [activeTab, setActiveTab] = useState("details");

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{ticket.subject}</CardTitle>
            <CardDescription>
              Tiket #{ticket.id.slice(-6).toUpperCase()} • Dibuat pada{" "}
              {formatDate(ticket.createdAt, "dd MMMM yyyy, HH:mm")}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge className={getTicketStatusColor(ticket.status)}>
              {ticket.status}
            </Badge>
            <Badge className={getTicketPriorityColor(ticket.priority)}>
              {ticket.priority}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="details">Detail</TabsTrigger>
            <TabsTrigger value="messages">Pesan</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="mt-4 space-y-4">
            <div>
              <h3 className="text-sm font-medium">Deskripsi</h3>
              <p className="mt-1 whitespace-pre-wrap text-sm">
                {ticket.description}
              </p>
            </div>

            {ticket.attachments && ticket.attachments.length > 0 && (
              <div>
                <h3 className="text-sm font-medium">Lampiran</h3>
                <div className="mt-2 space-y-2">
                  {ticket.attachments.map((attachment) => {
                    const isImage = /\.(jpg|jpeg|png|gif)$/i.test(
                      attachment.fileName
                    );
                    return (
                      <a
                        key={attachment.id}
                        href={attachment.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className=""
                      >
                        {isImage ? (
                          <Image
                            src={attachment.fileUrl}
                            alt={attachment.fileName}
                            width={0}
                            height={0}
                            sizes="100vw"
                            className="h-52 w-52 rounded-md object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                            <FileText className="h-5 w-5" />
                          </div>
                        )}
                        <span className="text-sm font-medium">
                          {attachment.fileName}
                        </span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>
          <TabsContent value="messages">
            <TicketMessages ticketId={ticket.id} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
