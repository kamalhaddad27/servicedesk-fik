import { LoginForm } from "@/components/auth/login-form"
import type { Metadata } from "next"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Login - Service Desk FIK",
  description: "Login ke Service Desk FIK",
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4 md:p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Image src="/logo-upnvj.png" width={80} height={80} alt="Logo UPNVJ" className="h-20 w-20" />
          <h1 className="text-3xl font-bold tracking-tight">Service Desk FIK</h1>
          <p className="text-sm text-muted-foreground">Sistem Layanan Terpadu Fakultas Ilmu Komputer</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
