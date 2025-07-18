"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Mail, Building, Briefcase } from "lucide-react";
import { RoleUser, StaffDepartment, User } from "@prisma/client";
import { useSearchParams } from "next/navigation";
import { getUsers } from "@/lib/action/user.action";
import { PaginationControls } from "../ui/pagination";
import { getRoleBadgeColor } from "@/lib/utils";
import UserFilter from "./user-filter";

export function UserList() {
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState({
    totalPages: 0,
    totalItems: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Baca parameter dari URL
  const page = Number(searchParams.get("page")) || 1;
  const query = searchParams.get("query") || undefined;
  const role = (searchParams.get("role") as RoleUser) || undefined;
  const department =
    (searchParams.get("department") as StaffDepartment) || undefined;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const result = await getUsers({ page, query, role, department });
      if (result.data) {
        setUsers(result.data);
        setPagination({
          totalPages: result.totalPages,
          totalItems: result.totalItems,
        });
      }
      setIsLoading(false);
    };
    fetchData();
  }, [searchParams, page, query, role, department]);

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.05 } },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="space-y-6">
      <UserFilter />

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {users.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                Tidak ada pengguna ditemukan.
              </CardContent>
            </Card>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {users.map((user) => (
                <motion.div key={user.id} variants={itemVariants}>
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">{user.name}</CardTitle>
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {user.role}
                        </Badge>
                      </div>
                      {user.role === "dosen" && (
                        <CardDescription>NIP: {user.nip}</CardDescription>
                      )}
                      {user.role === "mahasiswa" && (
                        <CardDescription>NIM: {user.nim}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="grid gap-2 text-sm md:grid-cols-2">
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{user.email}</span>
                        </div>
                        {user.position && (
                          <div className="flex items-center">
                            <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{user.position}</span>
                          </div>
                        )}
                        {user.major && (
                          <div className="flex items-center">
                            <span className="text-muted-foreground">
                              Program Studi:
                            </span>
                            <span className="ml-2">{user.major}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        {user.department && (
                          <div className="flex items-center">
                            <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{user.department}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Link href={`/users/${user.id}`}>Lihat Detail</Link>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
          <PaginationControls
            currentPage={page}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            itemsOnPage={users.length}
          />
        </>
      )}
    </div>
  );
}
