// User Types
export type UserRole = "mahasiswa" | "dosen" | "admin" | "executive"

export interface User {
  id: number
  name: string
  email: string
  nim?: string
  nip?: string
  role: UserRole
  department: string
  position?: string
  programStudi?: string
  fakultas?: string
  angkatan?: string
  status?: string
}

export interface AuthResponse {
  access_token: string
  user: User
}

// Ticket Types
export type TicketStatus = "pending" | "disposisi" | "in-progress" | "completed" | "cancelled"
export type TicketPriority = "low" | "medium" | "high" | "urgent"
export type SLAStatus = "on-time" | "at-risk" | "breached"

export interface Ticket {
  id: number
  ticketNumber: string
  subject: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  category: string
  subcategory?: string
  type?: string
  department?: string
  progress: number
  createdAt: string
  updatedAt?: string
  createdBy?: number
  assignedTo?: number
  currentHandler?: number
  slaStatus?: SLAStatus
  slaDeadline?: string
  attachments?: Attachment[]
  creator?: User
  handler?: User
}

export interface Attachment {
  id: number
  ticketId: number
  messageId?: number
  fileName: string
  fileSize: number
  fileType: string
  fileUrl: string
  createdAt: string
}

export interface TicketMessage {
  id: number
  ticketId: number
  userId: number
  message: string
  messageType: "comment" | "status_update" | "internal_note"
  isInternal: boolean
  createdAt: string
  attachments?: Attachment[]
  sender?: User
}

export interface DisposisiPayload {
  ticketId: number
  toUserId: number
  reason: string
  notes?: string
  updateProgress?: number
  actionType: "forward" | "escalate" | "return"
}

export interface DisposisiHistory {
  id: number
  ticketId: number
  fromUserId: number
  toUserId: number
  reason: string
  notes?: string
  progressUpdate?: number
  actionType: "forward" | "escalate" | "return"
  expectedCompletionTime?: string
  slaImpact?: "maintained" | "improved" | "extended"
  createdAt: string
  fromUser?: User
  toUser?: User
}

export interface TicketStats {
  total: number
  byStatus: { status: TicketStatus; count: number }[]
  byPriority: { priority: TicketPriority; count: number }[]
  byCategory: { category: string; count: number }[]
}

// Notification Types
export interface Notification {
  id: number
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
  relatedId?: number
  relatedType?: string
}

// Pagination Types
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Settings Types
export interface TicketCategories {
  [key: string]: {
    name: string
    subcategories: string[]
  }
}

// Performance Types
export interface UserPerformance {
  totalTickets: number
  completedTickets: number
  avgResolutionTime: number
  avgFirstResponseTime: number
  slaBreaches: number
  customerSatisfaction: number
  reopenedTickets: number
}

// Dashboard Types
export interface ExecutiveDashboardData {
  overallMetrics: {
    totalTickets: number
    openTickets: number
    averageResolutionTime: number
    slaBreachRate: number
    customerSatisfactionAvg: number
  }
  departmentPerformance: {
    department: string
    ticketCount: number
    avgResolutionTime: number
    slaBreachCount: number
    satisfaction: number
  }[]
  categoryBreakdown: {
    category: string
    subcategory: string
    count: number
    avgProgress: number
  }[]
  userPerformance: {
    userId: number
    userName: string
    role: UserRole
    ticketsHandled: number
    avgResolutionTime: number
    satisfaction: number
  }[]
  disposisiFlow: {
    fromRole: UserRole
    toRole: UserRole
    fromUserId: number
    toUserId: number
    count: number
  }[]
  trendsOverTime: {
    dates: string[]
    newTickets: number[]
    resolvedTickets: number[]
  }
}

// Form Types
export interface LoginFormValues {
  email?: string
  nim?: string
  password: string
}

export interface TicketFormValues {
  subject: string
  description: string
  category: string
  subcategory?: string
  type?: string
  department?: string
  priority: TicketPriority
  attachments?: File[]
}

export interface MessageFormValues {
  message: string
  isInternal?: boolean
  attachments?: File[]
}

export interface UserFormValues {
  name: string
  email: string
  password?: string
  nim?: string
  nip?: string
  role: UserRole
  department: string
  position?: string
}
