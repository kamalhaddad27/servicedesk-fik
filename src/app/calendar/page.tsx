"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { PageTitle } from "@/components/ui/page-title"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { useQuery } from "@tanstack/react-query"
import { ApiService } from "@/lib/api"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, User } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDate } from "@/lib/utils"

export default function CalendarPage() {
  const { user } = useAuth()
  const [date, setDate] = useState<Date | undefined>(new Date())

  // Query for tickets with filtering
  const { 
    data: tickets = [], 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ["tickets", { date: date ? formatDate(date, "yyyy-MM-dd") : null }],
    queryFn: async () => {
      if (!date) return []
      
      // Format date for API
      const dateStr = formatDate(date, "yyyy-MM-dd")
      
      // Fetch tickets for the selected date
      return ApiService.getTickets({
        dateFrom: dateStr,
        dateTo: dateStr,
      })
    },
    enabled: !!date, // Only run query if date is selected
  })

  // Get events for calendar highlighting
  const { data: events = [] } = useQuery({
    queryKey: ["calendar-events"],
    queryFn: async () => {
      // This would fetch your calendar events from the API
      // For now, we'll just return an empty array
      return []
    },
  })

  // Create a function to highlight dates with events
  const getEventsForDate = (day: Date) => {
    // Format the day to compare with events
    const dayStr = formatDate(day, "yyyy-MM-dd")
    
    // Find events for this day
    return events.filter(event => {
      // This is a placeholder - adjust based on your event structure
      return event.date === dayStr
    })
  }

  // Safely ensure we have a valid date object
  const validateAndSetDate = (newDate: Date | undefined) => {
    // Make sure the date is valid before setting it
    if (newDate && !isNaN(newDate.getTime())) {
      setDate(newDate)
    } else {
      // If it's invalid, set to today's date
      setDate(new Date())
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error instanceof Error 
            ? error.message 
            : "Terjadi kesalahan saat memuat data kalender."}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="container mx-auto py-4">
      <PageTitle 
        title="Kalender Tiket" 
        description="Lihat jadwal tiket dan jadwal piket staf"
      />
      
      <div className="grid gap-4 md:grid-cols-7 lg:grid-cols-12">
        <Card className="md:col-span-3 lg:col-span-4">
          <CardHeader>
            <CardTitle>Kalendar</CardTitle>
            <CardDescription>Pilih tanggal untuk melihat tiket</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar 
              mode="single"
              selected={date}
              onSelect={validateAndSetDate}
              className="mx-auto"
              // Optional: Add custom modifiers for dates with events
              modifiers={{
                booked: (day) => getEventsForDate(day).length > 0
              }}
              // Optional: Add custom styling for booked dates
              modifiersStyles={{
                booked: { 
                  fontWeight: 'bold',
                  textDecoration: 'underline' 
                }
              }}
            />
          </CardContent>
        </Card>
        
        <Card className="md:col-span-4 lg:col-span-8">
          <CardHeader>
            <CardTitle>
              Tiket pada {date ? formatDate(date, "dd MMMM yyyy") : "hari ini"}
            </CardTitle>
            <CardDescription>
              {tickets.length} tiket ditemukan
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle className="h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">Tidak ada tiket</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Tidak ada tiket yang terdaftar pada tanggal ini.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div 
                    key={ticket.id}
                    className="flex items-start justify-between rounded-lg border p-4 hover:bg-muted"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="px-1 text-xs font-normal">
                          #{ticket.ticketNumber}
                        </Badge>
                        <h4 className="font-medium">{ticket.subject}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {ticket.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{ticket.priority}</span>
                        <span>{ticket.category}</span>
                        <span>
                          {formatDate(ticket.createdAt, "HH:mm")}
                        </span>
                      </div>
                    </div>
                    
                    {ticket.handler && (
                      <div className="flex flex-col items-end gap-1">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {ticket.handler.name?.charAt(0) || <User className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {ticket.handler.name}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}