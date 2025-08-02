import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TenderOwnerDetail } from '@/components/TenderOwnerDetail';
import { mockTenders, getCurrentUser, type Tender } from '@/lib/mockData';
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  Lock, 
  Globe, 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Shield, 
  Brain,
  Package,
  Building,
  Mail,
  Phone,
  MapPin,
  Download,
  Share2,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  Settings,
  Zap
} from 'lucide-react';

interface TenderDetailProps {
  tenderId: string;
  onBack: () => void;
  onEdit?: (tenderId: string) => void;
  onDelete?: (tenderId: string) => void;
  onViewPipeline?: (tenderId: string) => void;
  previousPage?: string;
}

export function TenderDetail({ tenderId, onBack, onEdit, onDelete, onViewPipeline, previousPage = 'dashboard' }: TenderDetailProps) {
  const user = getCurrentUser();
  const tender = mockTenders.find(t => t.id === tenderId);
  
  if (!tender) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {previousPage === 'all-tenders' ? 'All Tenders' : previousPage === 'my-tenders' ? 'My Tenders' : 'Dashboard'}
          </Button>
        </div>
        <Card className="text-center py-16">
          <CardContent>
            <h3 className="text-lg font-semibold mb-2">Tender Not Found</h3>
            <p className="text-muted-foreground">
              The tender you're looking for doesn't exist or you don't have permission to view it.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  const getProcessingProgress = (processing: any) => {
    const steps = ['parsing', 'signature', 'extraction'];
    const completed = steps.filter(step => processing?.[step] === 'completed').length;
    return (completed / steps.length) * 100;
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

  const canEdit = user?.id === tender.createdBy || user?.role === 'admin';
  const deadlineNear = isDeadlineNear(tender.deadline);
  const deadlinePassed = isDeadlinePassed(tender.deadline);

  // If user is the tender owner, show the owner detail view
  if (canEdit && user?.id === tender.createdBy) {
    return (
      <TenderOwnerDetail
        tenderId={tenderId}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {previousPage === 'all-tenders' ? 'All Tenders' : previousPage === 'my-tenders' ? 'My Tenders' : 'Dashboard'}
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          {canEdit && (
            <>
              <Button variant="outline" size="sm" onClick={() => onViewPipeline?.(tender.id)}>
                <Settings className="w-4 h-4 mr-2" />
                Processing Pipeline
              </Button>
              <Button variant="outline" size="sm" onClick={() => onEdit?.(tender.id)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => onDelete?.(tender.id)}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tender Header Card */}
      <Card className={`border-l-4 ${
        deadlinePassed ? 'border-l-red-500' : 
        deadlineNear ? 'border-l-yellow-500' : 
        tender.status === 'published' ? 'border-l-green-500' : 'border-l-gray-300'
      }`}>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {tender.visibility === 'public' ? 
                  <Globe className="w-5 h-5 text-muted-foreground" /> : 
                  <Lock className="w-5 h-5 text-muted-foreground" />
                }
                <CardTitle className="text-2xl">{tender.name}</CardTitle>
              </div>
              <CardDescription className="text-base mb-4">
                {tender.description}
              </CardDescription>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  <span>Created by Admin</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Created: {new Date(tender.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  <span>{tender.items.length} items</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Badge variant={getStatusVariant(tender.status)} className="flex items-center gap-1 w-fit">
                {getStatusIcon(tender.status)}
                {tender.status.toUpperCase()}
              </Badge>
              <div className={`text-sm font-medium ${
                deadlinePassed ? 'text-red-600' : 
                deadlineNear ? 'text-yellow-600' : 'text-muted-foreground'
              }`}>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    Deadline: {new Date(tender.deadline).toLocaleDateString()}
                    {deadlineNear && !deadlinePassed && ' (Soon)'}
                    {deadlinePassed && ' (Expired)'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="items">Items ({tender.items.length})</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Tender Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Tender Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={getStatusVariant(tender.status)} className="flex items-center gap-1">
                      {getStatusIcon(tender.status)}
                      {tender.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Visibility:</span>
                    <div className="flex items-center gap-1">
                      {tender.visibility === 'public' ? 
                        <Globe className="w-4 h-4" /> : 
                        <Lock className="w-4 h-4" />
                      }
                      <span className="capitalize">{tender.visibility}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deadline:</span>
                    <span className={deadlinePassed ? 'text-red-600' : deadlineNear ? 'text-yellow-600' : ''}>
                      {new Date(tender.deadline).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Items Count:</span>
                    <span>{tender.items.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{new Date(tender.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Access & Permissions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Access & Permissions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Visibility:</span>
                    <span className="capitalize">{tender.visibility}</span>
                  </div>
                  {tender.visibility === 'private' && tender.invitedUsers && (
                    <div>
                      <span className="text-muted-foreground">Invited Users:</span>
                      <div className="mt-2 space-y-1">
                        {tender.invitedUsers.map((userId) => (
                          <div key={userId} className="flex items-center gap-2 text-sm">
                            <Users className="w-3 h-3" />
                            <span>User {userId}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Can Edit:</span>
                    <span>{canEdit ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Items Tab */}
        <TabsContent value="items" className="space-y-6">
          <div className="grid gap-4">
            {tender.items.map((item, index) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </div>
                    <Badge variant="outline">Qty: {item.quantity}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">Specifications:</h4>
                      <div className="grid gap-2 md:grid-cols-2">
                        {Object.entries(item.attributes).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-muted-foreground capitalize">{key.replace('_', ' ')}:</span>
                            <span>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Processing Tab */}
        <TabsContent value="processing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                File Processing Status
              </CardTitle>
              <CardDescription>
                AI-powered document processing and analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(getProcessingProgress(tender.fileProcessing))}%
                    </span>
                  </div>
                  <Progress value={getProcessingProgress(tender.fileProcessing)} className="h-2" />
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  {[
                    { key: 'parsing', label: 'Document Parsing', icon: FileText },
                    { key: 'signature', label: 'Signature Verification', icon: Shield },
                    { key: 'extraction', label: 'Data Extraction', icon: Brain }
                  ].map(({ key, label, icon: Icon }) => {
                    const status = tender.fileProcessing?.[key as keyof typeof tender.fileProcessing] || 'pending';
                    return (
                      <div key={key} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{label}</span>
                        </div>
                        <Badge variant={
                          status === 'completed' ? 'default' : 
                          status === 'progress' ? 'secondary' : 'outline'
                        }>
                          {status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {status === 'progress' && <Clock className="w-3 h-3 mr-1" />}
                          {status}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Timeline of actions and updates for this tender
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Tender created</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tender.createdAt).toLocaleDateString()} - Created by Admin
                    </p>
                  </div>
                </div>
                {tender.status === 'published' && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Tender published</p>
                      <p className="text-xs text-muted-foreground">
                        Made available for proposals
                      </p>
                    </div>
                  </div>
                )}
                {tender.fileProcessing?.parsing === 'completed' && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Document processing completed</p>
                      <p className="text-xs text-muted-foreground">
                        AI analysis and extraction finished
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
