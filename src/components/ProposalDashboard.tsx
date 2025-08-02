import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockProposals, mockTenders, getCurrentUser } from '@/lib/mockData';
import { Calendar, FileText, Building, Eye, Plus, DollarSign } from 'lucide-react';

interface ProposalDashboardProps {
  onCreateProposal: () => void;
  onViewProposal: (proposalId: string) => void;
}

export function ProposalDashboard({ onCreateProposal, onViewProposal }: ProposalDashboardProps) {
  const user = getCurrentUser();
  
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'submitted': return 'success';
      case 'draft': return 'pending';
      case 'accepted': return 'completed';
      case 'rejected': return 'destructive';
      default: return 'default';
    }
  };

  // Get user's proposals
  const userProposals = mockProposals.filter(proposal => proposal.submittedBy === user?.id);

  // Get available public tenders for new proposals
  const availableTenders = mockTenders.filter(tender => 
    tender.visibility === 'public' && 
    tender.status === 'published' &&
    new Date(tender.deadline) > new Date()
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Proposals</h1>
          <p className="text-muted-foreground">
            Submit and track your tender proposals
          </p>
        </div>
        <Button onClick={onCreateProposal} className="shadow-soft">
          <Plus className="w-4 h-4 mr-2" />
          Create Proposal
        </Button>
      </div>

      {/* User's Proposals */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">My Submitted Proposals</h2>
        {userProposals.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {userProposals.map((proposal) => {
              const tender = mockTenders.find(t => t.id === proposal.tenderIds);
              return (
                <Card key={proposal.id} className="shadow-soft hover:shadow-medium transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{proposal.name}</CardTitle>
                      <Badge variant={getStatusVariant(proposal.status)}>
                        {proposal.status}
                      </Badge>
                    </div>
                    <CardDescription>{proposal.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <FileText className="w-4 h-4" />
                      <span>For: {tender?.name}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Building className="w-4 h-4" />
                      <span>{proposal.company}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <DollarSign className="w-4 h-4" />
                      <span>Total: ${proposal.totalCost.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Submitted: {new Date(proposal.submittedAt).toLocaleDateString()}</span>
                    </div>

                    <Button 
                      onClick={() => onViewProposal(proposal.id)}
                      className="w-full"
                      variant="outline"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-8">
            <CardContent>
              <h3 className="text-lg font-semibold mb-2">No proposals yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by submitting a proposal to an available tender
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Available Tenders */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Available Public Tenders</h2>
        {availableTenders.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableTenders.map((tender) => {
              const hasProposal = userProposals.some(p => p.tenderIds === tender.id);
              return (
                <Card key={tender.id} className="shadow-soft hover:shadow-medium transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-lg">{tender.name}</CardTitle>
                    <CardDescription>{tender.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Deadline: {new Date(tender.deadline).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <FileText className="w-4 h-4" />
                      <span>{tender.items.length} items required</span>
                    </div>

                    {hasProposal ? (
                      <div className="text-center py-2">
                        <Badge variant="success">Already Submitted</Badge>
                      </div>
                    ) : (
                      <Button 
                        onClick={onCreateProposal}
                        className="w-full"
                      >
                        Submit Proposal
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-8">
            <CardContent>
              <h3 className="text-lg font-semibold mb-2">No available tenders</h3>
              <p className="text-muted-foreground">
                Check back later for new tender opportunities
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}