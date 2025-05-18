"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { ApiService } from "@/lib/api"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { PerformanceChart } from "./performance-chart"
import { AlertCircle, Download, BarChart3, PieChart, LineChart, Users } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { ExecutiveDashboardData } from "@/types"

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
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

export function ReportsDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [dateRange, setDateRange] = useState<{ dateFrom?: string; dateTo?: string }>({})
  const [department, setDepartment] = useState<string>("all")
  const [exportFormat, setExportFormat] = useState<string>("excel")

  // Fetch executive dashboard data
  const {
    data: dashboardData,
    isLoading,
    isError,
  } = useQuery<ExecutiveDashboardData>({
    queryKey: ["executiveDashboard", dateRange, department],
    queryFn: () => ApiService.getExecutiveDashboard({ ...dateRange, department }),
  })

  // Handle export
  const handleExport = async () => {
    try {
      await ApiService.exportTickets({
        format: exportFormat as "csv" | "json" | "excel",
        dateFrom: dateRange.dateFrom,
        dateTo: dateRange.dateTo,
        status: "",
        category: "",
      })
    } catch (error) {
      console.error("Error exporting tickets:", error)
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Gagal memuat data laporan. Silakan coba lagi nanti.</AlertDescription>
      </Alert>
    )
  }

  const { overallMetrics, departmentPerformance, categoryBreakdown, userPerformance, trendsOverTime } = dashboardData

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Laporan & Analitik</h1>
          <p className="text-sm text-muted-foreground">Analisis kinerja Service Desk FIK dan lihat tren tiket.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DatePicker
            placeholder="Dari Tanggal"
            onChange={(date) => setDateRange((prev) => ({ ...prev, dateFrom: date?.toISOString() }))}
          />
          <DatePicker
            placeholder="Sampai Tanggal"
            onChange={(date) => setDateRange((prev) => ({ ...prev, dateTo: date?.toISOString() }))}
          />
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Departemen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Departemen</SelectItem>
              <SelectItem value="informatika">Informatika</SelectItem>
              <SelectItem value="sistem_informasi">Sistem Informasi</SelectItem>
              <SelectItem value="teknik_komputer">Teknik Komputer</SelectItem>
              <SelectItem value="akademik">Akademik</SelectItem>
              <SelectItem value="keuangan">Keuangan</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <BarChart3 className="mr-2 h-4 w-4" />
            Ikhtisar
          </TabsTrigger>
          <TabsTrigger value="performance">
            <LineChart className="mr-2 h-4 w-4" />
            Kinerja
          </TabsTrigger>
          <TabsTrigger value="categories">
            <PieChart className="mr-2 h-4 w-4" />
            Kategori
          </TabsTrigger>
          <TabsTrigger value="staff">
            <Users className="mr-2 h-4 w-4" />
            Staf
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Tiket</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overallMetrics.totalTickets}</div>
                <p className="text-xs text-muted-foreground">Total tiket dalam periode yang dipilih</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tiket Terbuka</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overallMetrics.openTickets}</div>
                <p className="text-xs text-muted-foreground">Tiket yang masih dalam proses</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Waktu Penyelesaian</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overallMetrics.averageResolutionTime.toFixed(1)} jam</div>
                <p className="text-xs text-muted-foreground">Rata-rata waktu penyelesaian tiket</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">SLA Breach Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(overallMetrics.slaBreachRate * 100).toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Persentase tiket yang melewati SLA</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Tren Tiket</CardTitle>
                <CardDescription>Jumlah tiket baru dan diselesaikan dalam periode yang dipilih</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <PerformanceChart
                  data={{
                    labels: trendsOverTime.dates,
                    datasets: [
                      {
                        label: "Tiket Baru",
                        data: trendsOverTime.newTickets,
                        borderColor: "#3b82f6",
                        backgroundColor: "rgba(59, 130, 246, 0.1)",
                      },
                      {
                        label: "Tiket Diselesaikan",
                        data: trendsOverTime.resolvedTickets,
                        borderColor: "#10b981",
                        backgroundColor: "rgba(16, 185, 129, 0.1)",
                      },
                    ],
                  }}
                  type="line"
                />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-6 grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Kinerja Departemen</CardTitle>
                <CardDescription>Perbandingan kinerja antar departemen</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <PerformanceChart
                  data={{
                    labels: departmentPerformance.map((dept) => dept.department),
                    datasets: [
                      {
                        label: "Jumlah Tiket",
                        data: departmentPerformance.map((dept) => dept.ticketCount),
                        backgroundColor: [
                          "rgba(59, 130, 246, 0.6)",
                          "rgba(16, 185, 129, 0.6)",
                          "rgba(249, 115, 22, 0.6)",
                          "rgba(139, 92, 246, 0.6)",
                          "rgba(236, 72, 153, 0.6)",
                        ],
                      },
                    ],
                  }}
                  type="bar"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribusi Kategori</CardTitle>
                <CardDescription>Distribusi tiket berdasarkan kategori</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <PerformanceChart
                  data={{
                    labels: categoryBreakdown.map((cat) => cat.category),
                    datasets: [
                      {
                        label: "Jumlah Tiket",
                        data: categoryBreakdown.map((cat) => cat.count),
                        backgroundColor: [
                          "rgba(59, 130, 246, 0.6)",
                          "rgba(16, 185, 129, 0.6)",
                          "rgba(249, 115, 22, 0.6)",
                          "rgba(139, 92, 246, 0.6)",
                          "rgba(236, 72, 153, 0.6)",
                        ],
                        borderWidth: 1,
                      },
                    ],
                  }}
                  type="pie"
                />
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Kinerja Penyelesaian Tiket</CardTitle>
                <CardDescription>Waktu penyelesaian tiket berdasarkan prioritas</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <PerformanceChart
                  data={{
                    labels: ["Low", "Medium", "High", "Urgent"],
                    datasets: [
                      {
                        label: "Waktu Penyelesaian (jam)",
                        data: [48, 24, 12, 4],
                        backgroundColor: [
                          "rgba(16, 185, 129, 0.6)",
                          "rgba(59, 130, 246, 0.6)",
                          "rgba(249, 115, 22, 0.6)",
                          "rgba(239, 68, 68, 0.6)",
                        ],
                      },
                    ],
                  }}
                  type="bar"
                />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-6 grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>SLA Compliance</CardTitle>
                <CardDescription>Kepatuhan terhadap Service Level Agreement</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <PerformanceChart
                  data={{
                    labels: ["On Time", "At Risk", "Breached"],
                    datasets: [
                      {
                        label: "Jumlah Tiket",
                        data: [
                          overallMetrics.totalTickets - Math.round(overallMetrics.totalTickets * overallMetrics.slaBreachRate) - Math.round(overallMetrics.totalTickets * 0.1),
                          Math.round(overallMetrics.totalTickets * 0.1),
                          Math.round(overallMetrics.totalTickets * overallMetrics.slaBreachRate),
                        ],
                        backgroundColor: [
                          "rgba(16, 185, 129, 0.6)",
                          "rgba(249, 115, 22, 0.6)",
                          "rgba(239, 68, 68, 0.6)",
                        ],
                      },
                    ],
                  }}
                  type="doughnut"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tren Waktu Penyelesaian</CardTitle>
                <CardDescription>Rata-rata waktu penyelesaian tiket per minggu</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <PerformanceChart
                  data={{
                    labels: ["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4"],
                    datasets: [
                      {
                        label: "Waktu Penyelesaian (jam)",
                        data: [
                          overallMetrics.averageResolutionTime * 1.2,
                          overallMetrics.averageResolutionTime * 0.9,
                          overallMetrics.averageResolutionTime * 1.1,
                          overallMetrics.averageResolutionTime,
                        ],
                        borderColor: "#3b82f6",
                        backgroundColor: "rgba(59, 130, 246, 0.1)",
                        tension: 0.4,
                      },
                    ],
                  }}
                  type="line"
                />
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Distribusi Kategori</CardTitle>
                <CardDescription>Distribusi tiket berdasarkan kategori dan subkategori</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <PerformanceChart
                  data={{
                    labels: categoryBreakdown.map((cat) => cat.category),
                    datasets: [
                      {
                        label: "Jumlah Tiket",
                        data: categoryBreakdown.map((cat) => cat.count),
                        backgroundColor: [
                          "rgba(59, 130, 246, 0.6)",
                          "rgba(16, 185, 129, 0.6)",
                          "rgba(249, 115, 22, 0.6)",
                          "rgba(139, 92, 246, 0.6)",
                          "rgba(236, 72, 153, 0.6)",
                        ],
                      },
                    ],
                  }}
                  type="bar"
                />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Detail Kategori</CardTitle>
                <CardDescription>Breakdown detail tiket berdasarkan kategori dan subkategori</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {categoryBreakdown.slice(0, 5).map((category, index) => (
                    <div key={index}>
                      <h3 className="text-base font-medium">{category.category}</h3>
                      <div className="mt-2 grid gap-4 md:grid-cols-2">
                        <div>
                          <h4 className="text-sm font-medium">Jumlah Tiket</h4>
                          <p className="text-2xl font-bold">{category.count}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Progress Rata-rata</h4>
                          <p className="text-2xl font-bold">{category.avgProgress.toFixed(0)}%</p>
                        </div>
                      </div>
                      {category.subcategory && (
                        <div className="mt-2">
                          <h4 className="text-sm font-medium">Subkategori</h4>
                          <p className="text-sm">{category.subcategory}</p>
                        </div>
                      )}
                      <div className="mt-4 h-1 w-full bg-muted">
                        <div
                          className="h-1 bg-primary"
                          style={{ width: `${(category.count / Math.max(...categoryBreakdown.map((c) => c.count))) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Lihat Semua Kategori
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="staff" className="mt-6">
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Kinerja Staf</CardTitle>
                <CardDescription>Performa staf berdasarkan jumlah tiket dan waktu penyelesaian</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {userPerformance.map((user) => (
                    <div key={user.userId} className="border-b pb-4 last:border-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-medium">{user.userName}</h3>
                          <p className="text-sm text-muted-foreground">{user.role}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{user.ticketsHandled} tiket</p>
                          <p className="text-sm text-muted-foreground">{user.avgResolutionTime.toFixed(1)} jam rata-rata</p>
                        </div>
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Tiket Ditangani</p>
                          <p className="text-sm font-medium">{user.ticketsHandled}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Waktu Penyelesaian</p>
                          <p className="text-sm font-medium">{user.avgResolutionTime.toFixed(1)} jam</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Kepuasan</p>
                          <p className="text-sm font-medium">{user.satisfaction.toFixed(1)}/5</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Lihat Detail Kinerja Staf
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
