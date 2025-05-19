"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { format, addMonths, subMonths, isSameDay, isSameMonth, startOfMonth, endOfMonth, isToday } from "date-fns"
import { id } from "date-fns/locale"
import { CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { ApiService } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { cn } from "@/lib/utils"

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [view, setView] = useState<"month" | "week" | "day">("month")
  const [department, setDepartment] = useState<string>("all")

  // Fetch tickets for calendar
  const { data: tickets, isLoading } = useQuery({
    queryKey: ["calendarTickets", { month: format(currentDate, "yyyy-MM"), department }],
    queryFn: () =>
      ApiService.getTickets({
        dateFrom: format(startOfMonth(currentDate), "yyyy-MM-dd"),
        dateTo: format(endOfMonth(currentDate), "yyyy-MM-dd"),
        department: department !== "all" ? department : undefined,
      }),
  })

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  // Get tickets for selected date
  const getTicketsForDate = (date: Date) => {
    if (!tickets) return []
    return tickets.filter((ticket) => {
      const ticketDate = new Date(ticket.createdAt)
      return isSameDay(ticketDate, date)
    })
  }

  // Get selected date tickets
  const selectedDateTickets = selectedDate ? getTicketsForDate(selectedDate) : []

  // Get ticket color based on priority
  const getTicketColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kalender Tiket</h1>
          <p className="text-sm text-muted-foreground">Lihat jadwal dan tiket berdasarkan tanggal</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Tabs defaultValue="month" value={view} onValueChange={(v) => setView(v as "month" | "week" | "day")}>
            <TabsList>
              <TabsTrigger value="month">Bulan</TabsTrigger>
              <TabsTrigger value="week">Minggu</TabsTrigger>
              <TabsTrigger value="day">Hari</TabsTrigger>
            </TabsList>
          </Tabs>

          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Departemen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Departemen</SelectItem>
              <SelectItem value="IT Support">IT Support</SelectItem>
              <SelectItem value="Akademik">Akademik</SelectItem>
              <SelectItem value="Keuangan">Keuangan</SelectItem>
              <SelectItem value="Fasilitas">Fasilitas</SelectItem>
              <SelectItem value="Administrasi">Administrasi</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            Hari Ini
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>{format(currentDate, "MMMM yyyy", { locale: id })}</CardTitle>
              <CardDescription>
                {isLoading ? "Memuat tiket..." : `${tickets?.length || 0} tiket dalam periode ini`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner className="h-8 w-8" />
                </div>
              ) : (
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  month={currentDate}
                  className="rounded-md border"
                  components={{
                    Day: ({ day, ...props }) => {
                        const date = new Date(day as unknown as string); // 👈 ini konversinya
                      
                        const dayTickets = getTicketsForDate(date);
                        const isSelected = selectedDate && isSameDay(date, selectedDate);
                        const isCurrentMonth = isSameMonth(date, currentDate);
                      
                        return (
                          <div
                            {...props}
                            className={cn(
                              "relative p-0",
                              props.className,
                              !isCurrentMonth && "text-muted-foreground opacity-50",
                            )}
                          >
                            <time
                              dateTime={format(date, "yyyy-MM-dd")}
                              className={cn(
                                "flex h-9 w-9 items-center justify-center rounded-md",
                                isSelected && "bg-primary text-primary-foreground",
                                isToday(date) && !isSelected && "border border-primary text-primary",
                              )}
                            >
                              {format(date, "d")}
                            </time>
                          {dayTickets.length > 0 && (
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                              <Badge
                                variant="outline"
                                className="h-1.5 w-1.5 rounded-full p-0 bg-primary border-primary"
                              />
                            </div>
                          )}
                        </div>
                      )
                    },
                  }}
                />
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span>{selectedDate ? format(selectedDate, "d MMMM yyyy", { locale: id }) : "Pilih Tanggal"}</span>
                <Button variant="outline" size="sm">
                  <Plus className="mr-1 h-4 w-4" />
                  Buat Tiket
                </Button>
              </CardTitle>
              <CardDescription>{selectedDateTickets.length} tiket pada tanggal ini</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDateTickets.length > 0 ? (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {selectedDateTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="flex flex-col gap-1 rounded-md border p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className={cn("font-normal", getTicketColor(ticket.priority))}>
                          {ticket.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(ticket.createdAt), "HH:mm")}
                        </span>
                      </div>
                      <h4 className="font-medium">{ticket.subject}</h4>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{ticket.department}</span>
                        <Badge variant="outline" className="font-normal">
                          {ticket.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium">Tidak ada tiket</h3>
                  <p className="text-sm text-muted-foreground mt-1">Tidak ada tiket pada tanggal ini</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
