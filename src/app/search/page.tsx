"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ApiService from "@/lib/api";
import { Ticket, User } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  formatDate,
  getTicketStatusColor,
  getTicketPriorityColor,
} from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  XCircle,
  UserCircle,
  ArrowLeft,
  Search as SearchIcon,
  Ticket as TicketIcon,
} from "lucide-react";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("tickets");

  // Search results
  const [ticketResults, setTicketResults] = useState<Ticket[]>([]);
  const [userResults, setUserResults] = useState<User[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Conduct search when the page loads with a query parameter
  useEffect(() => {
    if (queryParam) {
      setSearchQuery(queryParam);
      performSearch(queryParam);
    }
  }, [queryParam]);

  // Function to perform the search
  const performSearch = async (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      // Search tickets
      const ticketsResponse = await ApiService.getTicketsPaginated({
        search: query,
        limit: 50,
      });
      setTicketResults(ticketsResponse.data || []);

      // Search users
      const usersResponse = await ApiService.getUsers({
        search: query,
      });
      setUserResults(usersResponse || []);
    } catch (error) {
      console.error("Search error:", error);
      // Handle error - maybe show a message to the user
    } finally {
      setIsSearching(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  return (
    <div className="container max-w-6xl mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Hasil Pencarian</h1>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="flex gap-2 max-w-2xl">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari tiket, pengguna, atau dokumen..."
          className="flex-1"
        />
        <Button type="submit" disabled={isSearching}>
          {isSearching ? (
            <LoadingSpinner className="h-4 w-4 mr-2" />
          ) : (
            <SearchIcon className="h-4 w-4 mr-2" />
          )}
          Cari
        </Button>
      </form>

      {/* Tabs for different result types */}
      <Tabs
        defaultValue="tickets"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="tickets" className="flex gap-2">
            <TicketIcon className="h-4 w-4" />
            <span>Tiket ({ticketResults.length})</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex gap-2">
            <UserCircle className="h-4 w-4" />
            <span>Pengguna ({userResults.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* Loading state */}
        {isSearching && (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner className="h-8 w-8" />
          </div>
        )}

        {/* No results state */}
        {hasSearched &&
          !isSearching &&
          activeTab === "tickets" &&
          ticketResults.length === 0 && (
            <div className="text-center py-12">
              <XCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                Tidak ada tiket yang ditemukan
              </h2>
              <p className="text-muted-foreground">
                Coba gunakan kata kunci yang berbeda atau periksa filter
                pencarian Anda.
              </p>
            </div>
          )}

        {hasSearched &&
          !isSearching &&
          activeTab === "users" &&
          userResults.length === 0 && (
            <div className="text-center py-12">
              <XCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                Tidak ada pengguna yang ditemukan
              </h2>
              <p className="text-muted-foreground">
                Coba gunakan kata kunci yang berbeda atau periksa filter
                pencarian Anda.
              </p>
            </div>
          )}

        {/* Ticket Results */}
        <TabsContent value="tickets" className="pt-6">
          {!isSearching && ticketResults.length > 0 && (
            <div className="space-y-4">
              {ticketResults.map((ticket) => (
                <Card key={ticket.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/tickets/${ticket.id}`}
                        className="hover:underline"
                      >
                        <CardTitle className="text-base">
                          {ticket.subject}
                        </CardTitle>
                      </Link>
                      <div className="flex gap-2">
                        <Badge className={getTicketStatusColor(ticket.status)}>
                          {ticket.status}
                        </Badge>
                        <Badge
                          className={getTicketPriorityColor(ticket.priority)}
                        >
                          {ticket.priority}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription>
                      Tiket #{ticket.ticketNumber} • {ticket.category}
                      {ticket.subcategory && ` > ${ticket.subcategory}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {ticket.description}
                    </p>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between pt-0">
                    <p className="text-xs text-muted-foreground">
                      {ticket.creator?.name
                        ? `Dari: ${ticket.creator.name} • `
                        : ""}
                      {formatDate(ticket.createdAt, "dd MMM yyyy")}
                    </p>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/tickets/${ticket.id}`}>Lihat Detail</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* User Results */}
        <TabsContent value="users" className="pt-6">
          {!isSearching && userResults.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {userResults.map((user) => (
                <Card key={user.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base">{user.name}</CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                      </div>
                      <Badge
                        className={cn(
                          user.role === "user"
                            ? "bg-blue-100 text-blue-800"
                            : user.role === "staff"
                            ? "bg-green-100 text-green-800"
                            : user.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-amber-100 text-amber-800"
                        )}
                      >
                        {user.role}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 text-sm">
                      {user.department && (
                        <p className="flex justify-between">
                          <span className="text-muted-foreground">
                            Department:
                          </span>
                          <span>{user.department}</span>
                        </p>
                      )}
                      {user.nim && (
                        <p className="flex justify-between">
                          <span className="text-muted-foreground">NIM:</span>
                          <span>{user.nim}</span>
                        </p>
                      )}
                      {user.position && (
                        <p className="flex justify-between">
                          <span className="text-muted-foreground">
                            Jabatan:
                          </span>
                          <span>{user.position}</span>
                        </p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="w-full"
                    >
                      <Link href={`/users/${user.id}`}>Lihat Profil</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
