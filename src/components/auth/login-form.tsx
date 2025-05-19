"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { AtSign, Lock, Loader2, Eye, EyeOff, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/hooks/use-auth"
import React from "react"

export function LoginForm() {
  const router = useRouter()
  const { login, isLoading, error } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Use the actual login function from the useAuth hook
      const success = await login({
        email: formData.email,
        password: formData.password,
      })

      // If remember me is checked, store in localStorage
      if (success && formData.rememberMe) {
        localStorage.setItem("rememberedEmail", formData.email)
      } else if (!formData.rememberMe) {
        localStorage.removeItem("rememberedEmail")
      }
      
      // No need to manually redirect - the login function handles this
    } catch (error) {
      console.error("Login failed", error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, rememberMe: checked }))
  }

  // Load remembered email on component mount
  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail")
    if (rememberedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: rememberedEmail,
        rememberMe: true,
      }))
    }
  }, [])

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <AtSign className="h-4 w-4" />
          </div>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="nama@upnvj.ac.id"
            value={formData.email}
            onChange={handleChange}
            className="pl-10"
            required
            autoComplete="email"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Button variant="link" size="sm" className="h-auto p-0 text-xs" asChild>
            <a href="/forgot-password">Lupa password?</a>
          </Button>
        </div>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Lock className="h-4 w-4" />
          </div>
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            className="pl-10 pr-10"
            required
            autoComplete="current-password"
            disabled={isLoading}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            onClick={togglePasswordVisibility}
            aria-label={showPassword ? "Hide password" : "Show password"}
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox 
          id="remember" 
          checked={formData.rememberMe} 
          onCheckedChange={handleCheckboxChange}
          disabled={isLoading}
        />
        <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
          Ingat saya
        </Label>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Memproses...
          </>
        ) : (
          "Masuk"
        )}
      </Button>
    </form>
  )
}