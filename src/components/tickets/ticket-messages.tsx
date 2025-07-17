"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { useTickets } from "@/hooks/use-ticket";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox"; // Import the proper Checkbox component
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { AlertCircle, EyeOff, Paperclip, Send, Upload, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { MessageFormValues } from "@/types";
import { useSession } from "@/context/SessionContext";
import { RoleUser, TicketMessage } from "@prisma/client";
import {
  addTicketMessage,
  getTicketMessages,
} from "@/lib/action/message.action";
import { toast } from "sonner";
import { messageSchema, TMassageSchema } from "@/lib/validator/message";

// Form schema
// Tipe untuk pesan yang sudah digabung dengan info pengirim
type MessageWithSender = TicketMessage & {
  user: { name: string | null; role: RoleUser };
};

interface TicketMessagesProps {
  ticketId: string;
}

export function TicketMessages({ ticketId }: TicketMessagesProps) {
  const { user: currentUser } = useSession();
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm({
    resolver: zodResolver(messageSchema),
    defaultValues: { message: "", isInternal: false },
  });

  // Ambil data pesan saat komponen dimuat
  useEffect(() => {
    const fetchMessages = async () => {
      const result = await getTicketMessages(ticketId);
      if (result.success) {
        setMessages(result.data as MessageWithSender[]);
      }
      setIsLoading(false);
    };
    fetchMessages();
  }, [ticketId]);

  // Handler untuk submit form
  const onSubmit = async (values: TMassageSchema) => {
    const result = await addTicketMessage({
      ticketId,
      message: values.message,
      isInternal: values.isInternal,
    });

    if (result.success && result.data) {
      toast.success(result.message);
      setMessages((prev) => [...prev, result.data as MessageWithSender]);
      form.reset();
    } else {
      toast.error(result.message);
    }
  };

  const canSendInternal =
    currentUser?.role === "admin" || currentUser?.role === "staff";

  if (isLoading)
    return (
      <p className="text-sm text-muted-foreground mt-4">Memuat pesan...</p>
    );

  return (
    <div className="mt-4 space-y-6">
      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            Belum ada pesan.
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.userId === currentUser?.id
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-md rounded-lg p-3 ${
                  message.isInternal
                    ? "bg-amber-100 border border-amber-200"
                    : message.userId === currentUser?.id
                    ? "bg-amber-400 text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-medium mb-1">
                  <p>{message.user?.name}</p>
                  {message.isInternal && (
                    <EyeOff className="h-4 w-4 text-amber-600 ml-2" />
                  )}
                </div>
                <p className="whitespace-pre-wrap text-sm">{message.message}</p>
                <p
                  className={`text-xs mt-2 opacity-70 ${
                    message.userId === currentUser?.id
                      ? "text-right"
                      : "text-left"
                  }`}
                >
                  {new Date(message.createdAt).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t pt-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea placeholder="Tulis balasan Anda..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {canSendInternal && (
              <FormField
                control={form.control}
                name="isInternal"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <label className="text-sm font-medium">
                      Jadikan pesan internal
                    </label>
                  </FormItem>
                )}
              />
            )}
            <div className="flex justify-end">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                <Send className="mr-2 h-4 w-4" />
                {form.formState.isSubmitting ? "Mengirim..." : "Kirim"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
