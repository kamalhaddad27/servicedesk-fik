import { UserDashboard } from "@/components/dashboard/UserDashboard";
import { StaffDashboard } from "@/components/dashboard/StaffDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { getProfile } from "@/lib/action/user.action";
import { redirect } from "next/navigation";
import {
  getAdminDashboardStats,
  getStaffDashboardStats,
  getUserDashboardStats,
} from "@/lib/action/dashboard.action";

export default async function DashboardPage() {
  const user = await getProfile();
  if (!user) redirect("/login");

  let adminStats, staffStats, userStats;
  if (user.role === "admin") {
    adminStats = await getAdminDashboardStats();
  } else if (user.role === "staff") {
    staffStats = await getStaffDashboardStats();
  } else if (user.role === "dosen" || user.role === "mahasiswa") {
    userStats = await getUserDashboardStats();
  }

  // Render dashboard based on user role
  return (
    <div className="space-y-6">
      {(user.role === "mahasiswa" || user.role === "dosen") && userStats && (
        <UserDashboard stats={userStats} />
      )}
      {user.role === "staff" && staffStats && (
        <StaffDashboard stats={staffStats} />
      )}
      {user.role === "admin" && adminStats && (
        <AdminDashboard stats={adminStats} />
      )}
    </div>
  );
}
