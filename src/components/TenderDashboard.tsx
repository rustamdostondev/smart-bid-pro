import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';
import { mockTenders, getCurrentUser } from '@/lib/mockData';
import { Calendar, Eye, Users, Lock, Globe, Search, Filter, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';

interface TenderDashboardProps {
  onCreateTender: () => void;
  onViewTender: (tenderId: string) => void;
}

export function TenderDashboard({ onCreateTender, onViewTender }: TenderDashboardProps) {
  const user = getCurrentUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'published': return 'default';
      case 'draft': return 'secondary';
      case 'closed': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <CheckCircle className="w-4 h-4" />;
      case 'draft': return <Clock className="w-4 h-4" />;
      case 'closed': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    return visibility === 'public' ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />;
  };

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

  const filteredAndSearchedTenders = useMemo(() => {
    let tenders = mockTenders.filter(tender => {
      // Visibility filter
      if (tender.visibility === 'public') return true;
      if (tender.createdBy === user?.id) return true;
      if (tender.invitedUsers?.includes(user?.id || '')) return true;
      return false;
    });

    // Search filter
    if (searchQuery) {
      tenders = tenders.filter(tender => 
        tender.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tender.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      tenders = tenders.filter(tender => tender.status === statusFilter);
    }

    // Visibility filter
    if (visibilityFilter !== 'all') {
      tenders = tenders.filter(tender => tender.visibility === visibilityFilter);
    }

    return tenders;
  }, [searchQuery, statusFilter, visibilityFilter, user?.id]);

  const totalPages = Math.ceil(filteredAndSearchedTenders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTenders = filteredAndSearchedTenders.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setVisibilityFilter('all');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tender Dashboard</h1>
          <p className="text-muted-foreground">
            Manage and track all tender opportunities
          </p>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              {filteredAndSearchedTenders.filter(t => t.status === 'published').length} Published
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              {filteredAndSearchedTenders.filter(t => t.status === 'draft').length} Draft
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              {filteredAndSearchedTenders.filter(t => t.status === 'closed').length} Closed
            </span>
          </div>
        </div>
        <Button onClick={onCreateTender} className="shadow-lg hover:shadow-xl transition-shadow">
          <Plus className="w-4 h-4 mr-2" />
          Create New Tender
        </Button>
      </div>

      {/* Search and Filter Section */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search tenders by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
            {(searchQuery || statusFilter !== 'all' || visibilityFilter !== 'all') && (
              <Button variant="outline" onClick={clearFilters}>
                <Filter className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredAndSearchedTenders.length)} of {filteredAndSearchedTenders.length} tenders
        </p>
        {filteredAndSearchedTenders.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
        )}
      </div>

      {/* Tender Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {paginatedTenders.map((tender) => {
          const deadlineNear = isDeadlineNear(tender.deadline);
          const deadlinePassed = isDeadlinePassed(tender.deadline);
          
          return (
            <Card key={tender.id} className={`group hover:shadow-lg transition-all duration-300 border-l-4 ${
              deadlinePassed ? 'border-l-red-500' : 
              deadlineNear ? 'border-l-yellow-500' : 
              tender.status === 'published' ? 'border-l-green-500' : 'border-l-gray-300'
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2 flex-1">
                    {getVisibilityIcon(tender.visibility)}
                    <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-1">
                      {tender.name}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusVariant(tender.status)} className="flex items-center gap-1">
                      {getStatusIcon(tender.status)}
                      {tender.status}
                    </Badge>
                  </div>
                </div>
                <CardDescription className="line-clamp-2 mt-2">
                  {tender.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className={`flex items-center space-x-2 text-sm ${
                    deadlinePassed ? 'text-red-600' : 
                    deadlineNear ? 'text-yellow-600' : 'text-muted-foreground'
                  }`}>
                    <Calendar className="w-4 h-4" />
                    <span>
                      Deadline: {new Date(tender.deadline).toLocaleDateString()}
                      {deadlineNear && !deadlinePassed && ' (Soon)'}
                      {deadlinePassed && ' (Expired)'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{tender.items.length} items</span>
                  </div>

                  {tender.visibility === 'private' && (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Lock className="w-4 h-4" />
                      <span>Private tender</span>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <Button 
                    onClick={() => onViewTender(tender.id)}
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    variant="outline"
                    disabled={deadlinePassed && tender.status !== 'draft'}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {deadlinePassed && tender.status !== 'draft' ? 'View (Expired)' : 'View Details'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredAndSearchedTenders.length === 0 && (
        <Card className="text-center py-16">
          <CardContent className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery || statusFilter !== 'all' || visibilityFilter !== 'all' 
                  ? 'No tenders match your filters' 
                  : 'No tenders available'
                }
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== 'all' || visibilityFilter !== 'all'
                  ? 'Try adjusting your search criteria or filters'
                  : 'Get started by creating your first tender'
                }
              </p>
            </div>
            <div className="flex gap-2 justify-center">
              {(searchQuery || statusFilter !== 'all' || visibilityFilter !== 'all') && (
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                  className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                if (totalPages <= 7) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => handlePageChange(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                
                if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => handlePageChange(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                
                if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                
                return null;
              })}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                  className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}