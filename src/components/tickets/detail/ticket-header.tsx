"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function TicketHeader() {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali
      </Button>
    </div>
  );
}
