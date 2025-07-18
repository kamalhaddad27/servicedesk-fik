"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { UserIcon, Award } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "@prisma/client";
import { getProfile } from "@/lib/action/user.action";
import TabProfile from "@/components/profile/tab-profile";
import TabKeamanan from "@/components/profile/tab-keamanan";

export default function ProfilePage() {
  const [dataUser, setDataUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getProfile();
      setDataUser(user);
    };
    fetchUser();
  }, [setDataUser]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Profil Pengguna</h1>
        <p className="text-muted-foreground">
          Lihat dan kelola informasi profil Anda
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="w-auto justify-start overflow-auto py-2 mb-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            <span>Profil</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            <span>Keamanan</span>
          </TabsTrigger>
        </TabsList>

        <TabProfile dataUser={dataUser} />

        <TabKeamanan />
      </Tabs>
    </div>
  );
}
