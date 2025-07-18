import { PlusCircle, Search } from "lucide-react";
import React, { useState } from "react";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { RoleUser } from "@prisma/client";
import { useFilter } from "@/hooks/use-filter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { UserForm } from "./user-form";

const UserFilter = () => {
  const { searchParams, handleFilterChange, handleSearchChange } = useFilter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex w-full items-center gap-2 md:w-auto">
        <div className="relative flex-1 md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari pengguna..."
            className="pl-8"
            defaultValue={searchParams.get("query") || ""}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={searchParams.get("role") || "all"}
          onValueChange={(value) => handleFilterChange("role", value)}
        >
          <SelectTrigger className="h-9 w-auto">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Role</SelectItem>
            <SelectItem value={RoleUser.mahasiswa}>Mahasiswa</SelectItem>
            <SelectItem value={RoleUser.dosen}>Dosen</SelectItem>
            <SelectItem value={RoleUser.staff}>Staff</SelectItem>
            <SelectItem value={RoleUser.admin}>Admin</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get("department") || "all"}
          onValueChange={(value) => handleFilterChange("department", value)}
        >
          <SelectTrigger className="h-9 w-auto">
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

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
  );
};

export default UserFilter;
