import { PageTitle } from "@/components/ui/page-title";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tiket Ditugaskan - Service Desk FIK",
  description: "Kelola tiket yang ditugaskan kepada Anda di Service Desk FIK",
};

export default function AssignedTicketsPage() {
  return (
    <div className="space-y-6">
      <PageTitle
        title="Tiket Ditugaskan"
        description="Lihat dan kelola tiket yang ditugaskan kepada Anda."
      />
    </div>
  );
}
