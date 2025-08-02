import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  FileText,
  Building,
  User,
  Calendar,
  DollarSign,
  Package,
  CheckCircle,
  Clock,
  Award,
  XCircle
} from 'lucide-react';
import { mockProposals, type Proposal } from '@/lib/mockData';

interface ProposalDetailViewProps {
  proposalId: string;
  onBack: () => void;
}

export function ProposalDetailView({ proposalId, onBack }: ProposalDetailViewProps) {
  const proposal = mockProposals.find(p => p.id === proposalId);

  if (!proposal) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Proposal Not Found</h2>
            <p className="text-gray-600 mb-4">The proposal you're looking for doesn't exist.</p>
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-green-100 text-green-700';
      case 'draft': return 'bg-yellow-100 text-yellow-700';
      case 'accepted': return 'bg-blue-100 text-blue-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={onBack} variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{proposal.name}</h1>
              <p className="text-gray-600 text-sm">Proposal Details</p>
            </div>
          </div>
          <Badge className={`${getStatusVariant(proposal.status)} flex items-center gap-1`}>
            {getStatusIcon(proposal.status)}
            <span className="capitalize">{proposal.status}</span>
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Proposal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Company:</span>
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{proposal.company}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Submitted by:</span>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{proposal.submittedBy}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Cost:</span>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="font-semibold text-green-600">
                    ${proposal.totalCost.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Submitted:</span>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">
                    {new Date(proposal.submittedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
            {proposal.description && (
              <div className="pt-4 border-t">
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-gray-600">{proposal.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Proposal Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Proposal Items ({proposal.items.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {proposal.items.map((item, index) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      {item.description && (
                        <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <div className="font-semibold text-green-600">
                        ${item.cost.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </div>
                    </div>
                  </div>
                  
                  {/* Item Attributes */}
                  {Object.keys(item.attributes).length > 0 && (
                    <div className="pt-3 border-t border-gray-100">
                      <div className="text-xs text-gray-500 mb-2">Specifications</div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(item.attributes).map(([key, value]) => (
                          <span
                            key={key}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700"
                          >
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
