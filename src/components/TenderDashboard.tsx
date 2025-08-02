import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockTenders, getCurrentUser } from '@/lib/mockData';
import { Calendar, Eye, Users, Lock, Globe } from 'lucide-react';

interface TenderDashboardProps {
  onCreateTender: () => void;
  onViewTender: (tenderId: string) => void;
}

export function TenderDashboard({ onCreateTender, onViewTender }: TenderDashboardProps) {
  const user = getCurrentUser();
  
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'pending';
      case 'closed': return 'secondary';
      default: return 'default';
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    return visibility === 'public' ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />;
  };

  const visibleTenders = mockTenders.filter(tender => {
    if (tender.visibility === 'public') return true;
    if (tender.createdBy === user?.id) return true;
    if (tender.invitedUsers?.includes(user?.id || '')) return true;
    return false;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tender Dashboard</h1>
          <p className="text-muted-foreground">
            Manage and track all tender opportunities
          </p>
        </div>
        <Button onClick={onCreateTender} className="shadow-soft">
          Create New Tender
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visibleTenders.map((tender) => (
          <Card key={tender.id} className="shadow-soft hover:shadow-medium transition-all duration-300">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {getVisibilityIcon(tender.visibility)}
                  <CardTitle className="text-lg">{tender.name}</CardTitle>
                </div>
                <Badge variant={getStatusVariant(tender.status)}>
                  {tender.status}
                </Badge>
              </div>
              <CardDescription>{tender.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Deadline: {new Date(tender.deadline).toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{tender.items.length} items</span>
              </div>

              {tender.visibility === 'private' && (
                <div className="text-sm text-muted-foreground">
                  <Lock className="w-4 h-4 inline mr-1" />
                  Private tender
                </div>
              )}

              <Button 
                onClick={() => onViewTender(tender.id)}
                className="w-full"
                variant="outline"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {visibleTenders.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <h3 className="text-lg font-semibold mb-2">No tenders available</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first tender
            </p>
            <Button onClick={onCreateTender}>
              Create New Tender
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}