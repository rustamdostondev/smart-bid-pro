import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  FileText,
  Target,
  Award
} from 'lucide-react';
import { mockTenders, mockProposals, getCurrentUser, type Tender } from '@/lib/mockData';

interface AnalyticsPageProps {
  onOpenTenderAnalytics: (tenderId: string) => void;
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ onOpenTenderAnalytics }) => {
  const user = getCurrentUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed' | 'draft'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'proposals' | 'name'>('date');

  // Get user's tenders with proposal counts
  const userTendersWithAnalytics = useMemo(() => {
    const userTenders = mockTenders.filter(tender => tender.createdBy === user?.id);
    
    return userTenders.map(tender => {
      const relatedProposals = mockProposals.filter(p => p.tenderIds === tender.id);
      const isActive = new Date(tender.deadline) > new Date();
      const status = tender.status || (isActive ? 'active' : 'closed');
      
      // Calculate analytics summary
      const totalProposals = relatedProposals.length;
      const avgMatchScore = totalProposals > 0 
        ? Math.round(relatedProposals.reduce((sum, p) => sum + (75 + Math.random() * 20), 0) / totalProposals)
        : 0;
      const lowestBid = totalProposals > 0 
        ? Math.min(...relatedProposals.map(p => p.items.reduce((sum, item) => sum + (item.cost || 0), 0)))
        : 0;
      const highestBid = totalProposals > 0 
        ? Math.max(...relatedProposals.map(p => p.items.reduce((sum, item) => sum + (item.cost || 0), 0)))
        : 0;

      return {
        ...tender,
        status,
        isActive,
        analytics: {
          totalProposals,
          avgMatchScore,
          lowestBid,
          highestBid,
          hasAnalysis: totalProposals > 0
        }
      };
    });
  }, [user?.id]);

  // Filter and sort tenders
  const filteredTenders = useMemo(() => {
    let filtered = userTendersWithAnalytics;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(tender =>
        tender.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tender.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(tender => tender.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'proposals':
          return b.analytics.totalProposals - a.analytics.totalProposals;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [userTendersWithAnalytics, searchTerm, statusFilter, sortBy]);

  // Summary statistics
  const summaryStats = useMemo(() => {
    const totalTenders = userTendersWithAnalytics.length;
    const totalProposals = userTendersWithAnalytics.reduce((sum, t) => sum + t.analytics.totalProposals, 0);
    const activeTenders = userTendersWithAnalytics.filter(t => t.isActive).length;
    const tendersWithProposals = userTendersWithAnalytics.filter(t => t.analytics.totalProposals > 0).length;

    return {
      totalTenders,
      totalProposals,
      activeTenders,
      tendersWithProposals
    };
  }, [userTendersWithAnalytics]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Analyze proposal performance across all your tenders
          </p>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Tenders</p>
              <p className="text-2xl font-bold">{summaryStats.totalTenders}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Proposals</p>
              <p className="text-2xl font-bold">{summaryStats.totalProposals}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Active Tenders</p>
              <p className="text-2xl font-bold">{summaryStats.activeTenders}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <Award className="w-8 h-8 text-orange-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Ready for Analysis</p>
              <p className="text-2xl font-bold">{summaryStats.tendersWithProposals}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search tenders by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="border rounded px-3 py-2 bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
              <option value="draft">Draft</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border rounded px-3 py-2 bg-white"
            >
              <option value="date">Sort by Date</option>
              <option value="proposals">Sort by Proposals</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Tenders List */}
      <div className="space-y-4">
        {filteredTenders.length === 0 ? (
          <Card className="p-12 text-center">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tenders found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first tender to start analyzing proposals'
              }
            </p>
          </Card>
        ) : (
          filteredTenders.map((tender) => (
            <Card key={tender.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Tender Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{tender.name}</h3>
                    <Badge className={`${getStatusColor(tender.status)} ml-2`}>
                      {tender.status}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-3 line-clamp-2">{tender.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Created: {new Date(tender.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Deadline: {new Date(tender.deadline).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {tender.analytics.totalProposals} proposals
                    </div>
                  </div>
                </div>

                {/* Analytics Summary */}
                <div className="lg:w-80">
                  {tender.analytics.hasAnalysis ? (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <h4 className="font-medium text-gray-900 flex items-center">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Analysis Summary
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Avg Match:</span>
                          <div className={`inline-block ml-2 px-2 py-1 rounded text-xs font-medium ${getMatchScoreColor(tender.analytics.avgMatchScore)}`}>
                            {tender.analytics.avgMatchScore}%
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Proposals:</span>
                          <span className="ml-2 font-medium">{tender.analytics.totalProposals}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Lowest Bid:</span>
                          <span className="ml-2 font-medium">${tender.analytics.lowestBid.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Highest Bid:</span>
                          <span className="ml-2 font-medium">${tender.analytics.highestBid.toLocaleString()}</span>
                        </div>
                      </div>

                      <Button 
                        onClick={() => onOpenTenderAnalytics(tender.id)}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        size="sm"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Open Analytics
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-3">
                        No proposals received yet
                      </p>
                      <Button 
                        disabled
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        Analytics Unavailable
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Empty State for No Tenders */}
      {userTendersWithAnalytics.length === 0 && (
        <Card className="p-12 text-center">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">Welcome to Analytics</h3>
          <p className="text-gray-600 mb-6">
            Create tenders and receive proposals to start analyzing performance data.
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Create Your First Tender
          </Button>
        </Card>
      )}
    </div>
  );
};

export default AnalyticsPage;
