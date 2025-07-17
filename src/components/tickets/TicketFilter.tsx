"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, PlusCircle } from "lucide-react";
import { PriorityTicket, StatusTicket } from "@prisma/client";

export function TicketFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1"); // Selalu reset ke halaman 1 saat filter berubah
    if (value && value !== "all") {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    return params.toString();
  };

  const handleSearchChange = useDebouncedCallback((term: string) => {
    replace(`${pathname}?${createQueryString("query", term)}`);
  }, 300);

  const handleFilterChange = (name: string, value: string) => {
    replace(`${pathname}?${createQueryString(name, value)}`);
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex w-full items-center gap-2 md:w-auto">
        <div className="relative flex-1 md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari tiket..."
            className="pl-8"
            defaultValue={searchParams.get("query") || ""}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={searchParams.get("status") || "all"}
          onValueChange={(value) => handleFilterChange("status", value)}
        >
          <SelectTrigger className="h-9 w-auto">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value={StatusTicket.pending}>Pending</SelectItem>
            <SelectItem value={StatusTicket.progress}>In Progress</SelectItem>
            <SelectItem value={StatusTicket.done}>Completed</SelectItem>
            <SelectItem value={StatusTicket.cancel}>Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get("priority") || "all"}
          onValueChange={(value) => handleFilterChange("priority", value)}
        >
          <SelectTrigger className="h-9 w-auto">
            <SelectValue placeholder="Prioritas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Prioritas</SelectItem>
            <SelectItem value={PriorityTicket.low}>Low</SelectItem>
            <SelectItem value={PriorityTicket.medium}>Medium</SelectItem>
            <SelectItem value={PriorityTicket.high}>High</SelectItem>
            <SelectItem value={PriorityTicket.urgent}>Urgent</SelectItem>
          </SelectContent>
        </Select>

        <Button asChild>
          <Link href="/tickets/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Buat Tiket
          </Link>
        </Button>
      </div>
    </div>
  );
}
