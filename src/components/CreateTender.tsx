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
import { Upload, FileText, Shield, Brain, CheckCircle, ArrowLeft, Plus, Trash2 } from 'lucide-react';

interface CreateTenderProps {
  onBack: () => void;
}

interface TenderItem {
  name: string;
  description: string;
  quantity: number;
  attributes: Record<string, string>;
}

export function CreateTender({ onBack }: CreateTenderProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    deadline: '',
    visibility: 'public'
  });
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState({
    parsing: 'pending' as 'pending' | 'progress' | 'completed',
    signature: 'pending' as 'pending' | 'progress' | 'completed',
    extraction: 'pending' as 'pending' | 'progress' | 'completed'
  });
  const [extractedItems, setExtractedItems] = useState<TenderItem[]>([]);
  const { toast } = useToast();

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

    // Element Extraction
    setProcessing(prev => ({ ...prev, extraction: 'progress' }));
    await new Promise(resolve => setTimeout(resolve, 2500));
    setProcessing(prev => ({ ...prev, extraction: 'completed' }));

    // Simulate extracted items
    setExtractedItems([
      {
        name: 'Business Laptop',
        description: 'High-performance laptop for business use',
        quantity: 25,
        attributes: { brand: 'Dell/Lenovo', ram: '16GB', storage: '512GB SSD' }
      },
      {
        name: 'Conference Projector',
        description: 'HD projector for presentations',
        quantity: 5,
        attributes: { brightness: '3000+ lumens', resolution: '1080p' }
      }
    ]);

    setStep(3);
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!formData.name || !formData.deadline) {
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
          description: "Please upload a tender file",
          variant: "destructive"
        });
        return;
      }
      await simulateProcessing();
    }
  };

  const addItem = () => {
    setExtractedItems(prev => [...prev, {
      name: '',
      description: '',
      quantity: 1,
      attributes: {}
    }]);
  };

  const removeItem = (index: number) => {
    setExtractedItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    setExtractedItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const addAttribute = (itemIndex: number, key: string, value: string) => {
    setExtractedItems(prev => prev.map((item, i) => 
      i === itemIndex ? { 
        ...item, 
        attributes: { ...item.attributes, [key]: value }
      } : item
    ));
  };

  const handlePublish = () => {
    toast({
      title: "Tender published!",
      description: "Your tender is now visible to suppliers",
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

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Create New Tender</h1>
      </div>

      {/* Progress indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <span className={`font-medium ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
              1. Tender Info
            </span>
            <span className={`font-medium ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
              2. File Upload
            </span>
            <span className={`font-medium ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
              3. Review & Publish
            </span>
          </div>
          <Progress value={(step / 3) * 100} className="h-2" />
        </CardContent>
      </Card>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Tender Information</CardTitle>
            <CardDescription>Provide basic details about your tender</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tender Name *</Label>
              <Input
                id="name"
                placeholder="Enter tender name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your tender requirements"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline *</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="visibility">Visibility</Label>
              <Select value={formData.visibility} onValueChange={(value) => setFormData(prev => ({ ...prev, visibility: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public - Visible to all suppliers</SelectItem>
                  <SelectItem value="private">Private - Invite specific suppliers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleNext} className="w-full">
              Next: Upload File
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Tender File</CardTitle>
              <CardDescription>Upload your tender document for processing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-lg font-medium">Drop your file here or click to browse</span>
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
                Process File
              </Button>
            </CardContent>
          </Card>

          {/* Processing Status */}
          {(processing.parsing !== 'pending' || processing.signature !== 'pending' || processing.extraction !== 'pending') && (
            <Card>
              <CardHeader>
                <CardTitle>File Processing</CardTitle>
                <CardDescription>Your file is being analyzed</CardDescription>
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
                    <span>AI Element Extraction</span>
                  </div>
                  <Badge variant={getProcessingStatus(processing.extraction).variant}>
                    {getProcessingStatus(processing.extraction).text}
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
                <span>Processing Complete</span>
              </CardTitle>
              <CardDescription>Review and edit the extracted tender items</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Extracted Items</CardTitle>
                <Button onClick={addItem} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {extractedItems.map((item, index) => (
                <div key={index} className="border border-border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Item {index + 1}</h4>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
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
                      <Label>Description</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        placeholder="Item description"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Attributes</Label>
                    <div className="space-y-2">
                      {Object.entries(item.attributes).map(([key, value], attrIndex) => (
                        <div key={attrIndex} className="flex items-center space-x-2">
                          <Input value={key} disabled className="flex-1" />
                          <span>=</span>
                          <Input 
                            value={value} 
                            onChange={(e) => addAttribute(index, key, e.target.value)}
                            className="flex-1" 
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex space-x-4">
            <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
              Back to Upload
            </Button>
            <Button onClick={handlePublish} className="flex-1">
              Publish Tender
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}