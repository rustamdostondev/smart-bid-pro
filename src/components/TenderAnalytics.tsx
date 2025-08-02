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
  Crown
} from 'lucide-react';
import { Tender, Proposal } from '@/lib/mockData';

interface TenderAnalyticsProps {
  tender: Tender;
  proposals: Proposal[];
  onBack: () => void;
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

const TenderAnalytics: React.FC<TenderAnalyticsProps> = ({ tender, proposals, onBack }) => {
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
        company: proposal.companyName || `Company ${index + 1}`,
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

            // Group proposals by category
            const bestProposals = proposalResponses.filter(r => r.matchPercentage >= 85);
            const goodProposals = proposalResponses.filter(r => r.matchPercentage >= 70 && r.matchPercentage < 85);
            const lessProposals = proposalResponses.filter(r => r.matchPercentage < 70);

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

                    {/* Best Proposals */}
                    {bestProposals.length > 0 && (
                      <div className="mb-6">
                        <div className="bg-green-100 border border-green-200 rounded-lg p-4 mb-4">
                          <h5 className="font-semibold text-green-800 mb-2">Лучшее предложение</h5>
                          <p className="text-sm text-green-700">
                            Предложение #{bestProposals[0].rank} на {bestProposals[0].matchPercentage}% более выгодно, чем среднее по всем предложениям, благодаря самой низкой цене, самому раннему сроку доставки и расширенному гарантийному обслуживанию.
                          </p>
                        </div>
                        
                        {bestProposals.map((response, idx) => (
                          <div key={response.proposalId} className="border border-green-200 rounded-lg p-4 mb-3 bg-green-50">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className="text-sm text-gray-600">Компания</div>
                                <div className="font-semibold">{response.company}</div>
                                <div className="text-sm text-gray-600">Product</div>
                                <div className="font-medium">{response.proposalItem?.name || 'N/A'}</div>
                                <div className="text-sm text-gray-600">Цена</div>
                                <div className="font-semibold">${(response.proposalItem?.cost || 0).toLocaleString()} UZS</div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() => selectWinner(tenderItem.id, response.proposalId)}
                                  variant={selectedWinner === response.proposalId ? "default" : "outline"}
                                >
                                  {selectedWinner === response.proposalId ? (
                                    <>
                                      <CheckCircle2 className="w-4 h-4 mr-1" />
                                      Selected
                                    </>
                                  ) : (
                                    'Select Winner'
                                  )}
                                </Button>
                                <button className="text-gray-400 hover:text-gray-600">
                                  <ExternalLink className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Good Proposals */}
                    {goodProposals.length > 0 && (
                      <div className="mb-6">
                        <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-4 mb-4">
                          <h5 className="font-semibold text-yellow-800 mb-2">Хорошее предложение</h5>
                          <p className="text-sm text-yellow-700">
                            Предложение #{goodProposals[0].rank} на {goodProposals[0].matchPercentage}% более выгодно, чем среднее по всем предложениям, благодаря самой низкой цене, самому раннему сроку доставки и расширенному гарантийному обслуживанию.
                          </p>
                        </div>
                        
                        {goodProposals.map((response, idx) => (
                          <div key={response.proposalId} className="border border-yellow-200 rounded-lg p-4 mb-3 bg-yellow-50">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className="text-sm text-gray-600">Компания</div>
                                <div className="font-semibold">{response.company}</div>
                                <div className="text-sm text-gray-600">Product</div>
                                <div className="font-medium">{response.proposalItem?.name || 'N/A'}</div>
                                <div className="text-sm text-gray-600">Цена</div>
                                <div className="font-semibold">${(response.proposalItem?.cost || 0).toLocaleString()} UZS</div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() => selectWinner(tenderItem.id, response.proposalId)}
                                  variant={selectedWinner === response.proposalId ? "default" : "outline"}
                                >
                                  {selectedWinner === response.proposalId ? (
                                    <>
                                      <CheckCircle2 className="w-4 h-4 mr-1" />
                                      Selected
                                    </>
                                  ) : (
                                    'Select Winner'
                                  )}
                                </Button>
                                <button className="text-gray-400 hover:text-gray-600">
                                  <ExternalLink className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Less Favorable Proposals */}
                    {lessProposals.length > 0 && (
                      <div className="mb-6">
                        <div className="bg-red-100 border border-red-200 rounded-lg p-4 mb-4">
                          <h5 className="font-semibold text-red-800 mb-2">Менее выгодные предложения</h5>
                          <p className="text-sm text-red-700">
                            Предложение #{lessProposals[0].rank} на {lessProposals[0].matchPercentage}% более выгодно, чем среднее по всем предложениям, благодаря самой низкой цене, самому раннему сроку доставки и расширенному гарантийному обслуживанию.
                          </p>
                        </div>
                        
                        {lessProposals.map((response, idx) => (
                          <div key={response.proposalId} className="border border-red-200 rounded-lg p-4 mb-3 bg-red-50">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className="text-sm text-gray-600">Компания</div>
                                <div className="font-semibold">{response.company}</div>
                                <div className="text-sm text-gray-600">Product</div>
                                <div className="font-medium">{response.proposalItem?.name || 'N/A'}</div>
                                <div className="text-sm text-gray-600">Цена</div>
                                <div className="font-semibold">${(response.proposalItem?.cost || 0).toLocaleString()} UZS</div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() => selectWinner(tenderItem.id, response.proposalId)}
                                  variant={selectedWinner === response.proposalId ? "default" : "outline"}
                                >
                                  {selectedWinner === response.proposalId ? (
                                    <>
                                      <CheckCircle2 className="w-4 h-4 mr-1" />
                                      Selected
                                    </>
                                  ) : (
                                    'Select Winner'
                                  )}
                                </Button>
                                <button className="text-gray-400 hover:text-gray-600">
                                  <ExternalLink className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TenderAnalytics;
