import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  FileText,
  Building,
  Eye,
  Plus,
  DollarSign,
  Search,
  Filter,
  CheckCircle,
  Clock,
  X,
  AlertTriangle,
  BarChart,
  FileCheck,
  FileQuestion,
  FileX,
  ArrowRight,
  Loader2,
  MoreHorizontal,
  Edit,
  Trash2,
  MoreVertical,
  Tag,
} from "lucide-react";
import {
  mockProposals,
  mockTenders,
  getCurrentUser,
  Proposal,
} from "@/lib/mockData";

interface MyProposalsProps {
  onCreateProposal: () => void;
  onViewProposal: (proposalId: string) => void;
  onEditProposal?: (proposalId: string) => void;
  onDeleteProposal?: (proposalId: string) => void;
}

export function MyProposals({
  onCreateProposal,
  onViewProposal,
  onEditProposal,
  onDeleteProposal,
}: MyProposalsProps) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Handle page change with smooth scrolling
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Smooth scroll to top of proposals section
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const { toast } = useToast();
  const user = getCurrentUser();
  const itemsPerPage = 6;

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    submitted: 0,
    accepted: 0,
    rejected: 0,
  });

  useEffect(() => {
    const loadProposals = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Get user's proposals
        const userProposals = mockProposals.filter(
          (proposal) => proposal.submittedBy === user?.id
        );
        setProposals(userProposals);

        // Calculate statistics
        setStats({
          total: userProposals.length,
          draft: userProposals.filter((p) => p.status === "draft").length,
          submitted: userProposals.filter((p) => p.status === "submitted")
            .length,
          accepted: userProposals.filter((p) => p.status === "accepted").length,
          rejected: userProposals.filter((p) => p.status === "rejected").length,
        });
      } catch (error) {
        toast({
          title: "Error loading proposals",
          description: "Could not load your proposals",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProposals();
  }, [user, toast]);

  // Filter proposals based on search and status
  const filteredProposals = proposals.filter((proposal) => {
    const matchesSearch =
      proposal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || proposal.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProposals.length / itemsPerPage);
  const paginatedProposals = filteredProposals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "submitted":
        return "pending";
      case "draft":
        return "outline";
      case "accepted":
        return "success";
      case "rejected":
        return "destructive";
      default:
        return "default";
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "submitted":
        return <Clock className="w-4 h-4" />;
      case "draft":
        return <FileQuestion className="w-4 h-4" />;
      case "accepted":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <X className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  // Get tender name by ID
  const getTenderName = (tenderId: string) => {
    const tender = mockTenders.find((t) => t.id === tenderId);
    return tender?.name || "Unknown Tender";
  };

  // Calculate match statistics for a proposal
  const getMatchStats = (proposal: Proposal) => {
    const totalItems = proposal.items.length;
    const matchedItems = proposal.items.filter(
      (item) => item.matchedTenderId
    ).length;
    const matchPercentage =
      totalItems > 0 ? Math.round((matchedItems / totalItems) * 100) : 0;

    return {
      totalItems,
      matchedItems,
      matchPercentage,
    };
  };

  // Handle proposal deletion
  const handleDeleteProposal = async (proposalId: string) => {
    try {
      // Show confirmation dialog
      const confirmed = window.confirm(
        "Are you sure you want to delete this proposal? This action cannot be undone."
      );
      if (!confirmed) return;

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Remove from mock data
      const proposalIndex = mockProposals.findIndex((p) => p.id === proposalId);
      if (proposalIndex !== -1) {
        mockProposals.splice(proposalIndex, 1);
      }

      // Update local state
      const updatedProposals = proposals.filter((p) => p.id !== proposalId);
      setProposals(updatedProposals);

      // Update statistics
      setStats({
        total: updatedProposals.length,
        draft: updatedProposals.filter((p) => p.status === "draft").length,
        submitted: updatedProposals.filter((p) => p.status === "submitted")
          .length,
        accepted: updatedProposals.filter((p) => p.status === "accepted")
          .length,
        rejected: updatedProposals.filter((p) => p.status === "rejected")
          .length,
      });

      toast({
        title: "Proposal deleted",
        description: "The proposal has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error deleting proposal",
        description: "Could not delete the proposal. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle proposal editing (placeholder - would navigate to edit form)
  const handleEditProposal = (proposalId: string) => {
    // In a real app, this would navigate to an edit form or open a modal
    toast({
      title: "Edit Proposal",
      description: `Opening edit form for proposal ${proposalId}`,
    });
    console.log("Edit proposal:", proposalId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your proposals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Proposals</h1>
          <p className="text-gray-600 mt-1">
            Manage and track all your tender proposals
          </p>
        </div>
        {/* <Button onClick={onCreateProposal} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all">
          <Plus className="w-4 h-4 mr-2" />
          Create Proposal
        </Button> */}
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
            <div className="rounded-full bg-yellow-100 p-3 mb-2">
              <FileQuestion className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-xs text-muted-foreground">Draft</p>
            <p className="text-2xl font-bold">{stats.draft}</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <div className="rounded-full bg-blue-100 p-3 mb-2">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-xs text-muted-foreground">Submitted</p>
            <p className="text-2xl font-bold">{stats.submitted}</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <div className="rounded-full bg-green-100 p-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground">Accepted</p>
            <p className="text-2xl font-bold">{stats.accepted}</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <div className="rounded-full bg-red-100 p-3 mb-2">
              <X className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-xs text-muted-foreground">Rejected</p>
            <p className="text-2xl font-bold">{stats.rejected}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search proposals by name or description..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
                className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1); // Reset to first page on filter change
              }}
            >
              <SelectTrigger className="w-[180px] border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Proposals List */}
      <div className="space-y-4">
        {paginatedProposals.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedProposals.map((proposal) => {
              const tender = mockTenders.find(t => proposal.tenderIds.includes(t.id));
              const tenderIdShort = tender?.id ? `T-${tender.id.slice(-9)}` : 'T-000000000';
              
              return (
                <Card
                  key={proposal.id}
                  className="shadow-soft hover:shadow-medium transition-all duration-300 relative overflow-hidden"
                >
                  {/* Status indicator */}
                  <div
                    className={`absolute top-0 left-0 w-full h-1 ${
                      proposal.status === "draft"
                        ? "bg-yellow-500"
                        : proposal.status === "submitted"
                        ? "bg-blue-500"
                        : proposal.status === "accepted"
                        ? "bg-green-500"
                        : proposal.status === "rejected"
                        ? "bg-red-500"
                        : "bg-gray-300"
                    }`}
                  />
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg flex-1 min-w-0">
                        {proposal.name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={getStatusVariant(proposal.status)}
                          className="text-xs"
                        >
                          {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => onViewProposal(proposal.id)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditProposal(proposal.id)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Proposal
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteProposal(proposal.id)}
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
                      {proposal.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pb-2 space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Tag className="w-4 h-4 flex-shrink-0" />
                      <span>{tenderIdShort} (Tender ID)</span>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <FileText className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">
                        For: {getTenderName(proposal.tenderIds)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Building className="w-4 h-4 flex-shrink-0" />
                      <span>{proposal.company}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <DollarSign className="w-4 h-4 flex-shrink-0" />
                      <span>Total: ${proposal.totalCost.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>
                        Submitted:{" "}
                        {new Date(proposal.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-2">
                    <div className="flex gap-2 w-full">
                      <Button
                        onClick={() => onViewProposal(proposal.id)}
                        className="flex w-full"
                        variant="outline"
                        size="sm"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-8">
            <CardContent>
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-amber-500 opacity-80" />
              <h3 className="text-lg font-semibold mb-2">No proposals found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Start by creating a new proposal"}
              </p>
              {(searchTerm || statusFilter !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setCurrentPage(1);
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Clean Pagination */}
      {totalPages > 1 && filteredProposals.length > 0 && (
        <div className="flex flex-col items-center gap-4 mt-8">
          {/* Page Statistics */}
          <div className="text-sm text-muted-foreground text-center">
            Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredProposals.length)} of {filteredProposals.length} proposals • Page {currentPage} of {totalPages}
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center gap-1">
            {/* First Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">First page</span>
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
              <span className="sr-only">Previous page</span>
              ‹
            </Button>

            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Show first page, last page, current page, and adjacent pages
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
                      currentPage === page ? "bg-blue-600 text-white hover:bg-blue-700" : ""
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
            })}

            {/* Next Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">Next page</span>
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
              <span className="sr-only">Last page</span>
              »»
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
