import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, FileText, Building, Eye, Plus, DollarSign, Search, Filter, 
  CheckCircle, Clock, X, AlertTriangle, BarChart, FileCheck, FileQuestion, 
  FileX, ArrowRight, Loader2
} from 'lucide-react';
import { mockProposals, mockTenders, getCurrentUser, Proposal } from '@/lib/mockData';

interface MyProposalsProps {
  onCreateProposal: () => void;
  onViewProposal: (proposalId: string) => void;
}

export function MyProposals({ onCreateProposal, onViewProposal }: MyProposalsProps) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const user = getCurrentUser();
  const itemsPerPage = 6;

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    submitted: 0,
    accepted: 0,
    rejected: 0
  });

  useEffect(() => {
    const loadProposals = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Get user's proposals
        const userProposals = mockProposals.filter(proposal => proposal.submittedBy === user?.id);
        setProposals(userProposals);
        
        // Calculate statistics
        setStats({
          total: userProposals.length,
          draft: userProposals.filter(p => p.status === 'draft').length,
          submitted: userProposals.filter(p => p.status === 'submitted').length,
          accepted: userProposals.filter(p => p.status === 'accepted').length,
          rejected: userProposals.filter(p => p.status === 'rejected').length
        });
      } catch (error) {
        toast({
          title: "Error loading proposals",
          description: "Could not load your proposals",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadProposals();
  }, [user, toast]);

  // Filter proposals based on search and status
  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = 
      proposal.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      proposal.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter;
    
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
      case 'submitted': return 'pending';
      case 'draft': return 'outline';
      case 'accepted': return 'success';
      case 'rejected': return 'destructive';
      default: return 'default';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <Clock className="w-4 h-4" />;
      case 'draft': return <FileQuestion className="w-4 h-4" />;
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <X className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Get tender name by ID
  const getTenderName = (tenderId: string) => {
    const tender = mockTenders.find(t => t.id === tenderId);
    return tender?.name || 'Unknown Tender';
  };

  // Calculate match statistics for a proposal
  const getMatchStats = (proposal: Proposal) => {
    const totalItems = proposal.items.length;
    const matchedItems = proposal.items.filter(item => item.matchedTenderId).length;
    const matchPercentage = totalItems > 0 
      ? Math.round((matchedItems / totalItems) * 100) 
      : 0;
    
    return {
      totalItems,
      matchedItems,
      matchPercentage
    };
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Proposals</h1>
          <p className="text-muted-foreground">
            Manage and track all your tender proposals
          </p>
        </div>
        {/* <Button onClick={onCreateProposal} className="shadow-soft">
          <Plus className="w-4 h-4 mr-2" />
          Create Proposal
        </Button> */}
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search proposals..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            className="pl-8"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select 
            value={statusFilter} 
            onValueChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1); // Reset to first page on filter change
            }}
          >
            <SelectTrigger className="w-[180px]">
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

      {/* Proposals List */}
      <div className="space-y-4">
        {paginatedProposals.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paginatedProposals.map((proposal) => {
              const matchStats = getMatchStats(proposal);
              const tender = mockTenders.find(t => t.id === proposal.tenderIds);
              
              return (
                <Card key={proposal.id} className="shadow-soft hover:shadow-medium transition-all duration-300">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{proposal.name}</CardTitle>
                      <Badge variant={getStatusVariant(proposal.status)} className="flex items-center space-x-1">
                        {getStatusIcon(proposal.status)}
                        <span>{proposal.status}</span>
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">{proposal.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pb-2 space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <FileText className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">For: {getTenderName(proposal.tenderIds)}</span>
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
                      <span>Submitted: {new Date(proposal.submittedAt).toLocaleDateString()}</span>
                    </div>

                    <div className="bg-muted/30 p-2 rounded-md">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Match Status:</span>
                        <span className={matchStats.matchPercentage >= 80 ? 'text-green-600' : 'text-amber-600'}>
                          {matchStats.matchedItems}/{matchStats.totalItems} items matched ({matchStats.matchPercentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full ${matchStats.matchPercentage >= 80 ? 'bg-green-500' : 'bg-amber-500'}`}
                          style={{ width: `${matchStats.matchPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-2">
                    <div className="flex space-x-2 w-full">
                      <Button 
                        onClick={() => onViewProposal(proposal.id)}
                        className="flex-1"
                        variant="outline"
                        size="sm"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
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
                {searchTerm || statusFilter !== 'all' 
                  ? "Try adjusting your search or filters"
                  : "Start by creating a new proposal"}
              </p>
              {(searchTerm || statusFilter !== 'all') && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
              // Show ellipsis for large page counts
              if (
                totalPages > 7 &&
                page !== 1 &&
                page !== totalPages &&
                page !== currentPage &&
                page !== currentPage - 1 &&
                page !== currentPage + 1 &&
                page !== (currentPage > 4 ? 2 : currentPage + 2) &&
                page !== (currentPage < totalPages - 3 ? totalPages - 1 : currentPage - 2)
              ) {
                if (
                  page === currentPage - 2 ||
                  page === currentPage + 2 ||
                  (currentPage <= 3 && page === 4) ||
                  (currentPage >= totalPages - 2 && page === totalPages - 3)
                ) {
                  return (
                    <Button key={page} variant="outline" size="sm" disabled>
                      ...
                    </Button>
                  );
                }
                return null;
              }
              
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              );
            })}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Available Tenders Section */}
      <div className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold">Available Tenders for Proposals</h2>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockTenders
            .filter(tender => 
              tender.visibility === 'public' && 
              tender.status === 'published' &&
              new Date(tender.deadline) > new Date()
            )
            .slice(0, 3) // Show only 3 available tenders
            .map((tender) => {
              const hasProposal = proposals.some(p => p.tenderIds === tender.id);
              const daysLeft = Math.ceil((new Date(tender.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              
              return (
                <Card key={tender.id} className="shadow-soft hover:shadow-medium transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-lg">{tender.name}</CardTitle>
                    <CardDescription>{tender.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pb-2">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Deadline: {new Date(tender.deadline).toLocaleDateString()}
                        {daysLeft <= 7 && (
                          <Badge variant={daysLeft <= 3 ? "destructive" : "warning"} className="ml-2">
                            {daysLeft} days left
                          </Badge>
                        )}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <FileText className="w-4 h-4" />
                      <span>{tender.items.length} items required</span>
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    {hasProposal ? (
                      <div className="w-full flex items-center justify-between">
                        <Badge variant="success" className="flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Proposal Submitted
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            const proposal = proposals.find(p => p.tenderIds === tender.id);
                            if (proposal) onViewProposal(proposal.id);
                          }}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          View
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        onClick={onCreateProposal}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Submit Proposal
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
        </div>
        
        {mockTenders.filter(tender => 
          tender.visibility === 'public' && 
          tender.status === 'published' &&
          new Date(tender.deadline) > new Date()
        ).length > 3 && (
          <div className="flex justify-center mt-4">
            <Button variant="outline" className="flex items-center">
              View All Available Tenders
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
