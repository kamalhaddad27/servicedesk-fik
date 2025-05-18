"use client"

import { useParams } from "next/navigation"
import { UserDetail } from "@/components/users/user-detail"

export default function UserDetailPage() {
  const params = useParams()
  const userId = Number(params.id)

  return <UserDetail userId={userId} />
}
