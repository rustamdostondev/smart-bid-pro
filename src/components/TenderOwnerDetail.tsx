import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  MapPin
} from 'lucide-react';
import { mockTenders, getCurrentUser, type TenderItem } from '@/lib/mockData';

interface ProcessingStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  icon: any;
}

interface TenderOwnerDetailProps {
  tenderId: string;
  onBack: () => void;
}

export function TenderOwnerDetail({ tenderId, onBack }: TenderOwnerDetailProps) {
  const user = getCurrentUser();
  const tender = mockTenders.find(t => t.id === tenderId);
  const [selectedStep, setSelectedStep] = useState('file_processing');
  const [tenderItems, setTenderItems] = useState<TenderItem[]>(tender?.items || []);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<Partial<TenderItem>>({});
  const [isAddingItem, setIsAddingItem] = useState(false);

  if (!tender) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tender Not Found</h2>
          <p className="text-gray-600 mb-4">The requested tender could not be found.</p>
          <Button onClick={onBack}>Go Back</Button>
        </div>
      </div>
    );
  }

  const steps: ProcessingStep[] = [
    {
      id: 'file_processing',
      name: 'File Upload',
      description: 'Upload and validate tender document',
      status: 'completed',
      icon: FileText
    },
    {
      id: 'signature_verification',
      name: 'Signature Check',
      description: 'Verify digital signatures',
      status: 'completed',
      icon: Shield
    },
    {
      id: 'ai_parsing',
      name: 'Parse to JSON',
      description: 'Extract and structure tender data',
      status: 'running',
      icon: Code
    },
    {
      id: 'proposal_matching',
      name: 'Proposal Matching',
      description: 'Match with available proposals',
      status: 'pending',
      icon: Target
    },
    {
      id: 'ai_insights',
      name: 'AI Insights',
      description: 'Generate recommendations',
      status: 'pending',
      icon: Brain
    }
  ];

  const currentStep = steps.find(step => step.id === selectedStep);

  const getStepIcon = (step: ProcessingStep) => {
    const IconComponent = step.icon;
    const baseClasses = "w-5 h-5";
    
    if (step.status === 'completed') {
      return <CheckCircle className={`${baseClasses} text-green-500`} />;
    } else if (step.status === 'running') {
      return <Clock className={`${baseClasses} text-blue-500 animate-spin`} />;
    } else if (step.status === 'failed') {
      return <XCircle className={`${baseClasses} text-red-500`} />;
    } else {
      return <IconComponent className={`${baseClasses} text-gray-400`} />;
    }
  };

  const getStepBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Completed</Badge>;
      case 'running':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200 animate-pulse">In Progress</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-700 border-red-200">Failed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Pending</Badge>;
    }
  };

  const handleAddItem = () => {
    if (newItem.name && newItem.description && newItem.quantity && newItem.estimatedCost) {
      const item: TenderItem = {
        id: `item_${Date.now()}`,
        name: newItem.name,
        description: newItem.description,
        quantity: newItem.quantity,
        unit: newItem.unit || 'pcs',
        estimatedCost: newItem.estimatedCost,
        specifications: newItem.specifications || '',
        attributes: {}
      };
      setTenderItems([...tenderItems, item]);
      setNewItem({});
      setIsAddingItem(false);
    }
  };

  const handleEditItem = (itemId: string, updatedItem: Partial<TenderItem>) => {
    setTenderItems(items => 
      items.map(item => 
        item.id === itemId ? { ...item, ...updatedItem } : item
      )
    );
    setEditingItem(null);
  };

  const handleDeleteItem = (itemId: string) => {
    setTenderItems(items => items.filter(item => item.id !== itemId));
  };

  const renderStepContent = () => {
    switch (selectedStep) {
      case 'file_processing':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">File Upload Status</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-medium">File uploaded successfully</span>
                </div>
                <p className="text-green-700 mt-1">
                  Document "tender_document.pdf" has been validated and processed.
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">File Information</h4>
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

      case 'signature_verification':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Digital Signature Verification</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-medium">Signatures verified successfully</span>
                </div>
                <p className="text-green-700 mt-1">
                  All digital signatures are valid and document integrity is confirmed.
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Verification Details</h4>
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

      case 'ai_parsing':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Tender Items Management</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-blue-600 mr-2 animate-spin" />
                  <span className="text-blue-800 font-medium">AI parsing in progress...</span>
                </div>
                <p className="text-blue-700 mt-1">
                  Extracting and structuring tender items. You can review and edit items below.
                </p>
              </div>
            </div>

            {/* Tender Items CRUD */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-gray-900">Tender Items ({tenderItems.length})</h4>
                <Button 
                  onClick={() => setIsAddingItem(true)}
                  size="sm"
                  className="flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Item
                </Button>
              </div>

              {/* Add New Item Form */}
              {isAddingItem && (
                <Card className="mb-4 border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Add New Item</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Item name"
                        value={newItem.name || ''}
                        onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                      />
                      <Input
                        placeholder="Quantity"
                        type="number"
                        value={newItem.quantity || ''}
                        onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value)})}
                      />
                    </div>
                    <Textarea
                      placeholder="Description"
                      value={newItem.description || ''}
                      onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                      rows={2}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Unit (e.g., pcs, kg)"
                        value={newItem.unit || ''}
                        onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                      />
                      <Input
                        placeholder="Estimated cost"
                        type="number"
                        value={newItem.estimatedCost || ''}
                        onChange={(e) => setNewItem({...newItem, estimatedCost: parseFloat(e.target.value)})}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handleAddItem} size="sm">
                        <Save className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {setIsAddingItem(false); setNewItem({});}}
                        size="sm"
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
                {tenderItems.map((item) => (
                  <Card key={item.id} className="border-gray-200">
                    <CardContent className="p-4">
                      {editingItem === item.id ? (
                        <EditItemForm 
                          item={item}
                          onSave={(updatedItem) => handleEditItem(item.id, updatedItem)}
                          onCancel={() => setEditingItem(null)}
                        />
                      ) : (
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h5 className="font-medium text-gray-900">{item.name}</h5>
                              <Badge variant="outline">{item.quantity} {item.unit}</Badge>
                              <Badge variant="outline" className="text-green-600">
                                ${item.estimatedCost?.toLocaleString()}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                            {item.specifications && (
                              <p className="text-xs text-gray-500">Specs: {item.specifications}</p>
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

              {tenderItems.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Code className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No items found. Add items manually or wait for AI parsing to complete.</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'proposal_matching':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Proposal Matching</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-600 mr-2" />
                  <span className="text-gray-800 font-medium">Waiting for previous steps</span>
                </div>
                <p className="text-gray-700 mt-1">
                  This step will begin automatically once AI parsing is completed.
                </p>
              </div>
            </div>
          </div>
        );

      case 'ai_insights':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Insights & Recommendations</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-600 mr-2" />
                  <span className="text-gray-800 font-medium">Pending</span>
                </div>
                <p className="text-gray-700 mt-1">
                  AI insights will be generated after proposal matching is completed.
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
              <h1 className="text-2xl font-bold text-gray-900">{tender.title}</h1>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-sm text-gray-600">ID: {tender.id}</span>
                <Badge 
                  className={
                    tender.status === 'published' ? 'bg-green-100 text-green-700' :
                    tender.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }
                >
                  {tender.status}
                </Badge>
                <span className="text-sm text-gray-600 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Deadline: {new Date(tender.deadline).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Budget</div>
            <div className="text-xl font-bold text-green-600 flex items-center">
              <DollarSign className="w-5 h-5 mr-1" />
              {tender.budget?.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar - Processing Steps */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Processing Steps</h2>
            <div className="space-y-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    selectedStep === step.id
                      ? 'bg-blue-50 border-2 border-blue-200'
                      : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedStep(step.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {getStepIcon(step)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {index + 1}. {step.name}
                        </h3>
                        {getStepBadge(step.status)}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tender Basic Info */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Tender Information</h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center space-x-2">
                  <User className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-600">Created by: {tender.createdBy}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Building className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-600">Organization: {tender.organization}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-600">Contact: {tender.contactEmail}</span>
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
                    <p className="text-gray-600 mt-1">{currentStep?.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {renderStepContent()}
              </CardContent>
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
  onCancel 
}: { 
  item: TenderItem; 
  onSave: (item: Partial<TenderItem>) => void; 
  onCancel: () => void; 
}) {
  const [editedItem, setEditedItem] = useState(item);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Input
          value={editedItem.name}
          onChange={(e) => setEditedItem({...editedItem, name: e.target.value})}
        />
        <Input
          type="number"
          value={editedItem.quantity}
          onChange={(e) => setEditedItem({...editedItem, quantity: parseInt(e.target.value)})}
        />
      </div>
      <Textarea
        value={editedItem.description}
        onChange={(e) => setEditedItem({...editedItem, description: e.target.value})}
        rows={2}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          value={editedItem.unit}
          onChange={(e) => setEditedItem({...editedItem, unit: e.target.value})}
        />
        <Input
          type="number"
          value={editedItem.estimatedCost}
          onChange={(e) => setEditedItem({...editedItem, estimatedCost: parseFloat(e.target.value)})}
        />
      </div>
      <div className="flex space-x-2">
        <Button onClick={() => onSave(editedItem)} size="sm">
          <Save className="w-4 h-4 mr-1" />
          Save
        </Button>
        <Button variant="outline" onClick={onCancel} size="sm">
          <X className="w-4 h-4 mr-1" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
