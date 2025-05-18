"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useSettings } from "@/hooks/use-settings"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { AlertCircle, CheckCircle } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"


// Form schema
const generalSettingsSchema = z.object({
  siteName: z.string().min(1, { message: "Nama situs harus diisi" }),
  siteDescription: z.string().optional(),
  contactEmail: z.string().email({ message: "Email tidak valid" }),
  maxAttachmentSize: z.string().min(1, { message: "Ukuran maksimal lampiran harus diisi" }),
  allowRegistration: z.boolean().default(false),
})

const ticketSettingsSchema = z.object({
  defaultPriority: z.string().min(1, { message: "Prioritas default harus dipilih" }),
  autoAssignTickets: z.boolean().default(true),
  requireApproval: z.boolean().default(false),
  allowAnonymousTickets: z.boolean().default(false),
  ticketPrefix: z.string().min(1, { message: "Prefix tiket harus diisi" }),
})

const slaSettingsSchema = z.object({
  enableSLA: z.boolean().default(true),
  lowPrioritySLA: z.string().min(1, { message: "SLA untuk prioritas rendah harus diisi" }),
  mediumPrioritySLA: z.string().min(1, { message: "SLA untuk prioritas sedang harus diisi" }),
  highPrioritySLA: z.string().min(1, { message: "SLA untuk prioritas tinggi harus diisi" }),
  urgentPrioritySLA: z.string().min(1, { message: "SLA untuk prioritas urgent harus diisi" }),
  sendSLANotifications: z.boolean().default(true),
})

const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean().default(true),
  inAppNotifications: z.boolean().default(true),
  notifyOnNewTicket: z.boolean().default(true),
  notifyOnTicketUpdate: z.boolean().default(true),
  notifyOnTicketAssignment: z.boolean().default(true),
  notifyOnSLABreach: z.boolean().default(true),
  digestFrequency: z.string().min(1, { message: "Frekuensi digest harus dipilih" }),
})

export function SettingsForm() {
  const { settings, isLoading, updateSetting, updateMultipleSettings } = useSettings()
  const [activeTab, setActiveTab] = useState("general")
  const [success, setSuccess] = useState<string | null>(null)

  // General settings form
  const generalForm = useForm<z.infer<typeof generalSettingsSchema>>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      siteName: settings?.siteName || "Service Desk FIK",
      siteDescription: settings?.siteDescription || "Sistem Layanan Terpadu Fakultas Ilmu Komputer",
      contactEmail: settings?.contactEmail || "servicedesk@fik.upnvj.ac.id",
      maxAttachmentSize: settings?.maxAttachmentSize || "10",
      allowRegistration: settings?.allowRegistration || false,
    },
  })

  // Ticket settings form
  const ticketForm = useForm<z.infer<typeof ticketSettingsSchema>>({
    resolver: zodResolver(ticketSettingsSchema),
    defaultValues: {
      defaultPriority: settings?.defaultPriority || "medium",
      autoAssignTickets: settings?.autoAssignTickets || true,
      requireApproval: settings?.requireApproval || false,
      allowAnonymousTickets: settings?.allowAnonymousTickets || false,
      ticketPrefix: settings?.ticketPrefix || "FIK",
    },
  })

  // SLA settings form
  const slaForm = useForm<z.infer<typeof slaSettingsSchema>>({
    resolver: zodResolver(slaSettingsSchema),
    defaultValues: {
      enableSLA: settings?.enableSLA || true,
      lowPrioritySLA: settings?.lowPrioritySLA || "72",
      mediumPrioritySLA: settings?.mediumPrioritySLA || "48",
      highPrioritySLA: settings?.highPrioritySLA || "24",
      urgentPrioritySLA: settings?.urgentPrioritySLA || "4",
      sendSLANotifications: settings?.sendSLANotifications || true,
    },
  })

  // Notification settings form
  const notificationForm = useForm<z.infer<typeof notificationSettingsSchema>>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      emailNotifications: settings?.emailNotifications || true,
      inAppNotifications: settings?.inAppNotifications || true,
      notifyOnNewTicket: settings?.notifyOnNewTicket || true,
      notifyOnTicketUpdate: settings?.notifyOnTicketUpdate || true,
      notifyOnTicketAssignment: settings?.notifyOnTicketAssignment || true,
      notifyOnSLABreach: settings?.notifyOnSLABreach || true,
      digestFrequency: settings?.digestFrequency || "daily",
    },
  })

  // Submit general settings
  const onGeneralSubmit = async (values: z.infer<typeof generalSettingsSchema>) => {
    try {
      await updateMultipleSettings.mutateAsync(values)
      setSuccess("Pengaturan umum berhasil disimpan")
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error("Error saving general settings:", error)
    }
  }

  // Submit ticket settings
  const onTicketSubmit = async (values: z.infer<typeof ticketSettingsSchema>) => {
    try {
      await updateMultipleSettings.mutateAsync(values)
      setSuccess("Pengaturan tiket berhasil disimpan")
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error("Error saving ticket settings:", error)
    }
  }

  // Submit SLA settings
  const onSLASubmit = async (values: z.infer<typeof slaSettingsSchema>) => {
    try {
      await updateMultipleSettings.mutateAsync(values)
      setSuccess("Pengaturan SLA berhasil disimpan")
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error("Error saving SLA settings:", error)
    }
  }

  // Submit notification settings
  const onNotificationSubmit = async (values: z.infer<typeof notificationSettingsSchema>) => {
    try {
      await updateMultipleSettings.mutateAsync(values)
      setSuccess("Pengaturan notifikasi berhasil disimpan")
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error("Error saving notification settings:", error)
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-4">
      {success && (
        <Alert variant="success" className="bg-green-50 text-green-800 border-green-200">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">Umum</TabsTrigger>
          <TabsTrigger value="tickets">Tiket</TabsTrigger>
          <TabsTrigger value="sla">SLA</TabsTrigger>
          <TabsTrigger value="notifications">Notifikasi</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Umum</CardTitle>
              <CardDescription>Konfigurasi pengaturan umum sistem Service Desk FIK.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...generalForm}>
                <form id="generalForm" onSubmit={generalForm.handleSubmit(onGeneralSubmit)} className="space-y-4">
                  <FormField
                    control={generalForm.control}
                    name="siteName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Situs</FormLabel>
                        <FormControl>
                          <Input placeholder="Nama situs" {...field} />
                        </FormControl>
                        <FormDescription>Nama yang akan ditampilkan di judul halaman dan header.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={generalForm.control}
                    name="siteDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deskripsi Situs</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Deskripsi situs" {...field} />
                        </FormControl>
                        <FormDescription>Deskripsi singkat tentang sistem Service Desk FIK.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={generalForm.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Kontak</FormLabel>
                        <FormControl>
                          <Input placeholder="Email kontak" type="email" {...field} />
                        </FormControl>
                        <FormDescription>Email yang akan digunakan untuk kontak dan notifikasi.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={generalForm.control}
                    name="maxAttachmentSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ukuran Maksimal Lampiran (MB)</FormLabel>
                        <FormControl>
                          <Input placeholder="Ukuran maksimal lampiran" type="number" {...field} />
                        </FormControl>
                        <FormDescription>Ukuran maksimal file lampiran dalam MB.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={generalForm.control}
                    name="allowRegistration"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Izinkan Pendaftaran</FormLabel>
                          <FormDescription>
                            Izinkan pengguna untuk mendaftar sendiri ke sistem Service Desk FIK.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
            <CardFooter>
              <Button type="submit" form="generalForm" disabled={updateMultipleSettings.isPending}>
                {updateMultipleSettings.isPending ? "Menyimpan..." : "Simpan Pengaturan"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="tickets">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Tiket</CardTitle>
              <CardDescription>Konfigurasi pengaturan tiket dan alur kerja.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...ticketForm}>
                <form id="ticketForm" onSubmit={ticketForm.handleSubmit(onTicketSubmit)} className="space-y-4">
                  <FormField
                    control={ticketForm.control}
                    name="defaultPriority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prioritas Default</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih prioritas default" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Prioritas default untuk tiket baru.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={ticketForm.control}
                    name="ticketPrefix"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prefix Tiket</FormLabel>
                        <FormControl>
                          <Input placeholder="Prefix tiket" {...field} />
                        </FormControl>
                        <FormDescription>Prefix yang akan digunakan untuk nomor tiket (contoh: FIK-1234).</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={ticketForm.control}
                    name="autoAssignTickets"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Auto-assign Tiket</FormLabel>
                          <FormDescription>
                            Secara otomatis menetapkan tiket baru ke staf yang tersedia.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={ticketForm.control}
                    name="requireApproval"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Memerlukan Persetujuan</FormLabel>
                          <FormDescription>
                            Tiket memerlukan persetujuan sebelum dapat diselesaikan.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={ticketForm.control}
                    name="allowAnonymousTickets"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Izinkan Tiket Anonim</FormLabel>
                          <FormDescription>
                            Izinkan pembuatan tiket tanpa login (tidak direkomendasikan).
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
            <CardFooter>
              <Button type="submit" form="ticketForm" disabled={updateMultipleSettings.isPending}>
                {updateMultipleSettings.isPending ? "Menyimpan..." : "Simpan Pengaturan"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="sla">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan SLA</CardTitle>
              <CardDescription>Konfigurasi Service Level Agreement (SLA) untuk tiket.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...slaForm}>
                <form id="slaForm" onSubmit={slaForm.handleSubmit(onSLASubmit)} className="space-y-4">
                  <FormField
                    control={slaForm.control}
                    name="enableSLA"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Aktifkan SLA</FormLabel>
                          <FormDescription>
                            Aktifkan pelacakan dan penegakan Service Level Agreement.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={slaForm.control}
                      name="lowPrioritySLA"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SLA Prioritas Rendah (jam)</FormLabel>
                          <FormControl>
                            <Input placeholder="SLA prioritas rendah" type="number" {...field} />
                          </FormControl>
                          <FormDescription>Waktu penyelesaian untuk tiket prioritas rendah (jam).</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={slaForm.control}
                      name="mediumPrioritySLA"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SLA Prioritas Sedang (jam)</FormLabel>
                          <FormControl>
                            <Input placeholder="SLA prioritas sedang" type="number" {...field} />
                          </FormControl>
                          <FormDescription>Waktu penyelesaian untuk tiket prioritas sedang (jam).</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={slaForm.control}
                      name="highPrioritySLA"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SLA Prioritas Tinggi (jam)</FormLabel>
                          <FormControl>
                            <Input placeholder="SLA prioritas tinggi" type="number" {...field} />
                          </FormControl>
                          <FormDescription>Waktu penyelesaian untuk tiket prioritas tinggi (jam).</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={slaForm.control}
                      name="urgentPrioritySLA"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SLA Prioritas Urgent (jam)</FormLabel>
                          <FormControl>
                            <Input placeholder="SLA prioritas urgent" type="number" {...field} />
                          </FormControl>
                          <FormDescription>Waktu penyelesaian untuk tiket prioritas urgent (jam).</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={slaForm.control}
                    name="sendSLANotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Kirim Notifikasi SLA</FormLabel>
                          <FormDescription>
                            Kirim notifikasi saat tiket mendekati atau melewati batas waktu SLA.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
            <CardFooter>
              <Button type="submit" form="slaForm" disabled={updateMultipleSettings.isPending}>
                {updateMultipleSettings.isPending ? "Menyimpan..." : "Simpan Pengaturan"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Notifikasi</CardTitle>
              <CardDescription>Konfigurasi notifikasi email dan in-app.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form id="notificationForm" onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={notificationForm.control}
                      name="emailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Notifikasi Email</FormLabel>
                            <FormDescription>
                              Aktifkan notifikasi melalui email.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={notificationForm.control}
                      name="inAppNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Notifikasi In-App</FormLabel>
                            <FormDescription>
                              Aktifkan notifikasi dalam aplikasi.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={notificationForm.control}
                    name="digestFrequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frekuensi Digest</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih frekuensi digest" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="never">Tidak Pernah</SelectItem>
                            <SelectItem value="daily">Harian</SelectItem>
                            <SelectItem value="weekly">Mingguan</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Frekuensi pengiriman email digest ringkasan.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Jenis Notifikasi</h3>

                    <FormField
                      control={notificationForm.control}
                      name="notifyOnNewTicket"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Tiket Baru</FormLabel>
                            <FormDescription className="text-xs">
                              Notifikasi saat tiket baru dibuat.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={notificationForm.control}
                      name="notifyOnTicketUpdate"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Update Tiket</FormLabel>
                            <FormDescription className="text-xs">
                              Notifikasi saat tiket diperbarui.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={notificationForm.control}
                      name="notifyOnTicketAssignment"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Penugasan Tiket</FormLabel>
                            <FormDescription className="text-xs">
                              Notifikasi saat tiket ditugaskan.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={notificationForm.control}
                      name="notifyOnSLABreach"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Pelanggaran SLA</FormLabel>
                            <FormDescription className="text-xs">
                              Notifikasi saat tiket mendekati atau melewati batas waktu SLA.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </form>
              </Form>
            </CardContent>
            <CardFooter>
              <Button type="submit" form="notificationForm" disabled={updateMultipleSettings.isPending}>
                {updateMultipleSettings.isPending ? "Menyimpan..." : "Simpan Pengaturan"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
