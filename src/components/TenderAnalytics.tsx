import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ChevronDown,
  ExternalLink,
  Trophy,
  CheckCircle2,
  Crown,
  AlertTriangle,
  Package,
  X,
  Download,
} from "lucide-react";
import { Tender, Proposal } from "@/lib/mockData";

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

const TenderAnalytics: React.FC<TenderAnalyticsProps> = ({
  tender,
  proposals,
  onBack,
  onViewProposalDetail,
}) => {
  const [selectedWinners, setSelectedWinners] = useState<
    Record<string, string>
  >({});
  const [showWinnersList, setShowWinnersList] = useState(false);
  const [expandedElements, setExpandedElements] = useState<Set<string>>(
    new Set()
  );

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Number of tender elements to show per page

  // Calculate pagination values
  const totalItems = tender.items.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Reset expanded elements when changing pages
    setExpandedElements(new Set());
    // Scroll to top of the analysis section
    document
      .getElementById("analysis-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  // Generate comprehensive analysis results
  const analysisResults: AnalysisResult[] = useMemo(() => {
    return proposals
      .map((proposal, index) => {
        const rank = index + 1;
        const overallMatch = Math.floor(Math.random() * 20) + 75; // 75-95%

        // Generate item matches for each tender item
        const itemMatches = tender.items.map((tenderItem, itemIndex) => {
          const proposalItem = proposal.items[itemIndex];
          const matchPercentage = Math.floor(Math.random() * 25) + 70; // 70-95%

          const reasons = [
            `Excellent match for ${tenderItem.name} specifications`,
            `High quality ${
              proposalItem?.name || "item"
            } meets all requirements`,
            `Competitive pricing with good value proposition`,
            `Strong technical specifications alignment`,
            `Reliable supplier with proven track record`,
          ];

          return {
            tenderItemName: tenderItem.name,
            proposalItemName: proposalItem?.name || `Item ${itemIndex + 1}`,
            matchPercentage,
            reasoning: reasons[Math.floor(Math.random() * reasons.length)],
            costDifference: proposalItem
              ? proposalItem.cost - (tenderItem.estimatedCost || 0)
              : 0,
          };
        });

        return {
          proposalId: proposal.id,
          company: proposal.company || `Company ${index + 1}`,
          rank,
          overallMatch,
          itemMatches,
        };
      })
      .sort((a, b) => b.overallMatch - a.overallMatch);
  }, [proposals, tender.items]);

  const getMatchColor = (percentage: number) => {
    if (percentage >= 90) return "bg-green-100 text-green-800";
    if (percentage >= 80) return "bg-blue-100 text-blue-800";
    if (percentage >= 70) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
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
    setSelectedWinners((prev) => ({
      ...prev,
      [elementId]: proposalId,
    }));
  };

  const getSelectedWinnersList = () => {
    return Object.entries(selectedWinners).map(([elementId, proposalId]) => {
      const element = tender.items.find((item) => item.id === elementId);
      const proposal = proposals.find((p) => p.id === proposalId);
      return {
        elementName: element?.name || "Unknown Element",
        company: proposal?.companyName || "Unknown Company",
        proposalId,
      };
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => {
              console.log("Back button clicked");
              if (typeof onBack === "function") {
                onBack();
              }
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tender
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{tender.name}</h1>
            <p className="text-gray-600">Detailed Proposal Analysis</p>
          </div>
        </div>

        {/* <div className="flex items-center space-x-4">
          <Button
            onClick={() => setShowWinnersList(!showWinnersList)}
            variant={showWinnersList ? "default" : "outline"}
          >
            <Trophy className="w-4 h-4 mr-2" />
            {showWinnersList ? "Hide Winners" : "Show Winners"} (
            {Object.keys(selectedWinners).length})
          </Button>
        </div> */}
      </div>

      {/* Element-by-Element Analysis */}
      <div id="analysis-section" className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Element-by-Element Analysis</h3>
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1}-{endIndex} of {tender.items.length} tender
            elements
          </div>
        </div>

        {/* Element-by-Element Collapsible Sections */}
        <div className="space-y-3">
          {tender.items
            .slice(startIndex, endIndex)
            .map((tenderItem, paginatedIndex) => {
              const itemIndex = startIndex + paginatedIndex; // Calculate the actual index in the full array
              // Get all proposal responses for this tender item
              const proposalResponses = analysisResults
                .map((result) => {
                  const match = result.itemMatches[itemIndex];
                  const proposalItem = proposals.find(
                    (p) => p.id === result.proposalId
                  )?.items[itemIndex];
                  return {
                    company: result.company,
                    proposalId: result.proposalId,
                    rank: result.rank,
                    matchPercentage: match?.matchPercentage || 0,
                    proposalItemName:
                      match?.proposalItemName || "No matching item",
                    proposalItem: proposalItem,
                    reasoning: match?.reasoning || "No analysis available",
                    costDifference: match?.costDifference || 0,
                    overallMatch: result.overallMatch,
                  };
                })
                .sort((a, b) => b.matchPercentage - a.matchPercentage);

              // Group proposals by category with simplified color scheme
              const highMatchProposals = proposalResponses.filter(
                (r) => r.matchPercentage >= 85
              ); // Green
              const mediumMatchProposals = proposalResponses.filter(
                (r) => r.matchPercentage >= 70 && r.matchPercentage < 85
              ); // Orange
              const lowMatchProposals = proposalResponses.filter(
                (r) => r.matchPercentage < 70
              ); // Red

              const isExpanded = expandedElements.has(tenderItem.id);
              const selectedWinner = selectedWinners[tenderItem.id];

              return (
                <div
                  key={tenderItem.id}
                  className="border border-gray-200 rounded-lg"
                >
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
                        {proposalResponses.length} proposals • Budget: $
                        {(tenderItem.estimatedCost || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Best Match</div>
                        <div
                          className={`px-2 py-1 rounded text-sm font-bold ${getMatchColor(
                            proposalResponses[0]?.matchPercentage || 0
                          )}`}
                        >
                          {proposalResponses[0]?.matchPercentage || 0}%
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>
                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-6 pb-6 border-t border-gray-100">
                      {/* Tender Element Details */}
                      <div className="mb-6 pt-4">
                        <p className="text-gray-700 mb-3">
                          {tenderItem.description}
                        </p>
                        <div className="grid grid-cols-3 md:grid-cols-3 gap-3 text-sm">
                          <div>
                            <span className="text-gray-500">Quantity:</span>
                            <p className="font-medium">
                              {tenderItem.quantity} {tenderItem.unit}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Budget:</span>
                            <p className="font-medium">
                              $
                              {(tenderItem.estimatedCost || 0).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Unit:</span>
                            <p className="font-medium">
                              {tenderItem.unit || "units"}
                            </p>
                          </div>
                        </div>

                        {/* Required Specifications */}
                        {Object.keys(tenderItem.attributes || {}).length >
                          0 && (
                          <div className="mt-3">
                            <span className="text-gray-500 text-sm">
                              Required Specifications:
                            </span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {Object.entries(tenderItem.attributes || {}).map(
                                ([key, value]) => (
                                  <span
                                    key={key}
                                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                                  >
                                    {key}: {value}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* High Match Proposals - Green Theme */}
                      {highMatchProposals.length > 0 && (
                        <div className="mb-8">
                          {highMatchProposals.map((response, idx) => {
                            const proposal = proposals.find(
                              (p) => p.id === response.proposalId
                            );
                            return (
                              <div
                                key={response.proposalId}
                                className="bg-white border-2 border-green-300 rounded-2xl p-6 mb-6 shadow-lg hover:shadow-xl transition-all duration-300"
                              >
                                {/* Header with Company and Match Score */}
                                <div className="flex items-center justify-between mb-6">
                                  <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                                      <Crown className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                      <h6 className="text-xl font-bold text-gray-900 mb-1">
                                        {response.company}
                                      </h6>
                                      <div className="flex items-center space-x-3">
                                        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                          {response.matchPercentage}% Match
                                        </div>
                                        <Badge className="bg-green-100 text-green-800 border border-green-200">
                                          Rank #{response.rank}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-3">
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        selectWinner(
                                          tenderItem.id,
                                          response.proposalId
                                        )
                                      }
                                      className={
                                        selectedWinner === response.proposalId
                                          ? "bg-green-600 hover:bg-green-700 text-white shadow-md"
                                          : "bg-white border-2 border-green-500 text-green-600 hover:bg-green-50"
                                      }
                                    >
                                      {selectedWinner ===
                                      response.proposalId ? (
                                        <>
                                          <CheckCircle2 className="w-4 h-4 mr-2" />
                                          Winner Selected
                                        </>
                                      ) : (
                                        "Select as Winner"
                                      )}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        onViewProposalDetail?.(
                                          response.proposalId
                                        )
                                      }
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
                                    <div className="text-sm text-green-600 font-medium mb-1">
                                      Product
                                    </div>
                                    <div className="font-semibold text-gray-900">
                                      {response.proposalItem?.name || "N/A"}
                                    </div>
                                  </div>
                                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                                    <div className="text-sm text-green-600 font-medium mb-1">
                                      Quantity
                                    </div>
                                    <div className="font-semibold text-gray-900">
                                      {response.proposalItem?.quantity || 0}{" "}
                                      units
                                    </div>
                                  </div>
                                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                                    <div className="text-sm text-green-600 font-medium mb-1">
                                      Total Price
                                    </div>
                                    <div className="font-bold text-green-700 text-lg">
                                      $
                                      {(
                                        response.proposalItem?.cost || 0
                                      ).toLocaleString()}
                                    </div>
                                  </div>
                                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                                    <div className="text-sm text-green-600 font-medium mb-1">
                                      Budget Difference
                                    </div>
                                    <div
                                      className={`font-bold text-lg ${
                                        response.costDifference > 0
                                          ? "text-red-600"
                                          : "text-green-600"
                                      }`}
                                    >
                                      {response.costDifference > 0 ? "+" : ""}$
                                      {response.costDifference.toLocaleString()}
                                    </div>
                                  </div>
                                </div>

                                {/* Analysis Reasoning */}
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
                                  <h6 className="font-semibold text-green-800 mb-3 flex items-center">
                                    <div className="w-5 h-5 bg-green-500 rounded-full mr-2 flex items-center justify-center">
                                      <span className="text-white text-xs font-bold">
                                        ✓
                                      </span>
                                    </div>
                                    Why This is Excellent
                                  </h6>
                                  <p className="text-sm text-green-700 leading-relaxed mb-4">
                                    {response.reasoning}
                                  </p>

                                  {/* Technical Specifications */}
                                  {response.proposalItem?.attributes &&
                                    Object.keys(
                                      response.proposalItem.attributes
                                    ).length > 0 && (
                                      <div>
                                        <div className="text-sm text-green-600 font-medium mb-2">
                                          Technical Specifications:
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                          {Object.entries(
                                            response.proposalItem.attributes
                                          ).map(([key, value]) => (
                                            <span
                                              key={key}
                                              className="bg-white text-green-800 px-3 py-1 rounded-full text-xs border border-green-300 font-medium"
                                            >
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
                          {mediumMatchProposals.map((response, idx) => {
                            const proposal = proposals.find(
                              (p) => p.id === response.proposalId
                            );
                            return (
                              <div
                                key={response.proposalId}
                                className="bg-white border-2 border-orange-300 rounded-2xl p-5 mb-5 shadow-md hover:shadow-lg transition-all duration-300"
                              >
                                {/* Header with Company and Match Score */}
                                <div className="flex items-center justify-between mb-5">
                                  <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                                      <Trophy className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                      <h6 className="text-lg font-bold text-gray-900 mb-1">
                                        {response.company}
                                      </h6>
                                      <div className="flex items-center space-x-3">
                                        <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                          {response.matchPercentage}% Match
                                        </div>
                                        <Badge className="bg-orange-100 text-orange-800 border border-orange-200">
                                          Rank #{response.rank}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-3">
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        selectWinner(
                                          tenderItem.id,
                                          response.proposalId
                                        )
                                      }
                                      className={
                                        selectedWinner === response.proposalId
                                          ? "bg-orange-600 hover:bg-orange-700 text-white shadow-md"
                                          : "bg-white border-2 border-orange-500 text-orange-600 hover:bg-orange-50"
                                      }
                                    >
                                      {selectedWinner ===
                                      response.proposalId ? (
                                        <>
                                          <CheckCircle2 className="w-4 h-4 mr-2" />
                                          Winner Selected
                                        </>
                                      ) : (
                                        "Select as Winner"
                                      )}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        onViewProposalDetail?.(
                                          response.proposalId
                                        )
                                      }
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
                                    <div className="text-sm text-orange-600 font-medium mb-1">
                                      Product
                                    </div>
                                    <div className="font-semibold text-gray-900">
                                      {response.proposalItem?.name || "N/A"}
                                    </div>
                                  </div>
                                  <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                                    <div className="text-sm text-orange-600 font-medium mb-1">
                                      Total Price
                                    </div>
                                    <div className="font-bold text-orange-700 text-lg">
                                      $
                                      {(
                                        response.proposalItem?.cost || 0
                                      ).toLocaleString()}
                                    </div>
                                  </div>
                                  <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                                    <div className="text-sm text-orange-600 font-medium mb-1">
                                      Budget Difference
                                    </div>
                                    <div
                                      className={`font-bold text-lg ${
                                        response.costDifference > 0
                                          ? "text-red-600"
                                          : "text-green-600"
                                      }`}
                                    >
                                      {response.costDifference > 0 ? "+" : ""}$
                                      {response.costDifference.toLocaleString()}
                                    </div>
                                  </div>
                                </div>

                                {/* Analysis Reasoning */}
                                <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
                                  <h6 className="font-semibold text-orange-800 mb-2 flex items-center">
                                    <div className="w-5 h-5 bg-orange-500 rounded-full mr-2 flex items-center justify-center">
                                      <span className="text-white text-xs font-bold">
                                        !
                                      </span>
                                    </div>
                                    Analysis Summary
                                  </h6>
                                  <p className="text-sm text-orange-700 leading-relaxed">
                                    {response.reasoning}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Low Match Proposals - Red Theme */}
                      {lowMatchProposals.length > 0 && (
                        <div className="mb-8">
                          {lowMatchProposals.map((response, idx) => {
                            const proposal = proposals.find(
                              (p) => p.id === response.proposalId
                            );
                            return (
                              <div
                                key={response.proposalId}
                                className="bg-white border-2 border-red-300 rounded-2xl p-5 mb-5 shadow-md hover:shadow-lg transition-all duration-300"
                              >
                                {/* Header with Company and Match Score */}
                                <div className="flex items-center justify-between mb-5">
                                  <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-md">
                                      <AlertTriangle className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                      <h6 className="text-lg font-bold text-gray-900 mb-1">
                                        {response.company}
                                      </h6>
                                      <div className="flex items-center space-x-3">
                                        <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                          {response.matchPercentage}% Match
                                        </div>
                                        <Badge className="bg-red-100 text-red-800 border border-red-200">
                                          Rank #{response.rank}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-3">
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        selectWinner(
                                          tenderItem.id,
                                          response.proposalId
                                        )
                                      }
                                      className={
                                        selectedWinner === response.proposalId
                                          ? "bg-red-600 hover:bg-red-700 text-white shadow-md"
                                          : "bg-white border-2 border-red-500 text-red-600 hover:bg-red-50"
                                      }
                                    >
                                      {selectedWinner ===
                                      response.proposalId ? (
                                        <>
                                          <CheckCircle2 className="w-4 h-4 mr-2" />
                                          Winner Selected
                                        </>
                                      ) : (
                                        "Select as Winner"
                                      )}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        onViewProposalDetail?.(
                                          response.proposalId
                                        )
                                      }
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
                                    <div className="text-sm text-red-600 font-medium mb-1">
                                      Product
                                    </div>
                                    <div className="font-semibold text-gray-900">
                                      {response.proposalItem?.name || "N/A"}
                                    </div>
                                  </div>
                                  <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                                    <div className="text-sm text-red-600 font-medium mb-1">
                                      Total Price
                                    </div>
                                    <div className="font-bold text-red-700 text-lg">
                                      $
                                      {(
                                        response.proposalItem?.cost || 0
                                      ).toLocaleString()}
                                    </div>
                                  </div>
                                  <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                                    <div className="text-sm text-red-600 font-medium mb-1">
                                      Budget Difference
                                    </div>
                                    <div
                                      className={`font-bold text-lg ${
                                        response.costDifference > 0
                                          ? "text-red-600"
                                          : "text-green-600"
                                      }`}
                                    >
                                      {response.costDifference > 0 ? "+" : ""}$
                                      {response.costDifference.toLocaleString()}
                                    </div>
                                  </div>
                                </div>

                                {/* Analysis Reasoning */}
                                <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-xl p-4 border border-red-200">
                                  <h6 className="font-semibold text-red-800 mb-2 flex items-center">
                                    <div className="w-5 h-5 bg-red-500 rounded-full mr-2 flex items-center justify-center">
                                      <span className="text-white text-xs font-bold">
                                        !
                                      </span>
                                    </div>
                                    Analysis Summary
                                  </h6>
                                  <p className="text-sm text-red-700 leading-relaxed">
                                    {response.reasoning}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-8 flex flex-col items-center justify-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <span className="sr-only">First Page</span>
                <ChevronDown className="h-4 w-4 rotate-90" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <span className="sr-only">Previous Page</span>
                <ChevronDown className="h-4 w-4 -rotate-90" />
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className={`h-8 w-8 p-0 ${
                      currentPage === page
                        ? "bg-blue-600 hover:bg-blue-700"
                        : ""
                    }`}
                  >
                    {page}
                  </Button>
                )
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
              >
                <span className="sr-only">Next Page</span>
                <ChevronDown className="h-4 w-4 rotate-90" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
              >
                <span className="sr-only">Last Page</span>
                <ChevronDown className="h-4 w-4 -rotate-90" />
              </Button>
            </div>

            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages} • {tender.items.length} total
              elements
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Winners Summary */}
      {Object.keys(selectedWinners).length > 0 ? (
        <div className="bg-gradient-to-br mt-20 via-emerald-50 to-green-100 border-2 border-green-200 rounded-2xl p-8 shadow-lg">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-green-800 mb-1">
                  Selected Winners
                </h3>
                <p className="text-green-600 font-medium">
                  {Object.keys(selectedWinners).length} of {tender.items.length}{" "}
                  elements have winners selected
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-white rounded-xl p-4 border border-green-200 shadow-sm">
                <div className="text-sm text-green-600 font-medium mb-1">
                  Completion Rate
                </div>
                <div className="text-2xl font-bold text-green-700">
                  {Math.round(
                    (Object.keys(selectedWinners).length /
                      tender.items.length) *
                      100
                  )}
                  %
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-700">
                Selection Progress
              </span>
              <span className="text-sm text-green-600">
                {Object.keys(selectedWinners).length} / {tender.items.length}{" "}
                completed
              </span>
            </div>
            <div className="w-full bg-green-200 rounded-full h-3 shadow-inner">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500 shadow-sm"
                style={{
                  width: `${
                    (Object.keys(selectedWinners).length /
                      tender.items.length) *
                    100
                  }%`,
                }}
              ></div>
            </div>
          </div>

          {/* Winners Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {getSelectedWinnersList().map((winner, index) => {
              const tenderElement = tender.items.find(
                (item) => item.name === winner.elementName
              );
              const winnerProposal = proposals.find(
                (p) => p.id === selectedWinners[tenderElement?.id || ""]
              );
              const proposalItem = winnerProposal?.items.find(
                (item) =>
                  item.name
                    .toLowerCase()
                    .includes(winner.elementName.toLowerCase()) ||
                  winner.elementName
                    .toLowerCase()
                    .includes(item.name.toLowerCase())
              );
              const savings = (tenderElement?.estimatedCost || 0) - (proposalItem?.cost || 0);

              return (
                <div key={index} className="bg-white rounded-xl p-5 border border-green-200 shadow-md hover:shadow-lg transition-shadow">
                  {/* Winner Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                        <Crown className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{winner.company}</h4>
                        <Badge className="bg-green-100 text-green-800 text-xs">WINNER</Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (tenderElement?.id) {
                          const newWinners = { ...selectedWinners };
                          delete newWinners[tenderElement.id];
                          setSelectedWinners(newWinners);
                        }
                      }}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Essential Info */}
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Element:</span>
                      <div className="font-semibold text-gray-900">{tenderElement?.name}</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Bid Price:</span>
                        <div className="font-bold text-lg text-gray-900">
                          ${proposalItem?.cost?.toLocaleString() || '0'}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Savings:</span>
                        <div className={`font-bold text-lg ${
                          savings >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {savings >= 0 ? '+' : ''}${savings.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-4">
                    <Button
                      onClick={() => onViewProposalDetail?.(selectedWinners[tenderElement?.id || ""])}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                      size="sm"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Actions */}
          <div className="mt-8 pt-6 border-t border-green-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-green-700">
                <span className="font-medium">Total Selected Value:</span>
                <span className="font-bold text-lg text-green-800">
                  $
                  {getSelectedWinnersList()
                    .reduce((total, winner) => {
                      const tenderElement = tender.items.find(
                        (item) => item.name === winner.elementName
                      );
                      const winnerProposal = proposals.find(
                        (p) => p.id === selectedWinners[tenderElement?.id || ""]
                      );
                      const proposalItem = winnerProposal?.items.find((item) =>
                        item.name
                          .toLowerCase()
                          .includes(winner.elementName.toLowerCase())
                      );
                      return total + (proposalItem?.cost || 0);
                    }, 0)
                    .toLocaleString()}
                </span>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedWinners({})}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Winners
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Card className="p-8 text-center border-2 border-dashed border-gray-300">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No Winners Selected Yet
          </h3>
          <p className="text-gray-500 mb-4">
            Start selecting winners for each tender element to see the summary
            here.
          </p>
          <Badge variant="outline" className="text-gray-500">
            0 of {tender.items.length} elements completed
          </Badge>
        </Card>
      )}
    </div>
  );
};

export default TenderAnalytics;
