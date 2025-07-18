"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { getRoleBadgeColor } from "@/lib/utils";
import { User } from "lucide-react";
import { UserWithCounts } from "./user-detail";

interface UserInfoCardProps {
  user: UserWithCounts;
}

export function UserInfoCard({ user }: UserInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Informasi Pengguna
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <User className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="mt-2 text-lg font-medium">{user.name}</h3>
          <Badge className={`mt-1 ${getRoleBadgeColor(user.role)}`}>
            {user.role}
          </Badge>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-medium text-muted-foreground">
            ID Pengguna
          </h3>
          <span className="text-sm">{user.id.slice(-10).toUpperCase()}</span>
        </div>
        <div>
          <h3 className="text-xs font-medium text-muted-foreground">
            Aktivitas Tiket
          </h3>
          <div className="mt-1 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Tiket Dibuat</span>
              <span className="font-semibold">
                {user._count.createdTickets}
              </span>
            </div>
            {(user.role === "staff" || user.role === "admin") && (
              <div className="flex items-center justify-between">
                <span>Tiket Ditangani</span>
                <span className="font-semibold">
                  {user._count.assignedTickets}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" asChild>
          <a href={`mailto:${user.email}`}>Kirim Email</a>
        </Button>
      </CardFooter>
    </Card>
  );
}
