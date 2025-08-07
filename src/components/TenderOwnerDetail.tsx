import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  Upload,
  Check,
  Clock,
  AlertCircle,
  Download,
  Edit,
  Trash2,
  Plus,
  Search,
  X,
  Save,
  ArrowLeft,
  Package,
  Eye,
  Award,
  BarChart,
  Building,
  User,
  Calendar,
  Mail,
  CheckCircle,
  XCircle,
  Shield,
  Code,
  Target,
  Brain,
  Edit2,
  DollarSign,
  Phone,
  MapPin,
} from "lucide-react";
import {
  mockTenders,
  mockProposals,
  getCurrentUser,
  type TenderItem,
  type Proposal,
} from "@/lib/mockData";

interface ProcessingStep {
  id: string;
  name: string;
  description: string;
  status: "pending" | "running" | "completed" | "failed";
  icon: any;
}

interface TenderOwnerDetailProps {
  tenderId: string;
  onBack: () => void;
  onViewProposalDetail?: (proposalId: string) => void;
  onOpenAnalytics?: (tenderId: string) => void;
}

export function TenderOwnerDetail({
  tenderId,
  onBack,
  onViewProposalDetail,
  onOpenAnalytics,
}: TenderOwnerDetailProps) {
  const user = getCurrentUser();
  const tender = mockTenders.find((t) => t.id === tenderId);
  const [selectedStep, setSelectedStep] = useState("file_processing");
  const [tenderItems, setTenderItems] = useState<TenderItem[]>(
    tender?.items || []
  );
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<Partial<TenderItem>>({});
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterByStatus, setFilterByStatus] = useState<
    "all" | "completed" | "pending"
  >("all");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isClosingTender, setIsClosingTender] = useState(false);
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);

  // Get all proposals related to this tender
  const relatedProposals = mockProposals.filter(
    (p) => p.tenderIds === tenderId
  );

  // Handle close tender
  const handleCloseTender = async () => {
    setIsClosingTender(true);
    try {
      // Simulate API call to close tender
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update tender status in mock data (in real app, this would be an API call)
      const tenderIndex = mockTenders.findIndex((t) => t.id === tenderId);
      if (tenderIndex !== -1) {
        mockTenders[tenderIndex].status = "closed";
      }

      // Close confirmation dialog
      setShowCloseConfirmation(false);

      // Optionally navigate back or refresh
      window.location.reload(); // In real app, use proper state management
    } catch (error) {
      setErrors({ general: "Failed to close tender. Please try again." });
    } finally {
      setIsClosingTender(false);
    }
  };

  if (!tender) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Tender Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The requested tender could not be found.
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
      description: "Upload and validate tender document",
      status: "completed",
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
      name: "Tender Items Management",
      description: "Extract and structure tender data",
      status: "running",
      icon: Code,
    },
    {
      id: "proposal_analysis",
      name: "AI Insights",
      description: "Generate recommendations",
      status: "completed",
      icon: BarChart,
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

  const validateItem = (item: Partial<TenderItem>): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!item.name?.trim()) errors.name = "Item name is required";
    if (!item.description?.trim())
      errors.description = "Description is required";
    if (!item.quantity || item.quantity <= 0)
      errors.quantity = "Quantity must be greater than 0";
    if (!item.estimatedCost || item.estimatedCost <= 0)
      errors.estimatedCost = "Estimated cost must be greater than 0";
    if (!item.unit?.trim()) errors.unit = "Unit is required";
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

        const item: TenderItem = {
          id: `item_${Date.now()}`,
          name: newItem.name!,
          description: newItem.description!,
          quantity: newItem.quantity!,
          unit: newItem.unit || "pcs",
          estimatedCost: newItem.estimatedCost!,
          specifications: newItem.specifications || "",
          attributes: newItem.attributes || {},
        };
        setTenderItems([...tenderItems, item]);
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
    updatedItem: Partial<TenderItem>
  ) => {
    const validationErrors = validateItem(updatedItem);
    if (Object.keys(validationErrors).length === 0) {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 300));

        setTenderItems((items) =>
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
        setTenderItems((items) => items.filter((item) => item.id !== itemId));
      } catch (error) {
        setErrors({ general: "Failed to delete item. Please try again." });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Filter and search items
  const filteredItems = tenderItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const totalEstimatedCost = tenderItems.reduce(
    (sum, item) => sum + (item.estimatedCost || 0),
    0
  );

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
            <div>
              {/* <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Tender Items Management
              </h3> */}
              {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
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
              </div> */}
            </div>

            {/* Tender Items CRUD */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="font-medium text-gray-900">
                    Tender Items ({tenderItems.length})
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Total Estimated Cost:{" "}
                    <span className="font-semibold text-green-600">
                      ${totalEstimatedCost.toLocaleString()}
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
              {tenderItems.length > 0 && (
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
                        rows={2}
                        className={errors.description ? "border-red-300" : ""}
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
                          placeholder="Unit (e.g., pcs, kg)"
                          value={newItem.unit || ""}
                          onChange={(e) =>
                            setNewItem({ ...newItem, unit: e.target.value })
                          }
                          className={errors.unit ? "border-red-300" : ""}
                        />
                        {errors.unit && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.unit}
                          </p>
                        )}
                      </div>
                      <div>
                        <Input
                          placeholder="Estimated cost"
                          type="number"
                          min="0"
                          step="0.01"
                          value={newItem.estimatedCost || ""}
                          onChange={(e) =>
                            setNewItem({
                              ...newItem,
                              estimatedCost: parseFloat(e.target.value) || 0,
                            })
                          }
                          className={
                            errors.estimatedCost ? "border-red-300" : ""
                          }
                        />
                        {errors.estimatedCost && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.estimatedCost}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block text-gray-700">
                        Specifications
                      </label>
                      <Textarea
                        placeholder="Enter detailed specifications"
                        value={newItem.specifications || ""}
                        onChange={(e) =>
                          setNewItem({
                            ...newItem,
                            specifications: e.target.value,
                          })
                        }
                        rows={3}
                      />
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
                                {item.quantity} {item.unit}
                              </Badge>
                              <Badge
                                variant="outline"
                                className="text-green-600"
                              >
                                ${item.estimatedCost?.toLocaleString()}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {item.description}
                            </p>
                            {/* {item.specifications && (
                              <div className="mb-2">
                                <p className="text-xs text-gray-500 mb-1">
                                  Specifications:
                                </p>
                                <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded border">
                                  {item.specifications}
                                </p>
                              </div>
                            )} */}
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

              {filteredItems.length === 0 && tenderItems.length > 0 && (
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

              {tenderItems.length === 0 && (
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
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-600 mr-2" />
                  <span className="text-gray-800 font-medium">
                    Waiting for previous steps
                  </span>
                </div>
                <p className="text-gray-700 mt-1">
                  This step will begin automatically once AI parsing is
                  completed.
                </p>
              </div>
            </div>
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

      case "proposal_analysis":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Proposal Analysis
              </h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-medium">
                    Analysis completed successfully
                  </span>
                </div>
                <p className="text-green-700 mt-1">
                  All proposals have been analyzed and compared.{" "}
                  {relatedProposals.length} proposals found for this tender.
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Analysis Summary
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Proposals:</span>
                  <p className="font-medium">{relatedProposals.length}</p>
                </div>
                <div>
                  <span className="text-gray-600">Analysis Status:</span>
                  <p className="font-medium text-green-600">Completed</p>
                </div>
                <div>
                  <span className="text-gray-600">Best Match:</span>
                  <p className="font-medium">
                    {relatedProposals[0]?.company || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Analysis Date:</span>
                  <p className="font-medium">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-blue-800">
                    View Detailed Analysis
                  </h4>
                  <p className="text-blue-700 text-sm mt-1">
                    Open the comprehensive analytics dashboard to compare
                    proposals and select winners.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    if (onOpenAnalytics) {
                      onOpenAnalytics(tenderId);
                    } else {
                      console.log(
                        "Navigate to analytics for tender:",
                        tenderId
                      );
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <BarChart className="w-4 h-4 mr-2" />
                  Open Analytics
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Select a step to view details</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to My Tenders
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {tender.title}
              </h1>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-sm text-gray-600">ID: {tender.id}</span>
                <Badge
                  className={
                    tender.status === "published"
                      ? "bg-green-100 text-green-700"
                      : tender.status === "draft"
                      ? "bg-yellow-100 text-yellow-700"
                      : tender.status === "closed"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700"
                  }
                >
                  {tender.status}
                </Badge>
                <span className="text-sm text-gray-600 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Deadline: {new Date(tender.deadline).toLocaleDateString()}
                </span>
                <span className="text-sm text-gray-600 flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  Budget: {tender.budget?.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {/* Close Tender Button */}
            {tender.status !== "closed" && (
              <Button
                variant="destructive"
                onClick={() => setShowCloseConfirmation(true)}
                disabled={isClosingTender}
                className="bg-red-600 hover:bg-red-700"
              >
                {isClosingTender ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Closing...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Close Tender
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

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
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-8 space-y-8">
            {/* Current Processing Step */}
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white rounded-full shadow-sm">
                    {currentStep && getStepIcon(currentStep)}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl text-gray-900">
                      {currentStep?.name}
                    </CardTitle>
                    <p className="text-gray-600 mt-1 text-sm">
                      {currentStep?.description}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-white border-blue-200 text-blue-700"
                  >
                    Step {steps.findIndex((s) => s.id === selectedStep) + 1} of{" "}
                    {steps.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">{renderStepContent()}</CardContent>
            </Card>

            {/* Received Proposals Section */}
            {(() => {
              const tenderProposals = mockProposals.filter(
                (p) => p.tenderIds === tenderId
              );

              const getProposalStatusVariant = (status: string) => {
                switch (status) {
                  case "submitted":
                    return "bg-green-100 text-green-700";
                  case "draft":
                    return "bg-yellow-100 text-yellow-700";
                  case "accepted":
                    return "bg-blue-100 text-blue-700";
                  case "rejected":
                    return "bg-red-100 text-red-700";
                  default:
                    return "bg-gray-100 text-gray-700";
                }
              };

              const getProposalStatusIcon = (status: string) => {
                switch (status) {
                  case "submitted":
                    return <CheckCircle className="w-4 h-4" />;
                  case "draft":
                    return <Clock className="w-4 h-4" />;
                  case "accepted":
                    return <Award className="w-4 h-4" />;
                  case "rejected":
                    return <XCircle className="w-4 h-4" />;
                  default:
                    return null;
                }
              };

              return (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-blue-600" />
                        <div>
                          <CardTitle>Received Proposals</CardTitle>
                          <p className="text-gray-600 text-sm mt-1">
                            {tenderProposals.length} proposal
                            {tenderProposals.length !== 1 ? "s" : ""} submitted
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {tenderProposals.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No Proposals Yet
                        </h3>
                        <p className="text-gray-600">
                          No proposals have been submitted for this tender yet.
                        </p>
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {tenderProposals.map((proposal) => {
                          return (
                            <Card
                              key={proposal.id}
                              className="border hover:shadow-md transition-shadow"
                            >
                              <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h3 className="font-semibold text-base">
                                      {proposal.name}
                                    </h3>
                                  </div>
                                  <Badge
                                    className={`${getProposalStatusVariant(
                                      proposal.status
                                    )} text-xs`}
                                  >
                                    {getProposalStatusIcon(proposal.status)}
                                    <span className="ml-1 capitalize">
                                      {proposal.status}
                                    </span>
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <div className="text-xs text-gray-500">
                                      Total Cost
                                    </div>
                                    <div className="font-semibold text-green-600">
                                      ${proposal.totalCost.toLocaleString()}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-500">
                                      Items
                                    </div>
                                    <div className="font-semibold">
                                      {proposal.items.length}
                                    </div>
                                  </div>
                                </div>

                                <div className="pt-2 border-t">
                                  <div className="text-xs text-gray-500 mb-2">
                                    Submitted by
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-600">
                                      {new Date(
                                        proposal.submittedAt
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                  onClick={() =>
                                    onViewProposalDetail?.(proposal.id)
                                  }
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </Button>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })()}

            {/* Processing Steps Card */}
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
  item: TenderItem;
  onSave: (item: Partial<TenderItem>) => void;
  onCancel: () => void;
}) {
  const [editedItem, setEditedItem] = useState(item);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateItem = (item: Partial<TenderItem>): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!item.name?.trim()) errors.name = "Item name is required";
    if (!item.description?.trim())
      errors.description = "Description is required";
    if (!item.quantity || item.quantity <= 0)
      errors.quantity = "Quantity must be greater than 0";
    if (!item.estimatedCost || item.estimatedCost <= 0)
      errors.estimatedCost = "Estimated cost must be greater than 0";
    if (!item.unit?.trim()) errors.unit = "Unit is required";
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
            placeholder="Unit (e.g., pcs, kg)"
            value={editedItem.unit}
            onChange={(e) =>
              setEditedItem({ ...editedItem, unit: e.target.value })
            }
            className={errors.unit ? "border-red-300" : ""}
          />
          {errors.unit && (
            <p className="text-red-500 text-xs mt-1">{errors.unit}</p>
          )}
        </div>
        <div>
          <Input
            placeholder="Estimated cost"
            type="number"
            min="0"
            step="0.01"
            value={editedItem.estimatedCost}
            onChange={(e) =>
              setEditedItem({
                ...editedItem,
                estimatedCost: parseFloat(e.target.value) || 0,
              })
            }
            className={errors.estimatedCost ? "border-red-300" : ""}
          />
          {errors.estimatedCost && (
            <p className="text-red-500 text-xs mt-1">{errors.estimatedCost}</p>
          )}
        </div>
      </div>

      {/* <div>
        <label className="text-sm font-medium mb-1 block text-gray-700">
          Specifications
        </label>
        <Textarea
          placeholder="Enter detailed specifications"
          value={editedItem.specifications || ""}
          onChange={(e) =>
            setEditedItem({ ...editedItem, specifications: e.target.value })
          }
          rows={3}
        />
      </div> */}

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
