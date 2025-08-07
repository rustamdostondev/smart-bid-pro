import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  FileText,
  Shield,
  Code,
  Brain,
  Target,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  DollarSign,
  Calendar,
  User,
  Building,
  Mail,
  Phone,
  MapPin,
  Package,
  Link,
} from "lucide-react";
import {
  mockProposals,
  mockTenders,
  getCurrentUser,
  type ProposalItem,
  type TenderItem,
} from "@/lib/mockData";

interface ProcessingStep {
  id: string;
  name: string;
  description: string;
  status: "pending" | "running" | "completed" | "failed";
  icon: any;
}

interface Connection {
  proposalItemId: string;
  tenderItemId: string;
  id: string;
}

interface ProposalTenderMatcherProps {
  proposalItems: ProposalItem[];
  tenderItems: TenderItem[];
}

// ProposalTenderMatcher Component
function ProposalTenderMatcher({
  proposalItems,
  tenderItems,
}: ProposalTenderMatcherProps) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });

  // Initialize with multiple default connections to demonstrate the matching interface
  useEffect(() => {
    if (proposalItems.length > 0 && tenderItems.length > 0) {
      const defaultConnections: Connection[] = [
        // Connect first proposal item to first tender item
        {
          id: "conn-1",
          proposalItemId: proposalItems[0]?.id || "",
          tenderItemId: tenderItems[0]?.id || "",
        },
        // Connect second proposal item to second tender item (if they exist)
        ...(proposalItems.length > 1 && tenderItems.length > 1
          ? [
              {
                id: "conn-2",
                proposalItemId: proposalItems[1]?.id || "",
                tenderItemId: tenderItems[1]?.id || "",
              },
            ]
          : []),
        // Connect third proposal item to third tender item (if they exist)
        ...(proposalItems.length > 2 && tenderItems.length > 2
          ? [
              {
                id: "conn-3",
                proposalItemId: proposalItems[2]?.id || "",
                tenderItemId: tenderItems[2]?.id || "",
              },
            ]
          : []),
      ];
      setConnections(defaultConnections);
    }
  }, [proposalItems, tenderItems]);

  // Update SVG dimensions when container resizes
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setSvgDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const handleProposalClick = (proposalId: string) => {
    setSelectedProposal(proposalId);
  };

  const handleTenderClick = (tenderId: string) => {
    if (!selectedProposal) return;

    // Check if connection already exists
    const existingConnection = connections.find(
      (c) =>
        c.proposalItemId === selectedProposal || c.tenderItemId === tenderId
    );

    if (existingConnection) {
      // Remove existing connection
      setConnections(connections.filter((c) => c.id !== existingConnection.id));
    }

    // Add new connection
    const newConnection: Connection = {
      id: `conn-${Date.now()}`,
      proposalItemId: selectedProposal,
      tenderItemId: tenderId,
    };

    setConnections([
      ...connections.filter(
        (c) =>
          c.proposalItemId !== selectedProposal && c.tenderItemId !== tenderId
      ),
      newConnection,
    ]);

    setSelectedProposal(null);
  };

  const removeConnection = (connectionId: string) => {
    setConnections(connections.filter((c) => c.id !== connectionId));
  };

  const getConnectionPath = (proposalId: string, tenderId: string) => {
    const proposalEl = document.getElementById(`proposal-${proposalId}`);
    const tenderEl = document.getElementById(`tender-${tenderId}`);
    const containerEl = containerRef.current;

    if (!proposalEl || !tenderEl || !containerEl) return "";

    const containerRect = containerEl.getBoundingClientRect();
    const proposalRect = proposalEl.getBoundingClientRect();
    const tenderRect = tenderEl.getBoundingClientRect();

    const startX = proposalRect.right - containerRect.left;
    const startY =
      proposalRect.top + proposalRect.height / 2 - containerRect.top;
    const endX = tenderRect.left - containerRect.left;
    const endY = tenderRect.top + tenderRect.height / 2 - containerRect.top;

    return `M ${startX} ${startY} L ${endX} ${endY}`;
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="grid grid-cols-2 gap-8 min-h-[400px]">
        {/* Proposal Items - Left Side */}
        <div>
          <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-600" />
            Proposal Items ({proposalItems.length})
          </h4>
          <div className="space-y-3">
            {proposalItems.map((item) => {
              const isSelected = selectedProposal === item.id;
              const isConnected = connections.some(
                (c) => c.proposalItemId === item.id
              );

              return (
                <div
                  key={item.id}
                  id={`proposal-${item.id}`}
                  onClick={() => handleProposalClick(item.id)}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? "bg-blue-50 border-blue-300 shadow-md"
                      : isConnected
                      ? "bg-green-50 border-green-300"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 text-sm">
                        {item.name}
                      </h5>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>Qty: {item.quantity}</span>
                        <span className="font-medium text-green-600">
                          ${item.cost.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {isConnected && (
                      <div className="ml-2">
                        <Link className="w-4 h-4 text-green-600" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tender Items - Right Side */}
        <div>
          <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-orange-600" />
            Tender Requirements ({tenderItems.length})
          </h4>
          <div className="space-y-3">
            {tenderItems.map((item) => {
              const isConnected = connections.some(
                (c) => c.tenderItemId === item.id
              );

              return (
                <div
                  key={item.id}
                  id={`tender-${item.id}`}
                  onClick={() => handleTenderClick(item.id)}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    isConnected
                      ? "bg-green-50 border-green-300"
                      : selectedProposal
                      ? "bg-orange-50 border-orange-300 hover:bg-orange-100"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 text-sm">
                        {item.name}
                      </h5>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>Qty: {item.quantity}</span>
                        <span className="font-medium text-orange-600">
                          ${item.estimatedCost?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {isConnected && (
                      <div className="ml-2">
                        <Link className="w-4 h-4 text-green-600" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SVG for drawing connection lines */}
      <svg
        className="absolute top-0 left-0 pointer-events-none"
        width={svgDimensions.width}
        height={svgDimensions.height}
        style={{ zIndex: 1 }}
      >
        {connections.map((connection) => {
          const path = getConnectionPath(
            connection.proposalItemId,
            connection.tenderItemId
          );
          if (!path) return null;

          return (
            <g key={connection.id}>
              <path
                d={path}
                stroke="#10b981"
                strokeWidth="2"
                fill="none"
                markerEnd="url(#arrowhead)"
              />
              {/* Remove button positioned at the middle of the line */}
              <circle
                cx={path.split(" ")[4]} // Approximate middle X
                cy={path.split(" ")[5]} // Approximate middle Y
                r="8"
                fill="#ef4444"
                className="cursor-pointer"
                style={{ pointerEvents: "all" }}
                onClick={() => removeConnection(connection.id)}
              />
              <text
                x={path.split(" ")[4]}
                y={path.split(" ")[5]}
                textAnchor="middle"
                dominantBaseline="central"
                fill="white"
                fontSize="10"
                className="cursor-pointer"
                style={{ pointerEvents: "all" }}
                onClick={() => removeConnection(connection.id)}
              >
                ✕
              </text>
            </g>
          );
        })}

        {/* Arrow marker definition */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
          </marker>
        </defs>
      </svg>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Target className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h5 className="font-medium text-blue-900 mb-1">
              How to create matches:
            </h5>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Click on a proposal item (left side) to select it</li>
              <li>
                2. Click on a tender requirement (right side) to create a match
              </li>
              <li>
                3. Click the red ✕ button on a line to remove the connection
              </li>
            </ol>
            <p className="text-xs text-blue-700 mt-2">
              Connected items: {connections.length} | Proposal coverage:{" "}
              {Math.round(
                (connections.length / Math.max(proposalItems.length, 1)) * 100
              )}
              %
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProposalOwnerDetailProps {
  proposalId: string;
  onBack: () => void;
}

export function ProposalOwnerDetail({
  proposalId,
  onBack,
}: ProposalOwnerDetailProps) {
  const user = getCurrentUser();
  const proposal = mockProposals.find((p) => p.id === proposalId);
  const tender = proposal
    ? mockTenders.find((t) => t.id === proposal.tenderIds)
    : null;
  const [selectedStep, setSelectedStep] = useState("file_processing");
  const [proposalItems, setProposalItems] = useState<ProposalItem[]>(
    proposal?.items || []
  );
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<Partial<ProposalItem>>({});
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterByStatus, setFilterByStatus] = useState<
    "all" | "matched" | "unmatched"
  >("all");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!proposal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Proposal Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The requested proposal could not be found.
          </p>
          <Button onClick={onBack}>Go Back</Button>
        </div>
      </div>
    );
  }

  const steps: ProcessingStep[] = [
    {
      id: "file_processing",
      name: "File Upload",
      description: "Upload and validate proposal document",
      status:
        proposal.fileProcessing?.parsing === "completed"
          ? "completed"
          : proposal.fileProcessing?.parsing === "progress"
          ? "running"
          : "pending",
      icon: FileText,
    },
    {
      id: "signature_verification",
      name: "Signature Check",
      description: "Verify digital signatures",
      status: "completed",
      icon: Shield,
    },
    {
      id: "ai_parsing",
      name: "Proposal Items Management",
      description: "Extract and structure tender data",
      status: "running",
      icon: Code,
    },
    {
      id: "proposal_matching",
      name: "Tender Matching",
      description: "Match proposal items with tender requirements",
      status:
        proposal.fileProcessing?.matching === "completed"
          ? "completed"
          : proposal.fileProcessing?.matching === "progress"
          ? "running"
          : "pending",
      icon: Target,
    },
  ];

  const currentStep = steps.find((step) => step.id === selectedStep);

  const getStepIcon = (step: ProcessingStep) => {
    const IconComponent = step.icon;
    const baseClasses = "w-5 h-5";

    if (step.status === "completed") {
      return <CheckCircle className={`${baseClasses} text-green-500`} />;
    } else if (step.status === "running") {
      return <Clock className={`${baseClasses} text-blue-500 animate-spin`} />;
    } else if (step.status === "failed") {
      return <XCircle className={`${baseClasses} text-red-500`} />;
    } else {
      return <IconComponent className={`${baseClasses} text-gray-400`} />;
    }
  };

  const getStepBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            Completed
          </Badge>
        );
      case "running":
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200 animate-pulse">
            In Progress
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            Failed
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-700 border-gray-200">
            Pending
          </Badge>
        );
    }
  };

  const validateItem = (
    item: Partial<ProposalItem>
  ): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!item.name?.trim()) errors.name = "Item name is required";
    if (!item.description?.trim())
      errors.description = "Description is required";
    if (!item.quantity || item.quantity <= 0)
      errors.quantity = "Quantity must be greater than 0";
    if (!item.cost || item.cost <= 0)
      errors.cost = "Cost must be greater than 0";
    return errors;
  };

  const handleAddItem = async () => {
    const validationErrors = validateItem(newItem);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        const item: ProposalItem = {
          id: `item_${Date.now()}`,
          name: newItem.name!,
          description: newItem.description!,
          quantity: newItem.quantity!,
          cost: newItem.cost!,
          attributes: newItem.attributes || {},
        };
        setProposalItems([...proposalItems, item]);
        setNewItem({});
        setIsAddingItem(false);
        setErrors({});
      } catch (error) {
        setErrors({ general: "Failed to add item. Please try again." });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEditItem = async (
    itemId: string,
    updatedItem: Partial<ProposalItem>
  ) => {
    const validationErrors = validateItem(updatedItem);
    if (Object.keys(validationErrors).length === 0) {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 300));

        setProposalItems((items) =>
          items.map((item) =>
            item.id === itemId ? { ...item, ...updatedItem } : item
          )
        );
        setEditingItem(null);
      } catch (error) {
        setErrors({ general: "Failed to update item. Please try again." });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this item? This action cannot be undone."
      )
    ) {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 300));
        setProposalItems((items) => items.filter((item) => item.id !== itemId));
      } catch (error) {
        setErrors({ general: "Failed to delete item. Please try again." });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Filter and search items
  const filteredItems = proposalItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterByStatus === "all" ||
      (filterByStatus === "matched" && item.matchedTenderId) ||
      (filterByStatus === "unmatched" && !item.matchedTenderId);
    return matchesSearch && matchesFilter;
  });

  const totalCost = proposalItems.reduce(
    (sum, item) => sum + item.cost * item.quantity,
    0
  );
  const matchedItems = proposalItems.filter(
    (item) => item.matchedTenderId
  ).length;
  const matchPercentage =
    proposalItems.length > 0
      ? Math.round((matchedItems / proposalItems.length) * 100)
      : 0;

  const renderStepContent = () => {
    switch (selectedStep) {
      case "file_processing":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                File Upload Status
              </h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-medium">
                    File uploaded successfully
                  </span>
                </div>
                <p className="text-green-700 mt-1">
                  Document "tender_document.pdf" has been validated and
                  processed.
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                File Information
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">File Name:</span>
                  <p className="font-medium">tender_document.pdf</p>
                </div>
                <div>
                  <span className="text-gray-600">File Size:</span>
                  <p className="font-medium">2.4 MB</p>
                </div>
                <div>
                  <span className="text-gray-600">Upload Date:</span>
                  <p className="font-medium">2024-08-02 10:15:00</p>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <p className="font-medium text-green-600">Valid</p>
                </div>
              </div>
            </div>
          </div>
        );

      case "signature_verification":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Digital Signature Verification
              </h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-medium">
                    Signatures verified successfully
                  </span>
                </div>
                <p className="text-green-700 mt-1">
                  All digital signatures are valid and document integrity is
                  confirmed.
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Verification Details
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Certificate Status:</span>
                  <span className="font-medium text-green-600">Valid</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Signature Count:</span>
                  <span className="font-medium">2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Document Integrity:</span>
                  <span className="font-medium text-green-600">Verified</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Timestamp:</span>
                  <span className="font-medium">2024-08-02 10:15:30</span>
                </div>
              </div>
            </div>
          </div>
        );

      case "ai_parsing":
        return (
          <div className="space-y-6">
            {/* <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Tender Items Management
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-blue-600 mr-2 animate-spin" />
                  <span className="text-blue-800 font-medium">
                    AI parsing in progress...
                  </span>
                </div>
                <p className="text-blue-700 mt-1">
                  Extracting and structuring tender items. You can review and
                  edit items below.
                </p>
              </div>
            </div> */}

            {/* Proposal Items CRUD */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="font-medium text-gray-900">
                    Proposal Items ({proposalItems.length})
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Total Cost:{" "}
                    <span className="font-semibold text-green-600">
                      ${totalCost.toLocaleString()}
                    </span>
                    <span className="ml-4 text-blue-600">
                      Match: {matchPercentage}%
                    </span>
                  </p>
                </div>
                <Button
                  onClick={() => setIsAddingItem(true)}
                  size="sm"
                  className="flex items-center"
                  disabled={isLoading}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Item
                </Button>
              </div>

              {/* Search and Filter */}
              {proposalItems.length > 0 && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex space-x-3">
                    <Input
                      placeholder="Search items by name or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              )}

              {/* Error Display */}
              {errors.general && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{errors.general}</p>
                </div>
              )}

              {/* Add New Item Form */}
              {isAddingItem && (
                <Card className="mb-4 border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Add New Item</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Input
                          placeholder="Item name"
                          value={newItem.name || ""}
                          onChange={(e) =>
                            setNewItem({ ...newItem, name: e.target.value })
                          }
                          className={errors.name ? "border-red-300" : ""}
                        />
                        {errors.name && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.name}
                          </p>
                        )}
                      </div>
                      <div>
                        <Input
                          placeholder="Quantity"
                          type="number"
                          min="1"
                          value={newItem.quantity || ""}
                          onChange={(e) =>
                            setNewItem({
                              ...newItem,
                              quantity: parseInt(e.target.value) || 0,
                            })
                          }
                          className={errors.quantity ? "border-red-300" : ""}
                        />
                        {errors.quantity && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.quantity}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <Textarea
                        placeholder="Description"
                        value={newItem.description || ""}
                        onChange={(e) =>
                          setNewItem({
                            ...newItem,
                            description: e.target.value,
                          })
                        }
                        className={errors.description ? "border-red-300" : ""}
                        rows={2}
                      />
                      {errors.description && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.description}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Input
                          placeholder="Quantity"
                          type="number"
                          min="1"
                          value={newItem.quantity || ""}
                          onChange={(e) =>
                            setNewItem({
                              ...newItem,
                              quantity: parseInt(e.target.value) || 0,
                            })
                          }
                          className={errors.quantity ? "border-red-300" : ""}
                        />
                        {errors.quantity && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.quantity}
                          </p>
                        )}
                      </div>
                      <div>
                        <Input
                          placeholder="Cost per item ($)"
                          type="number"
                          min="0"
                          step="0.01"
                          value={newItem.cost || ""}
                          onChange={(e) =>
                            setNewItem({
                              ...newItem,
                              cost: parseFloat(e.target.value) || 0,
                            })
                          }
                          className={errors.cost ? "border-red-300" : ""}
                        />
                        {errors.cost && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.cost}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block text-gray-700">
                        Custom Attributes
                      </label>
                      <div className="space-y-3">
                        {/* Existing Attributes */}
                        {newItem.attributes &&
                          Object.entries(newItem.attributes).map(
                            ([key, value], index) => (
                              <div
                                key={index}
                                className="bg-gray-50 p-3 rounded-lg border"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-medium text-gray-500">
                                    Attribute #{index + 1}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const updatedAttributes = {
                                        ...newItem.attributes,
                                      };
                                      delete updatedAttributes[key];
                                      setNewItem({
                                        ...newItem,
                                        attributes: updatedAttributes,
                                      });
                                    }}
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <Input
                                      placeholder="e.g., processor"
                                      value={key}
                                      onChange={(e) => {
                                        const newKey = e.target.value;
                                        const updatedAttributes = {
                                          ...newItem.attributes,
                                        };
                                        delete updatedAttributes[key];
                                        if (newKey.trim()) {
                                          updatedAttributes[newKey] = value;
                                        }
                                        setNewItem({
                                          ...newItem,
                                          attributes: updatedAttributes,
                                        });
                                      }}
                                      className="text-sm"
                                    />
                                    <label className="text-xs text-gray-500 mt-1">
                                      Attribute Name
                                    </label>
                                  </div>
                                  <div>
                                    <Input
                                      placeholder="e.g., Intel Core i9"
                                      value={value}
                                      onChange={(e) => {
                                        const updatedAttributes = {
                                          ...newItem.attributes,
                                        };
                                        updatedAttributes[key] = e.target.value;
                                        setNewItem({
                                          ...newItem,
                                          attributes: updatedAttributes,
                                        });
                                      }}
                                      className="text-sm"
                                    />
                                    <label className="text-xs text-gray-500 mt-1">
                                      Value
                                    </label>
                                  </div>
                                </div>
                              </div>
                            )
                          )}

                        {/* Add New Attribute Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const updatedAttributes = {
                              ...(newItem.attributes || {}),
                            };
                            const newKey = "";
                            updatedAttributes[newKey] = "";
                            setNewItem({
                              ...newItem,
                              attributes: updatedAttributes,
                            });
                          }}
                          className="w-full border-dashed border-2 border-gray-300 hover:border-gray-400 py-3"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Custom Attribute
                        </Button>

                        {/* Quick Add Common Attributes */}
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 mb-2">
                            Quick add common attributes:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {[
                              "Brand",
                              "Model",
                              "Color",
                              "Material",
                              "Size",
                              "Weight",
                              "Warranty",
                            ].map((attr) => (
                              <Button
                                key={attr}
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const updatedAttributes = {
                                    ...(newItem.attributes || {}),
                                  };
                                  if (!updatedAttributes[attr.toLowerCase()]) {
                                    updatedAttributes[attr.toLowerCase()] = "";
                                    setNewItem({
                                      ...newItem,
                                      attributes: updatedAttributes,
                                    });
                                  }
                                }}
                                className="text-xs h-6 px-2"
                              >
                                + {attr}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleAddItem}
                        size="sm"
                        disabled={isLoading}
                        className="min-w-[80px]"
                      >
                        {isLoading ? (
                          <Clock className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-1" />
                        )}
                        {isLoading ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsAddingItem(false);
                          setNewItem({});
                          setErrors({});
                        }}
                        size="sm"
                        disabled={isLoading}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Items List */}
              <div className="space-y-3">
                {filteredItems.map((item) => (
                  <Card key={item.id} className="border-gray-200">
                    <CardContent className="p-4">
                      {editingItem === item.id ? (
                        <EditItemForm
                          item={item}
                          onSave={(updatedItem) =>
                            handleEditItem(item.id, updatedItem)
                          }
                          onCancel={() => setEditingItem(null)}
                        />
                      ) : (
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h5 className="font-medium text-gray-900">
                                {item.name}
                              </h5>
                              <Badge variant="outline">
                                Qty: {item.quantity}
                              </Badge>
                              <Badge
                                variant="outline"
                                className="text-green-600"
                              >
                                ${(item.cost * item.quantity).toLocaleString()}
                              </Badge>
                              {item.matchedTenderId && (
                                <Badge
                                  variant="outline"
                                  className="text-blue-600"
                                >
                                  Matched
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {item.description}
                            </p>
                            {item.attributes &&
                              Object.keys(item.attributes).length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs text-gray-500 mb-1">
                                    Attributes:
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {Object.entries(item.attributes).map(
                                      ([key, value]) => (
                                        <Badge
                                          key={key}
                                          variant="secondary"
                                          className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                                        >
                                          {key}: {value}
                                        </Badge>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                          <div className="flex space-x-1 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingItem(item.id)}
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredItems.length === 0 && proposalItems.length > 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Code className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No items match your search criteria.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchTerm("")}
                    className="mt-2"
                  >
                    Clear Search
                  </Button>
                </div>
              )}

              {proposalItems.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Code className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>
                    No items found. Add items manually or wait for AI parsing to
                    complete.
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case "proposal_matching":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Proposal Matching
              </h3>
              <p className="text-gray-600 mb-4">
                Click a proposal item, then click a tender item to create a
                match
              </p>
            </div>

            <ProposalTenderMatcher
              proposalItems={proposalItems}
              tenderItems={tender?.items || []}
            />
          </div>
        );

      case "ai_insights":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                AI Insights & Recommendations
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-600 mr-2" />
                  <span className="text-gray-800 font-medium">Pending</span>
                </div>
                <p className="text-gray-700 mt-1">
                  AI insights will be generated after proposal matching is
                  completed.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Select a step to view details</div>;
    }
  };

  return (
    <div className=" max-w-7xl mx-auto min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to My Proposals
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {proposal?.name}
              </h1>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-sm text-gray-600">
                  Proposal ID: {proposalId}
                </span>
                <Badge
                  className={
                    proposal?.status === "submitted"
                      ? "bg-green-100 text-green-700"
                      : proposal?.status === "draft"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-700"
                  }
                >
                  {proposal?.status}
                </Badge>
                <span className="text-sm text-gray-600 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Submitted:{" "}
                  {proposal
                    ? new Date(proposal.submittedAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Total Value</div>
            <div className="text-xl font-bold text-green-600 flex items-center">
              <DollarSign className="w-5 h-5 mr-1" />
              {proposalItems
                .reduce((sum, item) => sum + item.cost * item.quantity, 0)
                .toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Tender Information Card */}
      {tender && (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg text-blue-800 flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Responding to Tender
                </CardTitle>
                <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                  {tender.visibility === "public"
                    ? "Public Tender"
                    : "Private Tender"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">{tender.name}</h3>
                  <div className="flex items-center text-sm text-gray-600">
                    <Building className="w-4 h-4 mr-2 text-gray-500" />
                    {tender.organization || "Organization not specified"}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="w-4 h-4 mr-2 text-gray-500" />
                    {tender.createdBy}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2 text-gray-500" />
                    {tender.contactEmail}
                  </div>
                  {tender.contactPhone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2 text-gray-500" />
                      {tender.contactPhone}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">
                    Key Information
                  </h3>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="font-medium">Created:</span>
                    <span className="ml-2">
                      {new Date(tender.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="font-medium">Deadline:</span>
                    <span className="ml-2">
                      {new Date(tender.deadline).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="font-medium">Location:</span>
                    <span className="ml-2">
                      {tender.location || "Not specified"}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="font-medium">Budget:</span>
                    <span className="ml-2">
                      {tender.budget?.toLocaleString() || "Not specified"}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">
                    Tender Summary
                  </h3>
                  <p className="text-sm text-gray-600">
                    {tender.description || "No description provided."}
                  </p>
                  <div className="flex items-center text-sm">
                    <div className="flex items-center mr-4">
                      <FileText className="w-4 h-4 mr-1 text-gray-500" />
                      <span>{tender.items?.length || 0} items</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar - Processing Steps */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Processing Steps
            </h2>
            <div className="space-y-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    selectedStep === step.id
                      ? "bg-blue-50 border-2 border-blue-200"
                      : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                  }`}
                  onClick={() => setSelectedStep(step.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">{getStepIcon(step)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {index + 1}. {step.name}
                        </h3>
                        {getStepBadge(step.status)}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tender Basic Info */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Tender Information
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center space-x-2">
                  <User className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-600">
                    Created by: {tender.createdBy}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Building className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-600">
                    Organization: {tender.organization}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-600">
                    Contact: {tender.contactEmail}
                  </span>
                </div>
                {tender.contactPhone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-600">{tender.contactPhone}</span>
                  </div>
                )}
                {tender.location && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-600">{tender.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  {currentStep && getStepIcon(currentStep)}
                  <div>
                    <CardTitle>{currentStep?.name}</CardTitle>
                    <p className="text-gray-600 mt-1">
                      {currentStep?.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>{renderStepContent()}</CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Edit Item Form Component
function EditItemForm({
  item,
  onSave,
  onCancel,
}: {
  item: ProposalItem;
  onSave: (item: Partial<ProposalItem>) => void;
  onCancel: () => void;
}) {
  const [editedItem, setEditedItem] = useState(item);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateItem = (
    item: Partial<ProposalItem>
  ): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!item.name?.trim()) errors.name = "Item name is required";
    if (!item.description?.trim())
      errors.description = "Description is required";
    if (!item.quantity || item.quantity <= 0)
      errors.quantity = "Quantity must be greater than 0";
    if (!item.cost || item.cost <= 0)
      errors.cost = "Cost must be greater than 0";
    return errors;
  };

  const handleSave = async () => {
    const validationErrors = validateItem(editedItem);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setIsLoading(true);
      try {
        await onSave(editedItem);
      } catch (error) {
        setErrors({ general: "Failed to update item. Please try again." });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Error Display */}
      {errors.general && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{errors.general}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Input
            placeholder="Item name"
            value={editedItem.name}
            onChange={(e) =>
              setEditedItem({ ...editedItem, name: e.target.value })
            }
            className={errors.name ? "border-red-300" : ""}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>
        <div>
          <Input
            placeholder="Quantity"
            type="number"
            min="1"
            value={editedItem.quantity}
            onChange={(e) =>
              setEditedItem({
                ...editedItem,
                quantity: parseInt(e.target.value) || 0,
              })
            }
            className={errors.quantity ? "border-red-300" : ""}
          />
          {errors.quantity && (
            <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
          )}
        </div>
      </div>

      <div>
        <Textarea
          placeholder="Description"
          value={editedItem.description}
          onChange={(e) =>
            setEditedItem({ ...editedItem, description: e.target.value })
          }
          rows={2}
          className={errors.description ? "border-red-300" : ""}
        />
        {errors.description && (
          <p className="text-red-500 text-xs mt-1">{errors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Input
            placeholder="Quantity"
            type="number"
            min="1"
            value={editedItem.quantity}
            onChange={(e) =>
              setEditedItem({
                ...editedItem,
                quantity: parseInt(e.target.value) || 0,
              })
            }
            className={errors.quantity ? "border-red-300" : ""}
          />
          {errors.quantity && (
            <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
          )}
        </div>
        <div>
          <Input
            placeholder="Cost per item ($)"
            type="number"
            min="0"
            step="0.01"
            value={editedItem.cost}
            onChange={(e) =>
              setEditedItem({
                ...editedItem,
                cost: parseFloat(e.target.value) || 0,
              })
            }
            className={errors.cost ? "border-red-300" : ""}
          />
          {errors.cost && (
            <p className="text-red-500 text-xs mt-1">{errors.cost}</p>
          )}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block text-gray-700">
          Custom Attributes
        </label>
        <div className="space-y-3">
          {/* Existing Attributes */}
          {editedItem.attributes &&
            Object.entries(editedItem.attributes).map(([key, value], index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500">
                    Attribute #{index + 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const updatedAttributes = { ...editedItem.attributes };
                      delete updatedAttributes[key];
                      setEditedItem({
                        ...editedItem,
                        attributes: updatedAttributes,
                      });
                    }}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Input
                      placeholder="e.g., processor"
                      value={key}
                      onChange={(e) => {
                        const newKey = e.target.value;
                        const updatedAttributes = { ...editedItem.attributes };
                        delete updatedAttributes[key];
                        if (newKey.trim()) {
                          updatedAttributes[newKey] = value;
                        }
                        setEditedItem({
                          ...editedItem,
                          attributes: updatedAttributes,
                        });
                      }}
                      className="text-sm"
                    />
                    <label className="text-xs text-gray-500 mt-1">
                      Attribute Name
                    </label>
                  </div>
                  <div>
                    <Input
                      placeholder="e.g., Intel Core i9"
                      value={value}
                      onChange={(e) => {
                        const updatedAttributes = { ...editedItem.attributes };
                        updatedAttributes[key] = e.target.value;
                        setEditedItem({
                          ...editedItem,
                          attributes: updatedAttributes,
                        });
                      }}
                      className="text-sm"
                    />
                    <label className="text-xs text-gray-500 mt-1">Value</label>
                  </div>
                </div>
              </div>
            ))}

          {/* Add New Attribute Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const updatedAttributes = { ...(editedItem.attributes || {}) };
              const newKey = "";
              updatedAttributes[newKey] = "";
              setEditedItem({ ...editedItem, attributes: updatedAttributes });
            }}
            className="w-full border-dashed border-2 border-gray-300 hover:border-gray-400 py-3"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Custom Attribute
          </Button>

          {/* Quick Add Common Attributes */}
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-2">
              Quick add common attributes:
            </p>
            <div className="flex flex-wrap gap-1">
              {[
                "Brand",
                "Model",
                "Color",
                "Material",
                "Size",
                "Weight",
                "Warranty",
              ].map((attr) => (
                <Button
                  key={attr}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const updatedAttributes = {
                      ...(editedItem.attributes || {}),
                    };
                    if (!updatedAttributes[attr.toLowerCase()]) {
                      updatedAttributes[attr.toLowerCase()] = "";
                      setEditedItem({
                        ...editedItem,
                        attributes: updatedAttributes,
                      });
                    }
                  }}
                  className="text-xs h-6 px-2"
                >
                  + {attr}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex space-x-2">
        <Button
          onClick={handleSave}
          size="sm"
          disabled={isLoading}
          className="min-w-[80px]"
        >
          {isLoading ? (
            <Clock className="w-4 h-4 mr-1 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-1" />
          )}
          {isLoading ? "Saving..." : "Save"}
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          size="sm"
          disabled={isLoading}
        >
          <X className="w-4 h-4 mr-1" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
