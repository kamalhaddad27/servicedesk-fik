"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useTickets } from "@/hooks/use-ticket"
import { useUsers } from "@/hooks/use-users"
import { DisposisiPayload, User } from "@/types"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/components/ui/use-toast"
import { CornerDownRight, Check, ArrowLeft, ArrowUpRight, ArrowDownLeft, AlertTriangle } from "lucide-react"
import { UserAvatar } from "@/components/user-avatar"
import Link from "next/link"
import { cn } from "@/lib/utils"

// Form schema
const disposisiSchema = z.object({
  toUserId: z.string().min(1, { message: "Penerima disposisi harus dipilih" }),
  reason: z.string().min(5, { message: "Alasan disposisi wajib diisi (min. 5 karakter)" }),
  notes: z.string().optional(),
  updateProgress: z.number().min(0).max(100).default(0),
  actionType: z.enum(["forward", "escalate", "return"])
})

interface DisposisiFormProps {
  ticketId: number
  currentHandlerId?: number
}

export default function DisposisiPage({ params }: { params: { id: string } }) {
  const ticketId = parseInt(params.id)
  const router = useRouter()
  const { useTicketDetail } = useTickets()
  const { data: ticket, isLoading, isError } = useTicketDetail(ticketId)
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }
  
  if (isError || !ticket) {
    return (
      <div className="text-center py-10">
        <AlertTriangle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
        <h2 className="text-xl font-semibold">Tiket tidak ditemukan</h2>
        <p className="text-muted-foreground mb-6">Tiket mungkin telah dihapus atau Anda tidak memiliki akses.</p>
        <Button asChild>
          <Link href="/tickets">Kembali ke Daftar Tiket</Link>
        </Button>
      </div>
    )
  }
  
  return (
    <div className="container max-w-4xl mx-auto py-6">
      {/* Back button and breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href={`/tickets/${ticketId}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Disposisi Tiket</h1>
          <div className="text-sm text-muted-foreground">
            <Link href="/tickets" className="hover:underline">Tiket</Link>
            <span className="mx-2">/</span>
            <Link href={`/tickets/${ticketId}`} className="hover:underline">
              {ticket.ticketNumber}
            </Link>
            <span className="mx-2">/</span>
            <span>Disposisi</span>
          </div>
        </div>
      </div>
      
      {/* Ticket Summary Card */}
      <Card className="mb-6 border-l-4 border-l-primary">
        <CardHeader className="pb-2">
          <CardTitle>{ticket.subject}</CardTitle>
          <CardDescription>
            Tiket #{ticket.ticketNumber} • {ticket.category}
            {ticket.subcategory && ` > ${ticket.subcategory}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm line-clamp-2">{ticket.description}</div>
        </CardContent>
      </Card>
      
      {/* Disposisi Form */}
      <DisposisiForm ticketId={ticketId} currentHandlerId={ticket.currentHandler} />
    </div>
  )
}

function DisposisiForm({ ticketId, currentHandlerId }: DisposisiFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { disposisiTicket } = useTickets()
  const { useUserDetail } = useUsers()
  const { data: currentHandler } = useUserDetail(currentHandlerId || 0)
  const [activeTab, setActiveTab] = useState<"forward" | "escalate" | "return">("forward")
  const [targetDepartment, setTargetDepartment] = useState<string | undefined>()
  
  // Get available staff for disposisi
  const { useAvailableDosen } = useUsers()
  const { data: availableUsers = [], isLoading: isLoadingUsers } = useAvailableDosen(targetDepartment)
  
  // Get user's department for filtering
  const { user } = useAuth()
  
  useEffect(() => {
    if (user) {
      setTargetDepartment(user.department)
    }
  }, [user])
  
  // Form definition
  const form = useForm<z.infer<typeof disposisiSchema>>({
    resolver: zodResolver(disposisiSchema),
    defaultValues: {
      toUserId: "",
      reason: "",
      notes: "",
      updateProgress: 0,
      actionType: "forward"
    }
  })
  
  // Update action type when tab changes
  useEffect(() => {
    form.setValue("actionType", activeTab)
  }, [activeTab, form])
  
  // Handle form submission
  const onSubmit = async (values: z.infer<typeof disposisiSchema>) => {
    try {
      // Convert string ID to number
      const payload: DisposisiPayload = {
        ticketId,
        toUserId: parseInt(values.toUserId),
        reason: values.reason,
        notes: values.notes || undefined,
        updateProgress: values.updateProgress || undefined,
        actionType: values.actionType
      }
      
      await disposisiTicket.mutateAsync(payload)
      
      toast({
        title: "Tiket berhasil didisposisi",
        description: "Tiket telah berhasil diteruskan ke pengguna lain.",
      })
      
      // Redirect back to ticket detail
      router.push(`/tickets/${ticketId}`)
    } catch (error) {
      toast({
        title: "Gagal mendisposisi tiket",
        description: "Terjadi kesalahan saat mendisposisi tiket. Silakan coba lagi.",
        variant: "destructive"
      })
    }
  }
  
  // Filter departments from available users
  const departments = [...new Set(availableUsers.map(user => user.department))].sort()
  
  // Get appropriate title and description based on action type
  const getActionDetails = () => {
    switch(activeTab) {
      case "forward":
        return {
          title: "Teruskan Tiket",
          description: "Teruskan tiket ke pengguna lain untuk ditindaklanjuti",
          icon: <CornerDownRight className="h-5 w-5 mr-2" />,
          color: "text-primary"
        }
      case "escalate":
        return {
          title: "Eskalasi Tiket",
          description: "Eskalasi tiket ke tingkat yang lebih tinggi untuk mendapatkan perhatian lebih",
          icon: <ArrowUpRight className="h-5 w-5 mr-2" />,
          color: "text-amber-500"
        }
      case "return":
        return {
          title: "Kembalikan Tiket",
          description: "Kembalikan tiket ke pengguna sebelumnya untuk informasi lebih lanjut",
          icon: <ArrowDownLeft className="h-5 w-5 mr-2" />,
          color: "text-blue-500"
        }
    }
  }
  
  const actionDetails = getActionDetails()
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center">
          <span className={actionDetails.color}>{actionDetails.icon}</span>
          <CardTitle>{actionDetails.title}</CardTitle>
        </div>
        <CardDescription>{actionDetails.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mb-6">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="forward" className="flex gap-2 items-center">
              <CornerDownRight className="h-4 w-4" />
              <span>Teruskan</span>
            </TabsTrigger>
            <TabsTrigger value="escalate" className="flex gap-2 items-center">
              <ArrowUpRight className="h-4 w-4" />
              <span>Eskalasi</span>
            </TabsTrigger>
            <TabsTrigger value="return" className="flex gap-2 items-center">
              <ArrowDownLeft className="h-4 w-4" />
              <span>Kembalikan</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Current handler info if available */}
            {currentHandler && (
              <div className="mb-6 p-3 bg-muted rounded-md">
                <p className="text-sm font-medium mb-2">Pemegang Tiket Saat Ini:</p>
                <div className="flex items-center gap-3">
                  <UserAvatar user={currentHandler} />
                  <div>
                    <p className="font-medium">{currentHandler.name}</p>
                    <p className="text-xs text-muted-foreground">{currentHandler.department}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Department filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Filter Departemen:</label>
              <Select value={targetDepartment} onValueChange={setTargetDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Departemen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Departemen</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* To User Select */}
            <FormField
              control={form.control}
              name="toUserId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teruskan Kepada</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih penerima disposisi" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingUsers ? (
                        <div className="flex justify-center p-2">
                          <LoadingSpinner className="h-6 w-6" />
                        </div>
                      ) : availableUsers.length === 0 ? (
                        <div className="p-2 text-center text-sm text-muted-foreground">
                          Tidak ada pengguna yang tersedia
                        </div>
                      ) : (
                        availableUsers.map((user) => (
                          <SelectItem key={user.id} value={String(user.id)}>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{user.name}</span>
                              <span className="text-xs text-muted-foreground">({user.department})</span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Pilih pengguna yang akan menangani tiket ini.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Reason */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alasan Disposisi</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Berikan alasan mengapa tiket ini didisposisi" 
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Alasan wajib diisi untuk memberikan konteks kepada penerima.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan Tambahan</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tambahkan catatan atau instruksi spesifik (opsional)" 
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Berikan informasi tambahan yang mungkin berguna bagi penerima.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Progress Update */}
            <FormField
              control={form.control}
              name="updateProgress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Update Progress ({field.value}%)
                  </FormLabel>
                  <FormControl>
                    <Slider
                      min={0}
                      max={100}
                      step={5}
                      defaultValue={[field.value]}
                      onValueChange={(values) => field.onChange(values[0])}
                      className="py-4"
                    />
                  </FormControl>
                  <FormDescription>
                    Perbarui persentase progress penyelesaian tiket.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" asChild>
          <Link href={`/tickets/${ticketId}`}>Batal</Link>
        </Button>
        <Button 
          onClick={form.handleSubmit(onSubmit)} 
          disabled={disposisiTicket.isPending}
          className={cn(
            activeTab === "forward" ? "bg-primary hover:bg-primary-600" :
            activeTab === "escalate" ? "bg-amber-500 hover:bg-amber-600" :
            "bg-blue-500 hover:bg-blue-600"
          )}
        >
          {disposisiTicket.isPending ? (
            <>
              <LoadingSpinner className="mr-2 h-4 w-4" />
              <span>Memproses...</span>
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              <span>
                {activeTab === "forward" ? "Teruskan Tiket" : 
                 activeTab === "escalate" ? "Eskalasi Tiket" : 
                 "Kembalikan Tiket"}
              </span>
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

function useAuth() {
  // This is a simplified version - your actual auth hook should be used
  return {
    user: {
      id: 1,
      name: "Admin User",
      department: "Informatika",
      role: "admin"
    }
  }
}