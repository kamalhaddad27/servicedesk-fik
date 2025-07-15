"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { useUsers } from "@/hooks/use-users";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  PlusCircle,
  Search,
  Filter,
  AlertCircle,
  User,
  Mail,
  Building,
  Briefcase,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserForm } from "./user-form";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

export function UserList() {
  const { users, isLoading, isError, error, filters, updateFilters } =
    useUsers();
  const [searchTerm, setSearchTerm] = useState(filters.search);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Update search filter when debounced search term changes
  useEffect(() => {
    updateFilters({ search: debouncedSearchTerm });
  }, [debouncedSearchTerm, updateFilters]);

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    const roleColors: Record<string, string> = {
      mahasiswa: "bg-blue-100 text-blue-800",
      dosen: "bg-green-100 text-green-800",
      admin: "bg-purple-100 text-purple-800",
      executive: "bg-amber-100 text-amber-800",
    };
    return roleColors[role] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <div className="text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-lg font-medium">Gagal memuat data</h3>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat memuat data pengguna."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full items-center gap-2 md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari pengguna..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="shrink-0">
            <Filter className="h-4 w-4" />
            <span className="sr-only">Filter</span>
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={filters.role}
            onValueChange={(value) => updateFilters({ role: value })}
          >
            <SelectTrigger className="h-9 w-[130px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Role</SelectItem>
              <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
              <SelectItem value="dosen">Dosen</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="executive">Executive</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.department}
            onValueChange={(value) => updateFilters({ department: value })}
          >
            <SelectTrigger className="h-9 w-[150px]">
              <SelectValue placeholder="Departemen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Departemen</SelectItem>
              <SelectItem value="informatika">Informatika</SelectItem>
              <SelectItem value="sistem_informasi">Sistem Informasi</SelectItem>
              <SelectItem value="teknik_komputer">Teknik Komputer</SelectItem>
              <SelectItem value="akademik">Akademik</SelectItem>
              <SelectItem value="keuangan">Keuangan</SelectItem>
            </SelectContent>
          </Select>

          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Tambah Pengguna
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Tambah Pengguna Baru</DialogTitle>
                <DialogDescription>
                  Isi formulir berikut untuk menambahkan pengguna baru.
                </DialogDescription>
              </DialogHeader>
              <UserForm onSuccess={() => setIsCreateDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {users.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="rounded-full bg-muted p-3">
              <User className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-medium">Tidak ada pengguna</h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Tidak ada pengguna yang sesuai dengan filter yang dipilih.
            </p>
            <Button
              className="mt-4"
              onClick={() => {
                updateFilters({ role: "all", department: "all", search: "" });
                setSearchTerm("");
              }}
            >
              Reset Filter
            </Button>
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
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/users/${user.id}`}
                      className="hover:underline"
                    >
                      <CardTitle className="text-base">{user.name}</CardTitle>
                    </Link>
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {user.role}
                    </Badge>
                  </div>
                  <CardDescription>
                    {user.nim
                      ? `NIM: ${user.nim}`
                      : user.nip
                      ? `NIP: ${user.nip}`
                      : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="grid gap-2 text-sm md:grid-cols-2">
                    <div className="flex items-center">
                      <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{user.department}</span>
                    </div>
                    {user.position && (
                      <div className="flex items-center">
                        <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{user.position}</span>
                      </div>
                    )}
                    {user.programStudi && (
                      <div className="flex items-center">
                        <span className="text-muted-foreground">
                          Program Studi:
                        </span>
                        <span className="ml-2">{user.programStudi}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-end pt-0">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/users/${user.id}`}>Lihat Detail</Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
