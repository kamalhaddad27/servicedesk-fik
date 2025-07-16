import { UserDashboard } from "@/components/dashboard/UserDashboard";
import { StaffDashboard } from "@/components/dashboard/StaffDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { getProfile } from "@/lib/action/user.action";
import { redirect } from "next/navigation";
import { getDashboardAdminStats } from "@/lib/action/dashboardAdmin.action";

export default async function DashboardPage() {
  const user = await getProfile();

  if (!user) {
    redirect("/login");
  }

  const userRole = user?.role;
  let stats;
  if (userRole === "admin") {
    stats = await getDashboardAdminStats();
  }

  // Render dashboard based on user role
  return (
    <div className="space-y-6">
      {userRole === "user" && <UserDashboard />}
      {userRole === "staff" && <StaffDashboard />}
      {userRole === "admin" && stats && <AdminDashboard stats={stats} />}
    </div>
  );
}
