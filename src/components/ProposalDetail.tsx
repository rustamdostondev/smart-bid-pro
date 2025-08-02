import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockProposals, mockTenders, getCurrentUser, type Proposal } from '@/lib/mockData';
import { ProposalOwnerDetail } from './ProposalOwnerDetail';
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Shield, 
  Brain,
  Package,
  Building,
  DollarSign,
  Download,
  Share2,
  Edit,
  Trash2,
  Eye,
  Settings,
  Zap,
  AlertTriangle,
  Target,
  TrendingUp,
  Award
} from 'lucide-react';

interface ProposalDetailProps {
  proposalId: string;
  onBack: () => void;
  onEdit?: (proposalId: string) => void;
  onDelete?: (proposalId: string) => void;
  previousPage?: string;
}

export function ProposalDetail({ proposalId, onBack, onEdit, onDelete, previousPage = 'proposals' }: ProposalDetailProps) {
  const user = getCurrentUser();
  const proposal = mockProposals.find(p => p.id === proposalId);
  const tender = proposal ? mockTenders.find(t => t.id === proposal.tenderIds) : null;
  
  if (!proposal) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Proposals
          </Button>
        </div>
        <Card className="text-center py-16">
          <CardContent>
            <h3 className="text-lg font-semibold mb-2">Proposal Not Found</h3>
            <p className="text-muted-foreground">
              The proposal you're looking for doesn't exist or you don't have permission to view it.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'submitted': return 'default';
      case 'draft': return 'secondary';
      case 'accepted': return 'default';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <CheckCircle className="w-4 h-4" />;
      case 'draft': return <Clock className="w-4 h-4" />;
      case 'accepted': return <Award className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const getProcessingProgress = (processing: any) => {
    const steps = ['parsing', 'signature', 'matching'];
    const completed = steps.filter(step => processing?.[step] === 'completed').length;
    return (completed / steps.length) * 100;
  };

  const canEdit = user?.id === proposal.submittedBy || user?.role === 'admin';
  const isSubmissionDeadlinePassed = tender ? new Date(tender.deadline) < new Date() : false;

  // Show ProposalOwnerDetail for proposal owners
  if (canEdit && user?.id === proposal.submittedBy) {
    return (
      <ProposalOwnerDetail 
        proposalId={proposalId} 
        onBack={onBack} 
      />
    );
  }

  const getMatchStats = () => {
    const totalItems = proposal.items.length;
    const matchedItems = proposal.items.filter(item => item.matchedTenderId).length;
    const matchPercentage = totalItems > 0 ? Math.round((matchedItems / totalItems) * 100) : 0;
    
    const averageMatchScore = proposal.items.length > 0 && proposal.items.some(item => item.matchPercentage)
      ? Math.round(
          proposal.items
            .filter(item => item.matchPercentage)
            .reduce((sum, item) => sum + (item.matchPercentage || 0), 0) /
          proposal.items.filter(item => item.matchPercentage).length
        )
      : 0;
    
    return { totalItems, matchedItems, matchPercentage, averageMatchScore };
  };



  // Get match percentage color
  const getMatchPercentageColor = (percentage: number = 0) => {
    if (percentage >= 90) return "bg-green-100 text-green-800";
    if (percentage >= 70) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading proposal data...</p>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-amber-500" />
        <h2 className="text-2xl font-bold mb-2">Proposal Not Found</h2>
        <p className="text-muted-foreground mb-6">The proposal you're looking for doesn't exist or has been removed.</p>
        <Button onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Proposals
        </Button>
      </div>
    );
  }

  const matchStats = getMatchStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{proposal.name}</h1>
            <p className="text-muted-foreground">
              Proposal for {tender?.name || 'Unknown Tender'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge 
            variant={getStatusVariant(proposal.status)} 
            className="flex items-center space-x-1 px-3 py-1.5"
          >
            {getStatusIcon(proposal.status)}
            <span className="ml-1">{proposal.status}</span>
          </Badge>
          
          {isOwner && (
            <div className="flex space-x-2">
              {onEdit && (
                <Button variant="outline" size="sm" onClick={() => onEdit(proposalId)}>
                  <Pencil className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              )}
              
              {onDelete && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleDelete}
                >
                  {deleteConfirm ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Confirm
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 md:w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="matching">Matching</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Proposal Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Description</p>
                  <p className="text-sm text-muted-foreground">{proposal.description}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium">Company</p>
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm">{proposal.company}</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium">Total Value</p>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm">${proposal.totalCost.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium">Submission Date</p>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm">{new Date(proposal.submittedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Tender Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {tender ? (
                  <>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Tender Name</p>
                      <p className="text-sm text-muted-foreground">{tender.name}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Organization</p>
                      <p className="text-sm text-muted-foreground">{tender.organization || 'Not specified'}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Deadline</p>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm">{new Date(tender.deadline).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Budget</p>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm">${tender.budget?.toLocaleString() || 'Not specified'}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Tender information not available</p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Match Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium">Items Matched</p>
                    <Badge variant="outline">
                      {matchStats.matchedItems}/{matchStats.totalItems}
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full ${matchStats.matchPercentage >= 80 ? 'bg-green-500' : 'bg-amber-500'}`}
                      style={{ width: `${matchStats.matchPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-right text-muted-foreground">
                    {matchStats.matchPercentage}% of items matched
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium">Average Match Score</p>
                    <Badge 
                      className={getMatchPercentageColor(matchStats.averageMatchScore)}
                    >
                      {matchStats.averageMatchScore}%
                    </Badge>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </TabsContent>
        
        {/* Items Tab */}
        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Proposal Items</CardTitle>
              <CardDescription>
                All items included in this proposal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {proposal.items.map((item, index) => {
                  const matchedTenderItem = tender?.items.find(t => t.id === item.matchedTenderId);
                  
                  return (
                    <Card key={item.id || index} className={item.matchedTenderId ? 'border-green-200' : ''}>
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <h3 className="font-medium">{item.name}</h3>
                              {item.matchedTenderId && (
                                <Badge 
                                  className={getMatchPercentageColor(item.matchPercentage)}
                                >
                                  {item.matchPercentage}% Match
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                            
                            <div className="mt-2 flex flex-wrap gap-1">
                              <Badge variant="outline" className="text-xs">
                                ${item.cost} x {item.quantity}
                              </Badge>
                              {Object.entries(item.attributes).map(([key, value]) => (
                                <Badge key={key} variant="secondary" className="text-xs">
                                  {key}: {value}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          {matchedTenderItem && (
                            <div className="bg-muted/30 p-3 rounded-md flex-1">
                              <h4 className="text-sm font-medium flex items-center">
                                <FileCheck className="w-3.5 h-3.5 mr-1 text-green-600" />
                                Matched to Tender Item
                              </h4>
                              <p className="text-xs font-medium mt-1">{matchedTenderItem.name}</p>
                              <p className="text-xs text-muted-foreground">{matchedTenderItem.description}</p>
                              <div className="mt-1 flex flex-wrap gap-1">
                                <Badge variant="outline" className="text-xs">
                                  Qty: {matchedTenderItem.quantity}
                                </Badge>
                                {Object.entries(matchedTenderItem.attributes).map(([key, value]) => (
                                  <Badge key={key} variant="secondary" className="text-xs">
                                    {key}: {value}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                
                {proposal.items.length === 0 && (
                  <div className="text-center py-8">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-amber-500 opacity-80" />
                    <h3 className="text-lg font-semibold mb-2">No items in this proposal</h3>
                    <p className="text-muted-foreground">
                      This proposal doesn't contain any items
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Matching Tab */}
        <TabsContent value="matching" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Item Matching Analysis</CardTitle>
              <CardDescription>
                See how your proposal items match with tender requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-4xl font-bold text-green-600">
                      {matchStats.matchedItems}/{matchStats.totalItems}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Items Matched</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-4xl font-bold text-amber-600">
                      {matchStats.averageMatchScore}%
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Average Match Score</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-4xl font-bold text-blue-600">
                      ${proposal.totalCost.toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Total Proposal Value</p>
                  </CardContent>
                </Card>
              </div>

              
              {tender && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Tender Requirements Coverage</h3>
                  
                  <div className="space-y-3">
                    {tender.items.map(tenderItem => {
                      const matchingProposalItems = proposal.items.filter(
                        p => p.matchedTenderId === tenderItem.id
                      );
                      const isCovered = matchingProposalItems.length > 0;
                      
                      return (
                        <div 
                          key={tenderItem.id} 
                          className={`p-3 border rounded-md ${isCovered ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium flex items-center">
                                {isCovered ? (
                                  <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                                ) : (
                                  <AlertTriangle className="w-4 h-4 mr-1 text-amber-600" />
                                )}
                                {tenderItem.name}
                              </h4>
                              <p className="text-sm text-muted-foreground">{tenderItem.description}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  Qty: {tenderItem.quantity} {tenderItem.unit || 'units'}
                                </Badge>
                              </div>
                            </div>
                            <Badge 
                              variant={isCovered ? "success" : "warning"}
                              className="whitespace-nowrap"
                            >
                              {isCovered ? 'Covered' : 'Not Covered'}
                            </Badge>
                          </div>
                          
                          {isCovered && matchingProposalItems.map(item => (
                            <div key={item.id} className="mt-2 bg-white p-2 rounded-md text-sm">
                              <div className="flex justify-between items-center">
                                <span>{item.name}</span>
                                <Badge 
                                  className={getMatchPercentageColor(item.matchPercentage)}
                                >
                                  {item.matchPercentage}% Match
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Processing Tab */}
        <TabsContent value="processing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Proposal Processing Pipeline</CardTitle>
              <CardDescription>
                Status of AI-powered processing for this proposal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <h3 className="font-medium">Document Parsing</h3>
                    </div>
                    <Badge variant={proposal.fileProcessing?.parsing === 'completed' ? 'success' : 'pending'}>
                      {proposal.fileProcessing?.parsing || 'pending'}
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full ${
                        proposal.fileProcessing?.parsing === 'completed' ? 'bg-green-500' : 
                        proposal.fileProcessing?.parsing === 'progress' ? 'bg-blue-500' : 'bg-muted-foreground/30'
                      }`}
                      style={{ 
                        width: proposal.fileProcessing?.parsing === 'completed' ? '100%' : 
                               proposal.fileProcessing?.parsing === 'progress' ? '50%' : '0%' 
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {proposal.fileProcessing?.parsing === 'completed' 
                      ? 'Document successfully parsed and content extracted'
                      : proposal.fileProcessing?.parsing === 'progress'
                      ? 'Parsing document content...'
                      : 'Waiting to start document parsing'}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileCheck className="w-5 h-5 text-blue-600" />
                      <h3 className="font-medium">Digital Signature Verification</h3>
                    </div>
                    <Badge variant={proposal.fileProcessing?.signature === 'completed' ? 'success' : 'pending'}>
                      {proposal.fileProcessing?.signature || 'pending'}
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full ${
                        proposal.fileProcessing?.signature === 'completed' ? 'bg-green-500' : 
                        proposal.fileProcessing?.signature === 'progress' ? 'bg-blue-500' : 'bg-muted-foreground/30'
                      }`}
                      style={{ 
                        width: proposal.fileProcessing?.signature === 'completed' ? '100%' : 
                               proposal.fileProcessing?.signature === 'progress' ? '50%' : '0%' 
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {proposal.fileProcessing?.signature === 'completed' 
                      ? 'Digital signature verified successfully'
                      : proposal.fileProcessing?.signature === 'progress'
                      ? 'Verifying digital signature...'
                      : 'Waiting to verify digital signature'}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BarChart className="w-5 h-5 text-blue-600" />
                      <h3 className="font-medium">AI Matching Analysis</h3>
                    </div>
                    <Badge variant={proposal.fileProcessing?.matching === 'completed' ? 'success' : 'pending'}>
                      {proposal.fileProcessing?.matching || 'pending'}
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full ${
                        proposal.fileProcessing?.matching === 'completed' ? 'bg-green-500' : 
                        proposal.fileProcessing?.matching === 'progress' ? 'bg-blue-500' : 'bg-muted-foreground/30'
                      }`}
                      style={{ 
                        width: proposal.fileProcessing?.matching === 'completed' ? '100%' : 
                               proposal.fileProcessing?.matching === 'progress' ? '50%' : '0%' 
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {proposal.fileProcessing?.matching === 'completed' 
                      ? 'AI matching analysis completed successfully'
                      : proposal.fileProcessing?.matching === 'progress'
                      ? 'Analyzing matches between proposal and tender items...'
                      : 'Waiting to start AI matching analysis'}
                  </p>
                </div>
              </div>
              
              {proposal.fileProcessing?.matching === 'completed' && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <div>
                        <h3 className="font-semibold text-green-700">Processing Complete</h3>
                        <p className="text-sm text-green-600">
                          All processing steps have been completed successfully
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
