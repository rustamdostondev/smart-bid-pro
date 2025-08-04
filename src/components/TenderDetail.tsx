import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TenderOwnerDetail } from "@/components/TenderOwnerDetail";
import { mockTenders, getCurrentUser, type Tender } from "@/lib/mockData";
import {
  ArrowLeft,
  Calendar,
  Lock,
  Globe,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Package,
  Building,
} from "lucide-react";

interface TenderDetailProps {
  tenderId: string;
  onBack: () => void;
  onViewProposalDetail?: (proposalId: string) => void;
  onOpenAnalytics?: (tenderId: string) => void;
  previousPage?: string;
  showOwnerView?: boolean; // Controls whether to show owner detail view
}

export function TenderDetail({
  tenderId,
  onBack,
  onViewProposalDetail,
  onOpenAnalytics,
  previousPage = "dashboard",
  showOwnerView = true,
}: TenderDetailProps) {
  const user = getCurrentUser();
  const tender = mockTenders.find((t) => t.id === tenderId);

  if (!tender) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to{" "}
            {previousPage === "all-tenders"
              ? "All Tenders"
              : previousPage === "my-tenders"
              ? "My Tenders"
              : "Dashboard"}
          </Button>
        </div>
        <Card className="text-center py-16">
          <CardContent>
            <h3 className="text-lg font-semibold mb-2">Tender Not Found</h3>
            <p className="text-muted-foreground">
              The tender you're looking for doesn't exist or you don't have
              permission to view it.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "published":
        return "default";
      case "draft":
        return "secondary";
      case "closed":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "published":
        return <CheckCircle className="w-4 h-4" />;
      case "draft":
        return <Clock className="w-4 h-4" />;
      case "closed":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getProcessingProgress = (processing: any) => {
    const steps = ["parsing", "signature", "extraction"];
    const completed = steps.filter(
      (step) => processing?.[step] === "completed"
    ).length;
    return (completed / steps.length) * 100;
  };

  const isDeadlineNear = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  };

  const isDeadlinePassed = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    return deadlineDate < today;
  };

  const canEdit = user?.id === tender.createdBy || user?.role === "admin";
  const deadlineNear = isDeadlineNear(tender.deadline);
  const deadlinePassed = isDeadlinePassed(tender.deadline);

  // If user is the tender owner and showOwnerView is true, show the owner detail view
  if (canEdit && user?.id === tender.createdBy && showOwnerView) {
    return (
      <TenderOwnerDetail
        tenderId={tenderId}
        onBack={onBack}
        onViewProposalDetail={onViewProposalDetail}
        onOpenAnalytics={onOpenAnalytics}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="border-gray-300 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to{" "}
            {previousPage === "all-tenders"
              ? "All Tenders"
              : previousPage === "my-tenders"
              ? "My Tenders"
              : "Dashboard"}
          </Button>
        </div>
      </div>

      {/* Tender Header Card */}
      <Card
        className={`border-l-4 ${
          deadlinePassed
            ? "border-l-red-500"
            : deadlineNear
            ? "border-l-yellow-500"
            : tender.status === "published"
            ? "border-l-green-500"
            : "border-l-gray-300"
        }`}
      >
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 ">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {tender.visibility === "public" ? (
                  <Globe className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Lock className="w-5 h-5 text-muted-foreground" />
                )}
                <CardTitle className="text-2xl">{tender.name}</CardTitle>
              </div>
              <CardDescription className="text-base mb-4">
                {tender.description}
              </CardDescription>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  <span>Created by Admin</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Created: {new Date(tender.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  <span>{tender.items.length} items</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6 mt-1">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="items">Items ({tender.items.length})</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-1">
            {/* Tender Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Tender Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge
                      variant={getStatusVariant(tender.status)}
                      className="flex items-center gap-1"
                    >
                      {getStatusIcon(tender.status)}
                      {tender.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Visibility:</span>
                    <div className="flex items-center gap-1">
                      {tender.visibility === "public" ? (
                        <Globe className="w-4 h-4" />
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                      <span className="capitalize">{tender.visibility}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deadline:</span>
                    <span
                      className={
                        deadlinePassed
                          ? "text-red-600"
                          : deadlineNear
                          ? "text-yellow-600"
                          : ""
                      }
                    >
                      {new Date(tender.deadline).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Items Count:</span>
                    <span>{tender.items.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span>
                      {new Date(tender.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* File Management Section */}
            <Card className="mt-6">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Original tender file
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* File Upload Status */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-full">
                        <FileText className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-green-800">
                          {tender.name
                            .replace(/[^a-zA-Z0-9]/g, "_")
                            .toLowerCase()}
                          _tender.pdf
                        </h4>
                        <p className="text-sm text-green-600">
                          Uploaded on{" "}
                          {new Date(tender.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-green-600 font-medium">
                        2.4 MB
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-green-200 text-green-700 hover:bg-green-50"
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-full">
                        <FileText className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-green-800">
                          {tender.name
                            .replace(/[^a-zA-Z0-9]/g, "_")
                            .toLowerCase()}
                          _tender.pdf
                        </h4>
                        <p className="text-sm text-green-600">
                          Uploaded on{" "}
                          {new Date(tender.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-green-600 font-medium">
                        2.4 MB
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-green-200 text-green-700 hover:bg-green-50"
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Items Tab */}
        <TabsContent value="items" className="space-y-6">
          <div className="grid gap-4">
            {tender.items.map((item, index) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </div>
                    <Badge variant="outline">Qty: {item.quantity}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">Attributes:</h4>
                      <div className="grid gap-2 md:grid-cols-2">
                        {Object.entries(item.attributes).map(([key, value]) => (
                          <div
                            key={key}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-muted-foreground capitalize">
                              {key.replace("_", " ")}:
                            </span>
                            <span>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
