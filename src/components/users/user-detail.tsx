"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User } from "@prisma/client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getUserById } from "@/lib/action/user.action";
import { UserDetailHeader } from "./user-detail-header";
import { UserProfileCard } from "./user-profile-card";
import { UserInfoCard } from "./user-info-card";

// Tipe untuk user dengan data _count
export type UserWithCounts = User & {
  _count: {
    createdTickets: number;
    assignedTickets: number;
  };
};

export function UserDetail({ userId }: { userId: string }) {
  const [user, setUser] = useState<UserWithCounts | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getUserById(userId);
      setUser(userData as UserWithCounts);
      setIsLoading(false);
    };
    fetchUser();
  }, [userId]);

  if (isLoading) return <LoadingSpinner />;
  if (!user)
    return <div>Pengguna tidak ditemukan atau Anda tidak punya hak akses.</div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <UserDetailHeader user={user} />
      <div className="grid gap-6 items-start md:grid-cols-3">
        <UserProfileCard user={user} />
        <UserInfoCard user={user} />
      </div>
    </motion.div>
  );
}
