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
  Lock,
  Globe,
  Search,
  Filter,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  MoreHorizontal,
  FileText,
  TrendingUp,
  AlertTriangle,
  X,
  Building2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MyTendersProps {
  onCreateTender: () => void;
  onViewTender: (tenderId: string) => void;
  onEditTender: (tenderId: string) => void;
  onDeleteTender: (tenderId: string) => void;
}

export function MyTenders({
  onCreateTender,
  onViewTender,
  onEditTender,
  onDeleteTender,
}: MyTendersProps) {
  const user = getCurrentUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

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

  const myTenders = useMemo(() => {
    let tenders = mockTenders.filter((tender) => tender.createdBy === user?.id);

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

  const totalPages = Math.ceil(myTenders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTenders = myTenders.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
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

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "published":
        return "default";
      case "draft":
        return "secondary";
      case "closed":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "published":
        return <CheckCircle className="w-4 h-4" />;
      case "draft":
        return <Clock className="w-4 h-4" />;
      case "closed":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const stats = {
    total: myTenders.length,
    published: myTenders.filter((t) => t.status === "published").length,
    draft: myTenders.filter((t) => t.status === "draft").length,
    closed: myTenders.filter((t) => t.status === "closed").length,
    expiringSoon: myTenders.filter(
      (t) => isDeadlineNear(t.deadline) && t.status === "published"
    ).length,
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Tenders</h1>
          <p className="text-gray-600 mt-1">
            Manage and track your tender publications
          </p>
        </div>
        <div className="flex items-center gap-6 text-sm text-gray-500">
          <span className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border">
            <Globe className="w-4 h-4 text-blue-500" />
            {myTenders.filter((t) => t.visibility === "public").length} Public
          </span>
          <span className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border">
            <Building2 className="w-4 h-4 text-green-500" />
            {myTenders.length} Total
          </span>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5 mb-8">
        <Card className="shadow-soft">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <div className="rounded-full bg-primary/10 p-3 mb-2">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <div className="rounded-full bg-green-100 p-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground">Published</p>
            <p className="text-2xl font-bold">{stats.published}</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <div className="rounded-full bg-yellow-100 p-3 mb-2">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-xs text-muted-foreground">Draft</p>
            <p className="text-2xl font-bold">{stats.draft}</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <div className="rounded-full bg-gray-100 p-3 mb-2">
              <XCircle className="w-5 h-5 text-gray-600" />
            </div>
            <p className="text-xs text-muted-foreground">Closed</p>
            <p className="text-2xl font-bold">{stats.closed}</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <div className="rounded-full bg-orange-100 p-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-xs text-muted-foreground">Expiring Soon</p>
            <p className="text-2xl font-bold">{stats.expiringSoon}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="p-6 mb-8 bg-white border border-gray-200 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search tenders by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white h-11"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white h-11">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="expiring">Expiring Soon</SelectItem>
              </SelectContent>
            </Select>
            {(searchQuery || statusFilter !== "all") && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="border-gray-300 hover:bg-gray-50 text-gray-700 h-11"
              >
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Results Summary & Items Per Page */}

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
                  deadlinePassed
                    ? "bg-red-500"
                    : deadlineNear
                    ? "bg-yellow-500"
                    : tender.status === "published"
                    ? "bg-green-500"
                    : "bg-gray-300"
                }`}
              />
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    {tender.visibility === "public" ? (
                      <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                    ) : (
                      <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                    <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-1">
                      {tender.name}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={getStatusVariant(tender.status)}
                      className="flex items-center gap-1 shrink-0"
                    >
                      {getStatusIcon(tender.status)}
                      {tender.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onViewTender(tender.id)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onEditTender(tender.id)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Tender
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDeleteTender(tender.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <CardDescription className="line-clamp-2 mt-2">
                  {tender.description}
                </CardDescription>
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
                    <span>{tender.items.length} items</span>
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    <span>
                      Created {new Date(tender.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => onViewTender(tender.id)}
                    className="flex-1"
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button
                    onClick={() => onEditTender(tender.id)}
                    variant="outline"
                    size="sm"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {myTenders.length === 0 && (
        <Card className="text-center py-16">
          <CardContent className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery || statusFilter !== "all"
                  ? "No tenders match your filters"
                  : "No tenders created yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search criteria or filters"
                  : "Create your first tender to get started with the procurement process"}
              </p>
            </div>
            <div className="flex gap-2 justify-center">
              {(searchQuery || statusFilter !== "all") && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
              <Button onClick={onCreateTender}>
                <Plus className="w-4 h-4 mr-2" />
                Create New Tender
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <Card className="p-4 bg-gradient-to-r from-background to-muted/20 mt-7">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            {/* Page Statistics */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>
                  Page{" "}
                  <span className="font-medium text-foreground">
                    {currentPage}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-foreground">
                    {totalPages}
                  </span>
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-muted-foreground">
                <span>•</span>
                <span>{myTenders.length} total tenders</span>
              </div>
              <div className="hidden md:flex items-center gap-2 text-muted-foreground">
                <span>•</span>
                <span>{stats.published} published</span>
              </div>
            </div>

            {/* Main Pagination Controls */}
            <div className="flex items-center gap-2">
              {/* First Page */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="h-9 w-9 p-0 hover:bg-primary hover:text-primary-foreground transition-colors"
                title="First page"
              >
                ««
              </Button>

              {/* Previous Page */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-9 w-9 p-0 hover:bg-primary hover:text-primary-foreground transition-colors"
                title="Previous page"
              >
                ‹
              </Button>

              {/* Page Numbers with Smart Display */}
              <div className="flex items-center gap-1 mx-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => {
                    // Show first, last, current, and adjacent pages
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 2 && page <= currentPage + 2)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className={`h-9 w-9 p-0 transition-all duration-200 ${
                            currentPage === page
                              ? "bg-primary text-primary-foreground shadow-md scale-105"
                              : "hover:bg-primary hover:text-primary-foreground"
                          }`}
                        >
                          {page}
                        </Button>
                      );
                    }

                    // Show ellipsis for gaps
                    if (page === currentPage - 3 || page === currentPage + 3) {
                      return (
                        <span
                          key={page}
                          className="px-2 text-muted-foreground font-medium"
                        >
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
                className="h-9 w-9 p-0 hover:bg-primary hover:text-primary-foreground transition-colors"
                title="Next page"
              >
                ›
              </Button>

              {/* Last Page */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="h-9 w-9 p-0 hover:bg-primary hover:text-primary-foreground transition-colors"
                title="Last page"
              >
                »»
              </Button>
            </div>

            {/* Quick Navigation */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  Jump to:
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
                  className="w-16 h-9 text-center border-2 focus:border-primary transition-colors"
                  placeholder="#"
                />
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
