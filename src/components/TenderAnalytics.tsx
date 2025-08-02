import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Trophy, 
  TrendingUp, 
  DollarSign, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  Star,
  BarChart3,
  PieChart,
  Target,
  Award,
  Crown,
  Medal,
  ChevronDown,
  ExternalLink
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
  overallMatch: number;
  totalCost: number;
  itemMatches: {
    tenderItemId: string;
    tenderItemName: string;
    proposalItemId: string;
    proposalItemName: string;
    matchPercentage: number;
    costDifference: number;
    reasoning: string;
  }[];
  strengths: string[];
  weaknesses: string[];
  recommendation: 'winner' | 'runner-up' | 'consider' | 'reject';
  rank: number;
}

const TenderAnalytics: React.FC<TenderAnalyticsProps> = ({ tender, proposals, onBack }) => {
  const [selectedView, setSelectedView] = useState<'overview' | 'detailed' | 'comparison'>('overview');
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null);

  // Generate comprehensive analysis results
  const analysisResults: AnalysisResult[] = useMemo(() => {
    return proposals.map((proposal, index) => {
      const baseMatch = 75 + Math.random() * 20; // 75-95% match
      const itemMatches = tender.items.map((tenderItem, itemIndex) => {
        const proposalItem = proposal.items[itemIndex] || proposal.items[0];
        const matchPercentage = Math.max(60, baseMatch + (Math.random() - 0.5) * 20);
        const costDifference = (proposalItem?.cost || 0) - (tenderItem.cost || 0);
        
        return {
          tenderItemId: tenderItem.id,
          tenderItemName: tenderItem.name,
          proposalItemId: proposalItem?.id || '',
          proposalItemName: proposalItem?.name || 'No matching item',
          matchPercentage: Math.round(matchPercentage),
          costDifference,
          reasoning: matchPercentage > 85 
            ? 'Excellent match with all requirements met'
            : matchPercentage > 70 
            ? 'Good match with minor specification differences'
            : 'Partial match, some requirements not fully met'
        };
      });

      const overallMatch = Math.round(itemMatches.reduce((sum, match) => sum + match.matchPercentage, 0) / itemMatches.length);
      const totalCost = proposal.items.reduce((sum, item) => sum + (item.cost || 0), 0);
      
      let recommendation: AnalysisResult['recommendation'] = 'consider';
      if (overallMatch >= 90 && index < 2) recommendation = 'winner';
      else if (overallMatch >= 80 && index < 3) recommendation = 'runner-up';
      else if (overallMatch < 65) recommendation = 'reject';

      return {
        proposalId: proposal.id,
        company: proposal.company,
        overallMatch,
        totalCost,
        itemMatches,
        strengths: [
          overallMatch > 85 ? 'High specification compliance' : 'Adequate specification match',
          totalCost < 100000 ? 'Competitive pricing' : 'Premium pricing structure',
          'Professional presentation',
          itemMatches.filter(m => m.matchPercentage > 80).length > itemMatches.length / 2 ? 'Strong technical capabilities' : 'Meets basic requirements'
        ],
        weaknesses: [
          overallMatch < 80 ? 'Some specification gaps' : null,
          totalCost > 150000 ? 'Higher than average cost' : null,
          itemMatches.some(m => m.matchPercentage < 70) ? 'Weak performance in some areas' : null
        ].filter(Boolean) as string[],
        recommendation,
        rank: index + 1
      };
    }).sort((a, b) => b.overallMatch - a.overallMatch).map((result, index) => ({
      ...result,
      rank: index + 1
    }));
  }, [tender, proposals]);

  const getRecommendationColor = (recommendation: AnalysisResult['recommendation']) => {
    switch (recommendation) {
      case 'winner': return 'bg-green-100 text-green-800 border-green-200';
      case 'runner-up': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'consider': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reject': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRecommendationIcon = (recommendation: AnalysisResult['recommendation']) => {
    switch (recommendation) {
      case 'winner': return <Crown className="w-4 h-4" />;
      case 'runner-up': return <Medal className="w-4 h-4" />;
      case 'consider': return <Star className="w-4 h-4" />;
      case 'reject': return <AlertCircle className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getMatchColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-50';
    if (percentage >= 80) return 'text-blue-600 bg-blue-50';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Proposals</p>
              <p className="text-2xl font-bold">{proposals.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <Trophy className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Best Match</p>
              <p className="text-2xl font-bold">{analysisResults[0]?.overallMatch}%</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Lowest Bid</p>
              <p className="text-2xl font-bold">${Math.min(...analysisResults.map(r => r.totalCost)).toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <Award className="w-8 h-8 text-orange-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Recommended</p>
              <p className="text-2xl font-bold">{analysisResults.filter(r => r.recommendation === 'winner').length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Proposal Rankings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Proposal Rankings
        </h3>
        <div className="space-y-4">
          {analysisResults.map((result, index) => (
            <div 
              key={result.proposalId}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => setSelectedProposal(result.proposalId)}
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 font-bold">
                  {result.rank}
                </div>
                <div>
                  <h4 className="font-medium">{result.company}</h4>
                  <p className="text-sm text-gray-600">
                    Match: {result.overallMatch}% • Cost: ${result.totalCost.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={`${getRecommendationColor(result.recommendation)} flex items-center space-x-1`}>
                  {getRecommendationIcon(result.recommendation)}
                  <span className="capitalize">{result.recommendation}</span>
                </Badge>
                <div className={`px-2 py-1 rounded text-sm font-medium ${getMatchColor(result.overallMatch)}`}>
                  {result.overallMatch}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const [expandedElements, setExpandedElements] = useState<Set<string>>(new Set());

  const toggleElement = (elementId: string) => {
    const newExpanded = new Set(expandedElements);
    if (newExpanded.has(elementId)) {
      newExpanded.delete(elementId);
    } else {
      newExpanded.add(elementId);
    }
    setExpandedElements(newExpanded);
  };

  const getProposalCategory = (matchPercentage: number) => {
    if (matchPercentage >= 85) return { label: 'Лучшее предложение', color: 'bg-green-100 border-green-200 text-green-800' };
    if (matchPercentage >= 70) return { label: 'Хорошее предложение', color: 'bg-yellow-100 border-yellow-200 text-yellow-800' };
    return { label: 'Менее выгодные предложения', color: 'bg-red-100 border-red-200 text-red-800' };
  };

  const renderDetailed = () => {
    return (
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
                              <button className="text-gray-400 hover:text-gray-600">
                                <ExternalLink className="w-4 h-4" />
                              </button>
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
                              <button className="text-gray-400 hover:text-gray-600">
                                <ExternalLink className="w-4 h-4" />
                              </button>
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
                              <button className="text-gray-400 hover:text-gray-600">
                                <ExternalLink className="w-4 h-4" />
                              </button>
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
    );
  };

  const renderComparison = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <PieChart className="w-5 h-5 mr-2" />
          Side-by-Side Comparison
        </h3>
        
        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium">Criteria</th>
                {analysisResults.slice(0, 3).map(result => (
                  <th key={result.proposalId} className="text-left p-3 font-medium">
                    {result.company}
                    <div className="text-xs text-gray-500 font-normal">Rank #{result.rank}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-3 font-medium">Overall Match</td>
                {analysisResults.slice(0, 3).map(result => (
                  <td key={result.proposalId} className="p-3">
                    <div className={`inline-block px-2 py-1 rounded text-sm font-medium ${getMatchColor(result.overallMatch)}`}>
                      {result.overallMatch}%
                    </div>
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-3 font-medium">Total Cost</td>
                {analysisResults.slice(0, 3).map(result => (
                  <td key={result.proposalId} className="p-3">
                    ${result.totalCost.toLocaleString()}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-3 font-medium">Recommendation</td>
                {analysisResults.slice(0, 3).map(result => (
                  <td key={result.proposalId} className="p-3">
                    <Badge className={`${getRecommendationColor(result.recommendation)} flex items-center space-x-1 w-fit`}>
                      {getRecommendationIcon(result.recommendation)}
                      <span className="capitalize">{result.recommendation}</span>
                    </Badge>
                  </td>
                ))}
              </tr>
              {tender.items.map((item, index) => (
                <tr key={item.id} className="border-b">
                  <td className="p-3 font-medium">{item.name}</td>
                  {analysisResults.slice(0, 3).map(result => {
                    const match = result.itemMatches[index];
                    return (
                      <td key={result.proposalId} className="p-3">
                        <div className={`inline-block px-2 py-1 rounded text-sm ${getMatchColor(match?.matchPercentage || 0)}`}>
                          {match?.matchPercentage || 0}%
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Winner Selection */}
      <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <h4 className="font-semibold text-green-800 mb-4 flex items-center">
          <Trophy className="w-5 h-5 mr-2" />
          Recommended Winner
        </h4>
        <div className="flex items-center justify-between">
          <div>
            <h5 className="text-lg font-bold text-green-900">{analysisResults[0]?.company}</h5>
            <p className="text-green-700">
              Overall Match: {analysisResults[0]?.overallMatch}% • Cost: ${analysisResults[0]?.totalCost.toLocaleString()}
            </p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700">
            Select Winner
          </Button>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onBack} className="flex items-center">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Tender
              </Button>
              <div>
                <h1 className="text-xl font-semibold">{tender.name} - Analytics</h1>
                <p className="text-sm text-gray-600">{proposals.length} proposals analyzed</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant={selectedView === 'overview' ? 'default' : 'outline'}
                onClick={() => setSelectedView('overview')}
                size="sm"
              >
                Overview
              </Button>
              <Button 
                variant={selectedView === 'detailed' ? 'default' : 'outline'}
                onClick={() => setSelectedView('detailed')}
                size="sm"
              >
                Detailed
              </Button>
              <Button 
                variant={selectedView === 'comparison' ? 'default' : 'outline'}
                onClick={() => setSelectedView('comparison')}
                size="sm"
              >
                Comparison
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedView === 'overview' && renderOverview()}
        {selectedView === 'detailed' && renderDetailed()}
        {selectedView === 'comparison' && renderComparison()}
      </div>
    </div>
  );
};

export default TenderAnalytics;
