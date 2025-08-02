import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  ChevronDown, 
  ExternalLink,
  Trophy,
  CheckCircle2,
  Crown,
  AlertTriangle
} from 'lucide-react';
import { Tender, Proposal } from '@/lib/mockData';

interface TenderAnalyticsProps {
  tender: Tender;
  proposals: Proposal[];
  onBack: () => void;
  onViewProposalDetail?: (proposalId: string) => void;
}

interface AnalysisResult {
  proposalId: string;
  company: string;
  rank: number;
  overallMatch: number;
  itemMatches: {
    tenderItemName: string;
    proposalItemName: string;
    matchPercentage: number;
    reasoning: string;
    costDifference: number;
  }[];
}

const TenderAnalytics: React.FC<TenderAnalyticsProps> = ({ tender, proposals, onBack, onViewProposalDetail }) => {
  const [selectedWinners, setSelectedWinners] = useState<Record<string, string>>({});
  const [showWinnersList, setShowWinnersList] = useState(false);
  const [expandedElements, setExpandedElements] = useState<Set<string>>(new Set());

  // Generate comprehensive analysis results
  const analysisResults: AnalysisResult[] = useMemo(() => {
    return proposals.map((proposal, index) => {
      const rank = index + 1;
      const overallMatch = Math.floor(Math.random() * 20) + 75; // 75-95%
      
      // Generate item matches for each tender item
      const itemMatches = tender.items.map((tenderItem, itemIndex) => {
        const proposalItem = proposal.items[itemIndex];
        const matchPercentage = Math.floor(Math.random() * 25) + 70; // 70-95%
        
        const reasons = [
          `Excellent match for ${tenderItem.name} specifications`,
          `High quality ${proposalItem?.name || 'item'} meets all requirements`,
          `Competitive pricing with good value proposition`,
          `Strong technical specifications alignment`,
          `Reliable supplier with proven track record`
        ];
        
        return {
          tenderItemName: tenderItem.name,
          proposalItemName: proposalItem?.name || `Item ${itemIndex + 1}`,
          matchPercentage,
          reasoning: reasons[Math.floor(Math.random() * reasons.length)],
          costDifference: proposalItem ? (proposalItem.cost - (tenderItem.estimatedCost || 0)) : 0
        };
      });
      
      return {
        proposalId: proposal.id,
        company: proposal.company || `Company ${index + 1}`,
        rank,
        overallMatch,
        itemMatches
      };
    }).sort((a, b) => b.overallMatch - a.overallMatch);
  }, [proposals, tender.items]);

  const getMatchColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-100 text-green-800';
    if (percentage >= 80) return 'bg-blue-100 text-blue-800';
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const toggleElement = (elementId: string) => {
    const newExpanded = new Set(expandedElements);
    if (newExpanded.has(elementId)) {
      newExpanded.delete(elementId);
    } else {
      newExpanded.add(elementId);
    }
    setExpandedElements(newExpanded);
  };

  const selectWinner = (elementId: string, proposalId: string) => {
    setSelectedWinners(prev => ({
      ...prev,
      [elementId]: proposalId
    }));
  };

  const getSelectedWinnersList = () => {
    return Object.entries(selectedWinners).map(([elementId, proposalId]) => {
      const element = tender.items.find(item => item.id === elementId);
      const proposal = proposals.find(p => p.id === proposalId);
      return {
        elementName: element?.name || 'Unknown Element',
        company: proposal?.companyName || 'Unknown Company',
        proposalId
      };
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Analytics
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{tender.name}</h1>
            <p className="text-gray-600">Detailed Proposal Analysis</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button 
            onClick={() => setShowWinnersList(!showWinnersList)}
            variant={showWinnersList ? "default" : "outline"}
          >
            <Trophy className="w-4 h-4 mr-2" />
            {showWinnersList ? 'Hide Winners' : 'Show Winners'} ({Object.keys(selectedWinners).length})
          </Button>
        </div>
      </div>

      {/* Winners List */}
      {showWinnersList && Object.keys(selectedWinners).length > 0 && (
        <Card className="p-6 mb-6 bg-green-50 border-green-200">
          <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
            <Crown className="w-5 h-5 mr-2" />
            Selected Winners
          </h3>
          <div className="space-y-3">
            {getSelectedWinnersList().map((winner, index) => (
              <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3 border border-green-200">
                <div>
                  <h4 className="font-medium text-gray-900">{winner.elementName}</h4>
                  <p className="text-sm text-gray-600">Winner: {winner.company}</p>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  Selected
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Element-by-Element Analysis */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Element-by-Element Analysis</h3>
          <div className="text-sm text-gray-600">
            Comparing all proposals across {tender.items.length} tender elements
          </div>
        </div>

        {/* Element-by-Element Collapsible Sections */}
        <div className="space-y-3">
          {tender.items.map((tenderItem, itemIndex) => {
            // Get all proposal responses for this tender item
            const proposalResponses = analysisResults.map(result => {
              const match = result.itemMatches[itemIndex];
              const proposalItem = proposals.find(p => p.id === result.proposalId)?.items[itemIndex];
              return {
                company: result.company,
                proposalId: result.proposalId,
                rank: result.rank,
                matchPercentage: match?.matchPercentage || 0,
                proposalItemName: match?.proposalItemName || 'No matching item',
                proposalItem: proposalItem,
                reasoning: match?.reasoning || 'No analysis available',
                costDifference: match?.costDifference || 0,
                overallMatch: result.overallMatch
              };
            }).sort((a, b) => b.matchPercentage - a.matchPercentage);

            // Group proposals by category with simplified color scheme
            const highMatchProposals = proposalResponses.filter(r => r.matchPercentage >= 85);  // Green
            const mediumMatchProposals = proposalResponses.filter(r => r.matchPercentage >= 70 && r.matchPercentage < 85);  // Orange
            const lowMatchProposals = proposalResponses.filter(r => r.matchPercentage < 70);  // Red

            const isExpanded = expandedElements.has(tenderItem.id);
            const selectedWinner = selectedWinners[tenderItem.id];

            return (
              <div key={tenderItem.id} className="border border-gray-200 rounded-lg">
                {/* Collapsible Header */}
                <button
                  onClick={() => toggleElement(tenderItem.id)}
                  className="w-full px-6 py-4 text-left hover:bg-gray-50 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">
                      {tenderItem.name}
                      {selectedWinner && (
                        <Badge className="ml-2 bg-green-100 text-green-800">
                          Winner Selected
                        </Badge>
                      )}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {proposalResponses.length} proposals • Budget: ${(tenderItem.estimatedCost || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Best Match</div>
                      <div className={`px-2 py-1 rounded text-sm font-bold ${getMatchColor(proposalResponses[0]?.matchPercentage || 0)}`}>
                        {proposalResponses[0]?.matchPercentage || 0}%
                      </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    {/* Tender Element Details */}
                    <div className="mb-6 pt-4">
                      <p className="text-gray-700 mb-3">{tenderItem.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Quantity:</span>
                          <p className="font-medium">{tenderItem.quantity} {tenderItem.unit}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Budget:</span>
                          <p className="font-medium">${(tenderItem.estimatedCost || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Unit:</span>
                          <p className="font-medium">{tenderItem.unit || 'units'}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Specifications:</span>
                          <p className="font-medium">{Object.keys(tenderItem.attributes || {}).length} attributes</p>
                        </div>
                      </div>

                      {/* Required Specifications */}
                      {Object.keys(tenderItem.attributes || {}).length > 0 && (
                        <div className="mt-3">
                          <span className="text-gray-500 text-sm">Required Specifications:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {Object.entries(tenderItem.attributes || {}).map(([key, value]) => (
                              <span key={key} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                {key}: {value}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* High Match Proposals - Green Theme */}
                    {highMatchProposals.length > 0 && (
                      <div className="mb-8">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 mb-6 shadow-sm">
                          <div className="flex items-center mb-3">
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-4">
                              <Crown className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h5 className="text-xl font-bold text-green-800 mb-1">High Match Proposals</h5>
                              <p className="text-sm text-green-600 font-medium">85%+ Match • Excellent Quality</p>
                            </div>
                            <div className="ml-auto">
                              <Badge className="bg-green-500 text-white px-3 py-1 text-sm font-semibold">
                                {highMatchProposals.length} Proposal{highMatchProposals.length !== 1 ? 's' : ''}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-green-700 leading-relaxed">
                            These proposals demonstrate exceptional alignment with tender requirements, offering the best value, quality, and compliance.
                          </p>
                        </div>
                        
                        {highMatchProposals.map((response, idx) => {
                          const proposal = proposals.find(p => p.id === response.proposalId);
                          return (
                            <div key={response.proposalId} className="bg-white border-2 border-green-300 rounded-2xl p-6 mb-6 shadow-lg hover:shadow-xl transition-all duration-300">
                              {/* Header with Company and Match Score */}
                              <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-4">
                                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <Crown className="w-6 h-6 text-white" />
                                  </div>
                                  <div>
                                    <h6 className="text-xl font-bold text-gray-900 mb-1">{response.company}</h6>
                                    <div className="flex items-center space-x-3">
                                      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                        {response.matchPercentage}% Match
                                      </div>
                                      <Badge className="bg-green-100 text-green-800 border border-green-200">Rank #{response.rank}</Badge>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-3">
                                  <Button
                                    size="sm"
                                    onClick={() => selectWinner(tenderItem.id, response.proposalId)}
                                    className={selectedWinner === response.proposalId 
                                      ? "bg-green-600 hover:bg-green-700 text-white shadow-md" 
                                      : "bg-white border-2 border-green-500 text-green-600 hover:bg-green-50"
                                    }
                                  >
                                    {selectedWinner === response.proposalId ? (
                                      <>
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        Winner Selected
                                      </>
                                    ) : (
                                      'Select as Winner'
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onViewProposalDetail?.(response.proposalId)}
                                    className="border-green-300 text-green-700 hover:bg-green-50"
                                  >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    View Details
                                  </Button>
                                </div>
                              </div>

                              {/* Key Information Cards */}
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                                  <div className="text-sm text-green-600 font-medium mb-1">Product</div>
                                  <div className="font-semibold text-gray-900">{response.proposalItem?.name || 'N/A'}</div>
                                </div>
                                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                                  <div className="text-sm text-green-600 font-medium mb-1">Quantity</div>
                                  <div className="font-semibold text-gray-900">{response.proposalItem?.quantity || 0} units</div>
                                </div>
                                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                                  <div className="text-sm text-green-600 font-medium mb-1">Total Price</div>
                                  <div className="font-bold text-green-700 text-lg">${(response.proposalItem?.cost || 0).toLocaleString()}</div>
                                </div>
                                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                                  <div className="text-sm text-green-600 font-medium mb-1">Budget Difference</div>
                                  <div className={`font-bold text-lg ${
                                    response.costDifference > 0 ? 'text-red-600' : 'text-green-600'
                                  }`}>
                                    {response.costDifference > 0 ? '+' : ''}${response.costDifference.toLocaleString()}
                                  </div>
                                </div>
                              </div>

                              {/* Analysis Reasoning */}
                              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
                                <h6 className="font-semibold text-green-800 mb-3 flex items-center">
                                  <div className="w-5 h-5 bg-green-500 rounded-full mr-2 flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">✓</span>
                                  </div>
                                  Why This is Excellent
                                </h6>
                                <p className="text-sm text-green-700 leading-relaxed mb-4">{response.reasoning}</p>
                                
                                {/* Technical Specifications */}
                                {response.proposalItem?.attributes && Object.keys(response.proposalItem.attributes).length > 0 && (
                                  <div>
                                    <div className="text-sm text-green-600 font-medium mb-2">Technical Specifications:</div>
                                    <div className="flex flex-wrap gap-2">
                                      {Object.entries(response.proposalItem.attributes).map(([key, value]) => (
                                        <span key={key} className="bg-white text-green-800 px-3 py-1 rounded-full text-xs border border-green-300 font-medium">
                                          {key}: {value}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Medium Match Proposals - Orange Theme */}
                    {mediumMatchProposals.length > 0 && (
                      <div className="mb-8">
                        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-6 mb-6 shadow-sm">
                          <div className="flex items-center mb-3">
                            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mr-4">
                              <Trophy className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h5 className="text-xl font-bold text-orange-800 mb-1">Medium Match Proposals</h5>
                              <p className="text-sm text-orange-600 font-medium">70-84% Match • Good Quality</p>
                            </div>
                            <div className="ml-auto">
                              <Badge className="bg-orange-500 text-white px-3 py-1 text-sm font-semibold">
                                {mediumMatchProposals.length} Proposal{mediumMatchProposals.length !== 1 ? 's' : ''}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-orange-700 leading-relaxed">
                            These proposals meet most requirements with good value and acceptable compliance levels.
                          </p>
                        </div>
                        
                        {mediumMatchProposals.map((response, idx) => {
                          const proposal = proposals.find(p => p.id === response.proposalId);
                          return (
                            <div key={response.proposalId} className="bg-white border-2 border-orange-300 rounded-2xl p-5 mb-5 shadow-md hover:shadow-lg transition-all duration-300">
                              {/* Header with Company and Match Score */}
                              <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center space-x-4">
                                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                                    <Trophy className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <h6 className="text-lg font-bold text-gray-900 mb-1">{response.company}</h6>
                                    <div className="flex items-center space-x-3">
                                      <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                        {response.matchPercentage}% Match
                                      </div>
                                      <Badge className="bg-orange-100 text-orange-800 border border-orange-200">Rank #{response.rank}</Badge>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-3">
                                  <Button
                                    size="sm"
                                    onClick={() => selectWinner(tenderItem.id, response.proposalId)}
                                    className={selectedWinner === response.proposalId 
                                      ? "bg-orange-600 hover:bg-orange-700 text-white shadow-md" 
                                      : "bg-white border-2 border-orange-500 text-orange-600 hover:bg-orange-50"
                                    }
                                  >
                                    {selectedWinner === response.proposalId ? (
                                      <>
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        Winner Selected
                                      </>
                                    ) : (
                                      'Select as Winner'
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onViewProposalDetail?.(response.proposalId)}
                                    className="border-orange-300 text-orange-700 hover:bg-orange-50"
                                  >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    View Details
                                  </Button>
                                </div>
                              </div>

                              {/* Key Information Cards */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                                <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                                  <div className="text-sm text-orange-600 font-medium mb-1">Product</div>
                                  <div className="font-semibold text-gray-900">{response.proposalItem?.name || 'N/A'}</div>
                                </div>
                                <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                                  <div className="text-sm text-orange-600 font-medium mb-1">Total Price</div>
                                  <div className="font-bold text-orange-700 text-lg">${(response.proposalItem?.cost || 0).toLocaleString()}</div>
                                </div>
                                <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                                  <div className="text-sm text-orange-600 font-medium mb-1">Budget Difference</div>
                                  <div className={`font-bold text-lg ${
                                    response.costDifference > 0 ? 'text-red-600' : 'text-green-600'
                                  }`}>
                                    {response.costDifference > 0 ? '+' : ''}${response.costDifference.toLocaleString()}
                                  </div>
                                </div>
                              </div>

                              {/* Analysis Reasoning */}
                              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
                                <h6 className="font-semibold text-orange-800 mb-2 flex items-center">
                                  <div className="w-5 h-5 bg-orange-500 rounded-full mr-2 flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">!</span>
                                  </div>
                                  Analysis Summary
                                </h6>
                                <p className="text-sm text-orange-700 leading-relaxed">{response.reasoning}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Low Match Proposals - Red Theme */}
                    {lowMatchProposals.length > 0 && (
                      <div className="mb-8">
                        <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl p-6 mb-6 shadow-sm">
                          <div className="flex items-center mb-3">
                            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mr-4">
                              <AlertTriangle className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h5 className="text-xl font-bold text-red-800 mb-1">Low Match Proposals</h5>
                              <p className="text-sm text-red-600 font-medium">&lt;70% Match • Requires Review</p>
                            </div>
                            <div className="ml-auto">
                              <Badge className="bg-red-500 text-white px-3 py-1 text-sm font-semibold">
                                {lowMatchProposals.length} Proposal{lowMatchProposals.length !== 1 ? 's' : ''}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-red-700 leading-relaxed">
                            These proposals have significant gaps or issues that may require careful consideration.
                          </p>
                        </div>
                        
                        {lowMatchProposals.map((response, idx) => {
                          const proposal = proposals.find(p => p.id === response.proposalId);
                          return (
                            <div key={response.proposalId} className="bg-white border-2 border-red-300 rounded-2xl p-5 mb-5 shadow-md hover:shadow-lg transition-all duration-300">
                              {/* Header with Company and Match Score */}
                              <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center space-x-4">
                                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-md">
                                    <AlertTriangle className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <h6 className="text-lg font-bold text-gray-900 mb-1">{response.company}</h6>
                                    <div className="flex items-center space-x-3">
                                      <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                        {response.matchPercentage}% Match
                                      </div>
                                      <Badge className="bg-red-100 text-red-800 border border-red-200">Rank #{response.rank}</Badge>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-3">
                                  <Button
                                    size="sm"
                                    onClick={() => selectWinner(tenderItem.id, response.proposalId)}
                                    className={selectedWinner === response.proposalId 
                                      ? "bg-red-600 hover:bg-red-700 text-white shadow-md" 
                                      : "bg-white border-2 border-red-500 text-red-600 hover:bg-red-50"
                                    }
                                  >
                                    {selectedWinner === response.proposalId ? (
                                      <>
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        Winner Selected
                                      </>
                                    ) : (
                                      'Select as Winner'
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onViewProposalDetail?.(response.proposalId)}
                                    className="border-red-300 text-red-700 hover:bg-red-50"
                                  >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    View Details
                                  </Button>
                                </div>
                              </div>

                              {/* Key Information Cards */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                                  <div className="text-sm text-red-600 font-medium mb-1">Product</div>
                                  <div className="font-semibold text-gray-900">{response.proposalItem?.name || 'N/A'}</div>
                                </div>
                                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                                  <div className="text-sm text-red-600 font-medium mb-1">Total Price</div>
                                  <div className="font-bold text-red-700 text-lg">${(response.proposalItem?.cost || 0).toLocaleString()}</div>
                                </div>
                                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                                  <div className="text-sm text-red-600 font-medium mb-1">Budget Difference</div>
                                  <div className={`font-bold text-lg ${
                                    response.costDifference > 0 ? 'text-red-600' : 'text-green-600'
                                  }`}>
                                    {response.costDifference > 0 ? '+' : ''}${response.costDifference.toLocaleString()}
                                  </div>
                                </div>
                              </div>

                              {/* Analysis Reasoning */}
                              <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-xl p-4 border border-red-200">
                                <h6 className="font-semibold text-red-800 mb-2 flex items-center">
                                  <div className="w-5 h-5 bg-red-500 rounded-full mr-2 flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">!</span>
                                  </div>
                                  Analysis Summary
                                </h6>
                                <p className="text-sm text-red-700 leading-relaxed">{response.reasoning}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}


                  </div>
                )
              })
            </div>)
          })}
        </div>

     </div>

     </div>

    );

}

export default TenderAnalytics;
