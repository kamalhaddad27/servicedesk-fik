"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useTickets } from "@/hooks/use-ticket"
import { useDebounce } from "@/hooks/use-debounce"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { formatDate, getTicketStatusColor, getTicketPriorityColor, getSLAStatusColor } from "@/lib/utils"
import { PlusCircle, Search, Filter, AlertCircle, Ticket } from 'lucide-react'
import { useAuth } from "@/hooks/use-auth"

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.05,
    },
  },
}

const itemVariants = {
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
}

type TicketListProps = {
  filter?: string
}

export function TicketList({ filter }: TicketListProps) {
  const { user } = useAuth();
  const {
    tickets,
    totalItems,
    totalPages,
    currentPage,
    isLoading,
    isError,
    error,
    filters,
    updateFilters,
    nextPage,
    prevPage,
  } = useTickets()

  // Input text search state
  const [searchTerm, setSearchTerm] = useState(filters.search || "")
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  
  // Memoize the filter function to prevent recreation on every render
  const applyFilterByType = useCallback((filterType: string | undefined) => {
    if (!filterType) return;
    
    // Implementasikan logika filter sesuai dengan tipe yang didukung oleh updateFilters
    if (filterType === "assigned") {
      // Karena tidak ada assignedTo, gunakan status sebagai filter alternatif
      // dan tambahkan logika khusus di hook useTickets atau komponen lain
      updateFilters({ 
        status: "all",  // Gunakan filter yang didukung
        search: user?.name || "" // Gunakan search untuk filter tambahan jika perlu
      });
      console.log("Filter assigned applied - using status and search filters");
    } else if (filterType === "created") {
      // Gunakan filter yang tersedia
      updateFilters({ status: "all" });
      console.log("Filter created applied - using status filter");
    } else if (["pending", "completed", "in-progress", "disposisi", "cancelled"].includes(filterType)) {
      // Filter berdasarkan status yang valid
      updateFilters({ status: filterType });
      console.log(`Filter by status: ${filterType}`);
    } else {
      // Filter lainnya, gunakan sebagai category jika cocok
      updateFilters({ category: filterType });
      console.log(`Applied filter as category: ${filterType}`);
    }
  }, [updateFilters, user?.name]);

  // Handler for search input change
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  // Handle filter changes - only run once on mount or when filter/user changes
  // Using a ref to prevent repeated executions
  const filterApplied = useMemo(() => ({}), []);
  
  useEffect(() => {
    // Only apply filter if it hasn't been applied yet or if it changed
    if (filter && !filterApplied[filter]) {
      applyFilterByType(filter);
      filterApplied[filter] = true;
    }
  }, [filter, applyFilterByType, filterApplied]);

  // Effect for search term - separated from the filter effect
  useEffect(() => {
    if (debouncedSearchTerm !== filters.search) {
      updateFilters({ search: debouncedSearchTerm });
    }
  }, [debouncedSearchTerm, updateFilters, filters.search]);

  // Handlers for filter changes
  const handleStatusChange = useCallback((value: string) => {
    updateFilters({ status: value });
  }, [updateFilters]);

  const handlePriorityChange = useCallback((value: string) => {
    updateFilters({ priority: value });
  }, [updateFilters]);

  const handleCategoryChange = useCallback((value: string) => {
    updateFilters({ category: value });
  }, [updateFilters]);

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (isError) {
    return (
      <div className="text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-lg font-medium">Gagal memuat data</h3>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "Terjadi kesalahan saat memuat tiket."}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full items-center gap-2 md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari tiket..."
              className="pl-8"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <Button variant="outline" size="icon" className="shrink-0">
            <Filter className="h-4 w-4" />
            <span className="sr-only">Filter</span>
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={filters.status}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="h-9 w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="disposisi">Disposisi</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.priority}
            onValueChange={handlePriorityChange}
          >
            <SelectTrigger className="h-9 w-[130px]">
              <SelectValue placeholder="Prioritas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Prioritas</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.category}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className="h-9 w-[150px]">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              <SelectItem value="hardware">Hardware</SelectItem>
              <SelectItem value="software">Software</SelectItem>
              <SelectItem value="network">Network</SelectItem>
              <SelectItem value="account">Account</SelectItem>
              <SelectItem value="other">Other</SelectItem>
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

      {tickets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="rounded-full bg-muted p-3">
              <Ticket className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-medium">Tidak ada tiket</h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Tidak ada tiket yang sesuai dengan filter yang dipilih.
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
                    <Link href={`/tickets/${ticket.id}`} className="hover:underline">
                      <CardTitle className="text-base">{ticket.subject}</CardTitle>
                    </Link>
                    <div className="flex gap-2">
                      <Badge className={getTicketStatusColor(ticket.status)}>{ticket.status}</Badge>
                      <Badge className={getTicketPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                      {ticket.slaStatus && (
                        <Badge className={getSLAStatusColor(ticket.slaStatus)}>{ticket.slaStatus}</Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription>
                    Tiket #{ticket.ticketNumber} • {ticket.category}
                    {ticket.subcategory && ` > ${ticket.subcategory}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="line-clamp-2 text-sm text-muted-foreground">{ticket.description}</p>
                  {ticket.progress > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span>Progress</span>
                        <span>{ticket.progress}%</span>
                      </div>
                      <Progress value={ticket.progress} className="h-2 mt-1" />
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex items-center justify-between pt-0">
                  <div className="flex flex-col text-xs text-muted-foreground">
                    <span>
                      {ticket.creator?.name ? `Dari: ${ticket.creator.name}` : ""}
                      {ticket.handler?.name ? ` • Handler: ${ticket.handler.name}` : ""}
                    </span>
                    <span>Dibuat pada {formatDate(ticket.createdAt, "dd MMM yyyy")}</span>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/tickets/${ticket.id}`}>Lihat Detail</Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {tickets.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Menampilkan {tickets.length} dari {totalItems} tiket
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevPage}
              disabled={currentPage <= 1}
            >
              Sebelumnya
            </Button>
            <span className="text-sm">
              Halaman {currentPage} dari {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={nextPage}
              disabled={currentPage >= totalPages}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}