"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { ApiService } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import { PageTitle } from "../ui/page-title"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Progress } from "@/components/ui/progress"
import { formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Clock, Users, Building, FileText, AlertCircle, TrendingUp, TrendingDown, Percent, Star } from 'lucide-react'
import type { ExecutiveDashboardData } from "../../types/index"

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

// Helper function untuk menangani nilai yang mungkin null/undefined
const safeNumber = (value: any, defaultValue = 0) => {
  return typeof value === 'number' ? value : defaultValue;
}

// Helper function untuk menggunakan toFixed dengan aman
const safeToFixed = (value: any, digits = 1, defaultValue = "0") => {
  return typeof value === 'number' ? value.toFixed(digits) : defaultValue;
}

export function ExecutiveDashboard() {
  const { user } = useAuth()
  const [dateRange, setDateRange] = useState<{ dateFrom?: string; dateTo?: string }>({})
  const [department, setDepartment] = useState<string>("")

  // Fetch executive dashboard data
  const {
    data: dashboardData,
    isLoading,
    isError,
  } = useQuery<ExecutiveDashboardData>({
    queryKey: ["executiveDashboard", dateRange, department],
    queryFn: () => ApiService.getExecutiveDashboard({ ...dateRange, department }),
  })

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (isError) {
    return (
      <div className="text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-lg font-medium">Gagal memuat data</h3>
        <p className="text-sm text-muted-foreground">Terjadi kesalahan saat memuat data dashboard.</p>
      </div>
    )
  }

  // Pastikan data tidak null/undefined dengan memberikan default values
  const { 
    overallMetrics = {
      totalTickets: 0,
      averageResolutionTime: 0,
      slaBreachRate: 0,
      customerSatisfactionAvg: 0
    }, 
    departmentPerformance = [], 
    categoryBreakdown = [], 
    userPerformance = [], 
    trendsOverTime = {
      dates: [],
      newTickets: [],
      resolvedTickets: []
    }
  } = dashboardData || {}

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <PageTitle
        title={`Selamat datang, ${user?.name || 'User'}!`}
        description="Pantau kinerja layanan dan analisis data Service Desk FIK."
      />

      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tiket</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeNumber(overallMetrics.totalTickets)}</div>
            <p className="text-xs text-muted-foreground">Total tiket dalam sistem</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Waktu Penyelesaian</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeToFixed(overallMetrics.averageResolutionTime)} jam</div>
            <p className="text-xs text-muted-foreground">Rata-rata waktu penyelesaian</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SLA Breach Rate</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeToFixed(safeNumber(overallMetrics.slaBreachRate) * 100)}%</div>
            <p className="text-xs text-muted-foreground">Persentase tiket yang melewati SLA</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kepuasan Pengguna</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeToFixed(overallMetrics.customerSatisfactionAvg)}/5</div>
            <p className="text-xs text-muted-foreground">Rata-rata kepuasan pengguna</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Tren Tiket</CardTitle>
            <CardDescription>Jumlah tiket baru dan diselesaikan dalam 30 hari terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              {/* Placeholder for chart - in a real implementation, you would use a chart library */}
              <div className="flex h-full flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="mr-2 h-3 w-3 rounded-full bg-blue-500"></span>
                    <span className="text-xs">Tiket Baru</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2 h-3 w-3 rounded-full bg-green-500"></span>
                    <span className="text-xs">Tiket Diselesaikan</span>
                  </div>
                </div>
                <div className="flex h-32 items-end justify-between">
                  {(trendsOverTime.dates || []).map((_, index) => {
                    const maxNewTickets = Math.max(...(trendsOverTime.newTickets || []), 1);
                    const maxResolvedTickets = Math.max(...(trendsOverTime.resolvedTickets || []), 1);
                    
                    return (
                      <div key={index} className="flex flex-col items-center">
                        <div
                          className="w-2 bg-blue-500"
                          style={{
                            height: `${((trendsOverTime.newTickets?.[index] || 0) / maxNewTickets) * 100}px`,
                          }}
                        ></div>
                        <div
                          className="mt-1 w-2 bg-green-500"
                          style={{
                            height: `${
                              ((trendsOverTime.resolvedTickets?.[index] || 0) / maxResolvedTickets) * 100
                            }px`,
                          }}
                        ></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Kinerja Departemen</CardTitle>
            <CardDescription>Perbandingan kinerja antar departemen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(departmentPerformance || []).map((dept) => {
                const maxTicketCount = Math.max(...(departmentPerformance || []).map(d => safeNumber(d.ticketCount)), 1);
                
                return (
                  <div key={dept.department} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs">{dept.department}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-xs">{safeNumber(dept.ticketCount)} tiket</span>
                        <span className="flex items-center text-xs">
                          {safeNumber(dept.avgResolutionTime) < safeNumber(overallMetrics.averageResolutionTime) ? (
                            <TrendingDown className="mr-1 h-3 w-3 text-green-500" />
                          ) : (
                            <TrendingUp className="mr-1 h-3 w-3 text-red-500" />
                          )}
                          {safeToFixed(dept.avgResolutionTime)} jam
                        </span>
                      </div>
                    </div>
                    <Progress
                      value={(safeNumber(dept.ticketCount) / maxTicketCount) * 100}
                      className="h-2"
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Kinerja Staf</CardTitle>
            <CardDescription>Performa staf berdasarkan jumlah tiket dan waktu penyelesaian</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(userPerformance || []).slice(0, 5).map((user) => (
                <div key={user.userId} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{user.userName}</p>
                    <p className="text-xs text-muted-foreground">{user.role}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-sm font-medium">{safeNumber(user.ticketsHandled)}</p>
                      <p className="text-xs text-muted-foreground">Tiket</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">{safeToFixed(user.avgResolutionTime)} jam</p>
                      <p className="text-xs text-muted-foreground">Rata-rata</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">{safeToFixed(user.satisfaction)}/5</p>
                      <p className="text-xs text-muted-foreground">Rating</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link href="/reports">Lihat Laporan Lengkap</Link>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Tabs defaultValue="category">
          <TabsList>
            <TabsTrigger value="category">Kategori</TabsTrigger>
            <TabsTrigger value="department">Departemen</TabsTrigger>
          </TabsList>
          <TabsContent value="category" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Breakdown Kategori</CardTitle>
                <CardDescription>Distribusi tiket berdasarkan kategori dan subkategori</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(categoryBreakdown || []).slice(0, 6).map((category, index) => {
                    const maxCount = Math.max(...(categoryBreakdown || []).map(c => safeNumber(c.count)), 1);
                    
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs">
                            {category.category} {category.subcategory ? `> ${category.subcategory}` : ""}
                          </span>
                          <span className="text-xs font-medium">{safeNumber(category.count)} tiket</span>
                        </div>
                        <Progress value={(safeNumber(category.count) / maxCount) * 100} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href="/reports">Lihat Detail Kategori</Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="department" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Kinerja Departemen</CardTitle>
                <CardDescription>Perbandingan kinerja antar departemen</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(departmentPerformance || []).map((dept) => (
                    <div key={dept.department} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{dept.department}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{safeNumber(dept.ticketCount)} tiket</span>
                            <span>•</span>
                            <span>{safeToFixed(dept.avgResolutionTime)} jam rata-rata</span>
                          </div>
                        </div>
                        <Badge
                          className={
                            safeNumber(dept.slaBreachCount) === 0
                              ? "bg-green-100 text-green-800"
                              : safeNumber(dept.slaBreachCount) < 3
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }
                        >
                          {safeNumber(dept.slaBreachCount)} SLA breach
                        </Badge>
                      </div>
                      <Progress
                        value={(safeNumber(dept.satisfaction) / 5) * 100}
                        className="h-2"
                      />
                      <p className="text-right text-xs text-muted-foreground">
                        Kepuasan: {safeToFixed(dept.satisfaction)}/5
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}