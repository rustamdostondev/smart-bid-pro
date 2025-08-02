import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Shield, Brain, CheckCircle, ArrowLeft, Plus, Trash2, Target, Percent } from 'lucide-react';
import { mockTenders, getCurrentUser } from '@/lib/mockData';

interface CreateProposalProps {
  onBack: () => void;
}

interface ProposalItem {
  name: string;
  description: string;
  cost: number;
  quantity: number;
  matchedTenderId?: string;
  matchPercentage?: number;
  attributes: Record<string, string>;
}

export function CreateProposal({ onBack }: CreateProposalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    selectedTenderId: '',
    deadline: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState({
    parsing: 'pending' as 'pending' | 'progress' | 'completed',
    signature: 'pending' as 'pending' | 'progress' | 'completed',
    matching: 'pending' as 'pending' | 'progress' | 'completed'
  });
  const [proposalItems, setProposalItems] = useState<ProposalItem[]>([]);
  const { toast } = useToast();
  const user = getCurrentUser();

  // Get available public tenders
  const availableTenders = mockTenders.filter(tender => 
    tender.visibility === 'public' && 
    tender.status === 'published' &&
    new Date(tender.deadline) > new Date()
  );

  const selectedTender = mockTenders.find(t => t.id === formData.selectedTenderId);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
    }
  };

  const simulateProcessing = async () => {
    // File Parsing
    setProcessing(prev => ({ ...prev, parsing: 'progress' }));
    await new Promise(resolve => setTimeout(resolve, 2000));
    setProcessing(prev => ({ ...prev, parsing: 'completed' }));

    // Signature Check
    setProcessing(prev => ({ ...prev, signature: 'progress' }));
    await new Promise(resolve => setTimeout(resolve, 1500));
    setProcessing(prev => ({ ...prev, signature: 'completed' }));

    // AI Element Matching
    setProcessing(prev => ({ ...prev, matching: 'progress' }));
    await new Promise(resolve => setTimeout(resolve, 3000));
    setProcessing(prev => ({ ...prev, matching: 'completed' }));

    // Simulate AI matching with tender items
    if (selectedTender) {
      const matchedItems: ProposalItem[] = [
        {
          name: 'Dell XPS 15 Business Laptop',
          description: 'High-performance laptop with Intel i7, 16GB RAM, 512GB SSD',
          cost: 1200,
          quantity: 50,
          matchedTenderId: selectedTender.items[0]?.id,
          matchPercentage: 95,
          attributes: { brand: 'Dell', ram: '16GB', storage: '512GB SSD', screen: '15 inch' }
        },
        {
          name: 'Epson PowerLite Conference Projector',
          description: 'HD business projector with 3500 lumens brightness',
          cost: 800,
          quantity: 10,
          matchedTenderId: selectedTender.items[1]?.id,
          matchPercentage: 92,
          attributes: { brightness: '3500 lumens', resolution: '1080p', connectivity: 'HDMI, USB, WiFi' }
        }
      ];
      setProposalItems(matchedItems);
    }

    setStep(3);
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!formData.name || !formData.selectedTenderId) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!file) {
        toast({
          title: "File required",
          description: "Please upload a proposal file",
          variant: "destructive"
        });
        return;
      }
      await simulateProcessing();
    }
  };

  const addItem = () => {
    setProposalItems(prev => [...prev, {
      name: '',
      description: '',
      cost: 0,
      quantity: 1,
      attributes: {}
    }]);
  };

  const removeItem = (index: number) => {
    setProposalItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    setProposalItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const updateMatching = (index: number, tenderId: string, percentage: number) => {
    setProposalItems(prev => prev.map((item, i) => 
      i === index ? { 
        ...item, 
        matchedTenderId: tenderId, 
        matchPercentage: percentage 
      } : item
    ));
  };

  const handlePublish = () => {
    const totalCost = proposalItems.reduce((sum, item) => sum + (item.cost * item.quantity), 0);
    
    toast({
      title: "Proposal submitted!",
      description: `Your proposal for ${selectedTender?.name} has been sent to the tender creator. Total value: $${totalCost.toLocaleString()}`,
    });
    onBack();
  };

  const getProcessingStatus = (status: string) => {
    switch (status) {
      case 'pending': return { variant: 'pending' as const, text: 'Pending' };
      case 'progress': return { variant: 'progress' as const, text: 'Processing...' };
      case 'completed': return { variant: 'completed' as const, text: 'Completed' };
    }
  };

  const getMatchPercentageColor = (percentage: number = 0) => {
    if (percentage >= 90) return 'success';
    if (percentage >= 70) return 'warning';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Create Proposal</h1>
      </div>

      {/* Progress indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <span className={`font-medium ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
              1. Proposal Info
            </span>
            <span className={`font-medium ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
              2. File Upload
            </span>
            <span className={`font-medium ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
              3. AI Matching & Review
            </span>
          </div>
          <Progress value={(step / 3) * 100} className="h-2" />
        </CardContent>
      </Card>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Proposal Information</CardTitle>
            <CardDescription>Provide basic details about your proposal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tender">Select Tender *</Label>
              <Select value={formData.selectedTenderId} onValueChange={(value) => setFormData(prev => ({ ...prev, selectedTenderId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a tender to respond to" />
                </SelectTrigger>
                <SelectContent>
                  {availableTenders.map(tender => (
                    <SelectItem key={tender.id} value={tender.id}>
                      {tender.name} (Deadline: {new Date(tender.deadline).toLocaleDateString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Proposal Name *</Label>
              <Input
                id="name"
                placeholder="Enter proposal name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your proposal and value proposition"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Internal Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
              />
            </div>

            {selectedTender && (
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-base">Selected Tender Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>Name:</strong> {selectedTender.name}</p>
                  <p><strong>Deadline:</strong> {new Date(selectedTender.deadline).toLocaleDateString()}</p>
                  <p><strong>Items:</strong> {selectedTender.items.length} required</p>
                  <p><strong>Description:</strong> {selectedTender.description}</p>
                </CardContent>
              </Card>
            )}

            <Button onClick={handleNext} className="w-full">
              Next: Upload Proposal File
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Proposal File</CardTitle>
              <CardDescription>Upload your proposal document for AI analysis and matching</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-lg font-medium">Drop your proposal file here or click to browse</span>
                  <p className="text-sm text-muted-foreground mt-2">PDF, DOC, DOCX up to 10MB</p>
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                />
              </div>

              {file && (
                <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                  <FileText className="w-5 h-5" />
                  <span>{file.name}</span>
                  <span className="text-sm text-muted-foreground">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
              )}

              <Button onClick={handleNext} className="w-full" disabled={!file}>
                Process File & Match Items
              </Button>
            </CardContent>
          </Card>

          {/* Processing Status */}
          {(processing.parsing !== 'pending' || processing.signature !== 'pending' || processing.matching !== 'pending') && (
            <Card>
              <CardHeader>
                <CardTitle>File Processing & AI Analysis</CardTitle>
                <CardDescription>Your proposal file is being analyzed and matched with tender requirements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5" />
                    <span>File Parsing</span>
                  </div>
                  <Badge variant={getProcessingStatus(processing.parsing).variant}>
                    {getProcessingStatus(processing.parsing).text}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5" />
                    <span>Signature Verification</span>
                  </div>
                  <Badge variant={getProcessingStatus(processing.signature).variant}>
                    {getProcessingStatus(processing.signature).text}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Brain className="w-5 h-5" />
                    <span>AI Element Matching</span>
                  </div>
                  <Badge variant={getProcessingStatus(processing.matching).variant}>
                    {getProcessingStatus(processing.matching).text}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-success" />
                <span>AI Matching Complete</span>
              </CardTitle>
              <CardDescription>Review the AI-matched items and adjust matching percentages as needed</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Proposal Items & AI Matching</CardTitle>
                <Button onClick={addItem} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {proposalItems.map((item, index) => {
                const matchedTenderItem = selectedTender?.items.find(ti => ti.id === item.matchedTenderId);
                return (
                  <div key={index} className="border border-border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Proposal Item {index + 1}</h4>
                      <div className="flex items-center space-x-2">
                        {item.matchPercentage && (
                          <Badge variant={getMatchPercentageColor(item.matchPercentage)}>
                            <Percent className="w-3 h-3 mr-1" />
                            {item.matchPercentage}% Match
                          </Badge>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeItem(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label>Item Name</Label>
                        <Input
                          value={item.name}
                          onChange={(e) => updateItem(index, 'name', e.target.value)}
                          placeholder="Item name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Unit Cost ($)</Label>
                        <Input
                          type="number"
                          value={item.cost}
                          onChange={(e) => updateItem(index, 'cost', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Total Cost</Label>
                        <div className="p-2 bg-muted rounded text-sm font-medium">
                          ${(item.cost * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        placeholder="Detailed item description"
                      />
                    </div>

                    {/* AI Matching Section */}
                    <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                      <Label className="flex items-center space-x-2">
                        <Target className="w-4 h-4" />
                        <span>AI Tender Matching</span>
                      </Label>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Match to Tender Item</Label>
                          <Select 
                            value={item.matchedTenderId || ''} 
                            onValueChange={(value) => updateMatching(index, value, item.matchPercentage || 50)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select tender item to match" />
                            </SelectTrigger>
                            <SelectContent>
                              {selectedTender?.items.map(tenderItem => (
                                <SelectItem key={tenderItem.id} value={tenderItem.id}>
                                  {tenderItem.name} (Qty: {tenderItem.quantity})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Match Percentage</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={item.matchPercentage || ''}
                            onChange={(e) => updateMatching(index, item.matchedTenderId || '', parseInt(e.target.value) || 0)}
                            placeholder="Match %"
                          />
                        </div>
                      </div>

                      {matchedTenderItem && (
                        <div className="text-sm text-muted-foreground">
                          <p><strong>Tender Requirement:</strong> {matchedTenderItem.description}</p>
                          <p><strong>Required Quantity:</strong> {matchedTenderItem.quantity}</p>
                          <p><strong>Required Attributes:</strong> {Object.entries(matchedTenderItem.attributes).map(([k, v]) => `${k}: ${v}`).join(', ')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {proposalItems.length > 0 && (
                <Card className="bg-primary/5">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-2">
                        Total Proposal Value: ${proposalItems.reduce((sum, item) => sum + (item.cost * item.quantity), 0).toLocaleString()}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Average Match Score: {proposalItems.length > 0 
                          ? Math.round(proposalItems.reduce((sum, item) => sum + (item.matchPercentage || 0), 0) / proposalItems.length)
                          : 0}%
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          <div className="flex space-x-4">
            <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
              Back to Upload
            </Button>
            <Button onClick={handlePublish} className="flex-1">
              Submit Proposal
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}