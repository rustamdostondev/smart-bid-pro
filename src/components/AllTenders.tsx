import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { mockTenders, getCurrentUser } from "@/lib/mockData";
import {
  Calendar,
  Eye,
  Users,
  Globe,
  Search,
  Filter,
  Building2,
} from "lucide-react";

interface AllTendersProps {
  onViewTender: (tenderId: string) => void;
}

export function AllTenders({ onViewTender }: AllTendersProps) {
  const user = getCurrentUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("published");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const isDeadlineNear = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  };

  const isDeadlinePassed = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    return deadlineDate < today;
  };

  const filteredTenders = useMemo(() => {
    let tenders = mockTenders.filter((tender) => {
      // Show only public tenders or private tenders user is invited to
      if (tender.visibility === "public") return true;
      if (tender.invitedUsers?.includes(user?.id || "")) return true;
      return false;
    });

    // Search filter
    if (searchQuery) {
      tenders = tenders.filter(
        (tender) =>
          tender.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tender.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      tenders = tenders.filter((tender) => tender.status === statusFilter);
    }

    return tenders;
  }, [searchQuery, statusFilter, user?.id]);

  const totalPages = Math.ceil(filteredTenders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTenders = filteredTenders.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("published");
    setCurrentPage(1);
  };

  // Reset to first page when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Available Tenders
            </h1>
            <p className="text-gray-600 mt-1">
              Browse and discover tender opportunities that match your
              expertise.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg border shadow-sm p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search tenders by name or description..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-11 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Select
              value={statusFilter}
              onValueChange={handleStatusFilterChange}
            >
              <SelectTrigger className="w-[160px] h-11 border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            {(searchQuery || statusFilter !== "published") && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="h-11 px-4"
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tender Grid */}
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {paginatedTenders.map((tender) => {
          const deadlineNear = isDeadlineNear(tender.deadline);
          const deadlinePassed = isDeadlinePassed(tender.deadline);

          return (
            <Card
              key={tender.id}
              className="group hover:shadow-lg transition-all duration-300 relative overflow-hidden"
            >
              {/* Status indicator */}
              <div
                className={`absolute top-0 left-0 w-full h-1 ${
                  tender.status === "closed"
                    ? "bg-red-500"
                    : tender.status === "draft"
                    ? "bg-yellow-500"
                    : tender.status === "published"
                    ? "bg-green-500"
                    : "bg-gray-300"
                }`}
              />

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-1">
                      {tender.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">
                      {tender.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div
                    className={`flex items-center text-sm ${
                      deadlinePassed
                        ? "text-red-600"
                        : deadlineNear
                        ? "text-yellow-600"
                        : "text-muted-foreground"
                    }`}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>
                      {new Date(tender.deadline).toLocaleDateString()}
                      {deadlineNear && !deadlinePassed && " (Soon)"}
                      {deadlinePassed && " (Expired)"}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{tender.items.length} proposals</span>
                  </div>
                  {tender.visibility === "public" && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Globe className="w-4 h-4 mr-2" />
                      <span>Public tender</span>
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => onViewTender(tender.id)}
                  className="w-full"
                  variant={deadlinePassed ? "outline" : "default"}
                  disabled={deadlinePassed && tender.status === "closed"}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {deadlinePassed && tender.status === "closed"
                    ? "View (Closed)"
                    : "View Details"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredTenders.length === 0 && (
        <Card className="text-center py-16">
          <CardContent className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery || statusFilter !== "published"
                  ? "No tenders match your criteria"
                  : "No tenders available"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== "published"
                  ? "Try adjusting your search or filters"
                  : "Check back later for new opportunities"}
              </p>
            </div>
            {(searchQuery || statusFilter !== "published") && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Enhanced Pagination */}
      {totalPages >= 1 && (
        <Card className="p-4 mt-7">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Page Info */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                Page <span className="font-medium">{currentPage}</span> of{" "}
                <span className="font-medium">{totalPages}</span>
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">
                {filteredTenders.length} total results
              </span>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              {/* First Page */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                ««
              </Button>

              {/* Previous Page */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                ‹
              </Button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => {
                    // Always show first page, last page, current page, and adjacent pages
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className={`h-8 w-8 p-0 ${
                            currentPage === page
                              ? "bg-primary text-primary-foreground"
                              : ""
                          }`}
                        >
                          {page}
                        </Button>
                      );
                    }

                    // Show ellipsis for gaps
                    if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <span key={page} className="px-2 text-muted-foreground">
                          …
                        </span>
                      );
                    }

                    return null;
                  }
                )}
              </div>

              {/* Next Page */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
              >
                ›
              </Button>

              {/* Last Page */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
              >
                »»
              </Button>
            </div>

            {/* Quick Jump */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                Go to:
              </span>
              <Input
                type="number"
                min={1}
                max={totalPages}
                value={currentPage}
                onChange={(e) => {
                  const page = Number(e.target.value);
                  if (page >= 1 && page <= totalPages) {
                    handlePageChange(page);
                  }
                }}
                className="w-16 h-8 text-center"
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
