"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useSession } from "@/context/SessionContext";

interface AuthGuardProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { user, isLoading } = useSession();
  const userRole = user?.role;
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      router.push("/login");
    } else if (
      !isLoading &&
      allowedRoles &&
      !allowedRoles.includes(userRole || "")
    ) {
      router.push("/dashboard");
    }
  }, [isLoading, router, allowedRoles, userRole]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(userRole || "")) {
    return null;
  }

  return <>{children}</>;
}
