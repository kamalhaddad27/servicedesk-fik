"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSession } from "@/context/SessionContext";

const createFilterUrl = (
  searchParams: URLSearchParams,
  name: string,
  value: string
) => {
  const params = new URLSearchParams(searchParams.toString());
  params.set("page", "1");
  if (value) {
    params.set(name, value);
  } else {
    params.delete(name);
  }
  return `/tickets?${params.toString()}`;
};

export function TicketQuickFilters() {
  const { user } = useSession();
  const searchParams = useSearchParams();
  const currentAssignment = searchParams.get("assignment");

  if (!user || user.role === "dosen" || user.role === "mahasiswa") return null; // Filter ini hanya untuk admin/staf

  const filters = [
    { label: "Semua", value: "" },
    ...(user.role === "staff" ? [{ label: "Tugas Saya", value: "me" }] : []),
    ...(user.role === "admin"
      ? [{ label: "Belum Ditugaskan", value: "unassigned" }]
      : []),
  ];

  return (
    <div className="flex items-center gap-2 border-b pb-2">
      {filters.map((filter) => (
        <Button
          key={filter.value}
          variant={
            currentAssignment === filter.value ||
            (!currentAssignment && !filter.value)
              ? "default"
              : "ghost"
          }
          size="sm"
          asChild
        >
          <Link
            href={createFilterUrl(searchParams, "assignment", filter.value)}
          >
            {filter.label}
          </Link>
        </Button>
      ))}
    </div>
  );
}
