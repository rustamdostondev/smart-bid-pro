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
  Medal
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

  const renderDetailed = () => {
    const selectedResult = analysisResults.find(r => r.proposalId === selectedProposal) || analysisResults[0];
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Detailed Analysis: {selectedResult.company}</h3>
          <select 
            className="border rounded px-3 py-1"
            value={selectedResult.proposalId}
            onChange={(e) => setSelectedProposal(e.target.value)}
          >
            {analysisResults.map(result => (
              <option key={result.proposalId} value={result.proposalId}>
                {result.company} (Rank #{result.rank})
              </option>
            ))}
          </select>
        </div>

        {/* Overall Score */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Overall Match Score</h4>
            <div className={`px-4 py-2 rounded-lg text-lg font-bold ${getMatchColor(selectedResult.overallMatch)}`}>
              {selectedResult.overallMatch}%
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${selectedResult.overallMatch}%` }}
            />
          </div>
        </Card>

        {/* Item-by-Item Analysis */}
        <Card className="p-6">
          <h4 className="font-medium mb-4">Item-by-Item Analysis</h4>
          <div className="space-y-4">
            {selectedResult.itemMatches.map((match, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium">{match.tenderItemName}</h5>
                  <div className={`px-2 py-1 rounded text-sm font-medium ${getMatchColor(match.matchPercentage)}`}>
                    {match.matchPercentage}%
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Matched with: <span className="font-medium">{match.proposalItemName}</span>
                </p>
                <p className="text-sm text-gray-700 mb-2">{match.reasoning}</p>
                {match.costDifference !== 0 && (
                  <p className={`text-sm ${match.costDifference > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    Cost difference: {match.costDifference > 0 ? '+' : ''}${match.costDifference.toLocaleString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h4 className="font-medium mb-4 text-green-700 flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Strengths
            </h4>
            <ul className="space-y-2">
              {selectedResult.strengths.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{strength}</span>
                </li>
              ))}
            </ul>
          </Card>
          
          <Card className="p-6">
            <h4 className="font-medium mb-4 text-red-700 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Areas for Consideration
            </h4>
            <ul className="space-y-2">
              {selectedResult.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start">
                  <AlertCircle className="w-4 h-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{weakness}</span>
                </li>
              ))}
            </ul>
          </Card>
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
