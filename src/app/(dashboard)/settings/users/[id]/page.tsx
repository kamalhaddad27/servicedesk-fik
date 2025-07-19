"use client";

import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { UserDetail } from "@/components/users/user-detail";
import { useParams } from "next/navigation";

export default function UserDetailPage() {
  const params = useParams();
  const userId = Array.isArray(params.id) ? params.id[0] : params.id;

  if (!userId) {
    return <LoadingSpinner />;
  }

  return <UserDetail userId={userId} />;
}
