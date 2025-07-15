import { MahasiswaDashboard } from "@/components/dashboard/mahasiswa-dashboard";
import { DosenDashboard } from "@/components/dashboard/dosen-dashboard";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { getProfile } from "@/lib/action/user.action";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getProfile();

  // if (!user) {
  //   redirect("/login");
  // }

  const userRole = user?.role;

  // Render dashboard based on user role
  return (
    <div className="space-y-6">
      {userRole === "user" && <MahasiswaDashboard />}
      {userRole === "staff" && <DosenDashboard />}
      {userRole === "admin" && <AdminDashboard />}
    </div>
  );
}
