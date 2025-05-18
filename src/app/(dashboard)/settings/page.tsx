import { PageTitle } from "@/components/ui/page-title"
import { SettingsForm } from "@/components/settings/settings-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pengaturan - Service Desk FIK",
  description: "Konfigurasi pengaturan sistem Service Desk FIK",
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageTitle title="Pengaturan" description="Konfigurasi pengaturan sistem Service Desk FIK." />
      <SettingsForm />
    </div>
  )
}
