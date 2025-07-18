"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserWithCounts } from "./user-detail";
import { getRoleBadgeColor } from "@/lib/utils";
import {
  Mail,
  Building,
  Briefcase,
  School,
  GraduationCap,
  Calendar,
} from "lucide-react";
import { UserTicketsTab } from "./user-tickets-tab";

interface UserProfileCardProps {
  user: UserWithCounts;
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{user.name}</CardTitle>
            <CardDescription>
              {user.nim
                ? `NIM: ${user.nim}`
                : user.nip
                ? `NIP: ${user.nip}`
                : "ID Pengguna"}
            </CardDescription>
          </div>
          <Badge className={getRoleBadgeColor(user.role)}>{user.role}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="tickets">Tiket</TabsTrigger>
          </TabsList>

          {/* Tab Konten Profil */}
          <TabsContent value="profile" className="mt-4 space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium mb-2">Informasi Kontak</h3>
                <div className="flex items-center text-sm">
                  <Mail className="mr-2 h-4 min-w-4 w-4 text-muted-foreground" />
                  <span>{user.email}</span>
                </div>
              </div>

              {user.role !== "mahasiswa" && (
                <div>
                  <h3 className="text-sm font-medium mb-2">
                    Departemen & Jabatan
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{user.department || "-"}</span>
                    </div>
                    {user.position && (
                      <div className="flex items-center text-sm">
                        <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{user.position}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {user.role === "mahasiswa" && (
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium mb-2">
                    Informasi Akademik
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <School className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{user.major || "-"}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <GraduationCap className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{user.college || "-"}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>Angkatan {user.academicYear || "-"}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Placeholder untuk Tab lainnya */}
          <TabsContent value="tickets">
            <UserTicketsTab userId={user.id} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
