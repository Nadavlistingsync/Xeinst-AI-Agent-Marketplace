"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from ".//ui/dialog";
import { Button } from ".//ui/button";
import { Alert, AlertDescription, AlertTitle } from ".//ui/alert";
import { Badge } from ".//ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from ".//ui/tabs";
import { 
  AlertTriangle, 
  Info, 
  XCircle, 
  RefreshCw, 
  Copy, 
  ExternalLink, 
  Clock, 
  Code, 
  User, 
  Server,
  Network,
  Shield,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ErrorCategory, ErrorSeverity } from "../lib/enhanced-error-handling";
import { toast } from 'sonner';

interface DetailedError {
  message: string;
  status: number;
  code?: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  details?: unknown;
  retryable: boolean;
  retryAfter?: number;
  userMessage: string;
  suggestedActions?: string[];
  timestamp: string;
  requestId?: string;
  stack?: string;
  context?: Record<string, unknown>;
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  response?: unknown;
}

interface DetailedErrorModalProps {
  error: DetailedError;
  isOpen: boolean;
  onClose: () => void;
  onRetry?: () => void;
  onReport?: () => void;
  showReportButton?: boolean;
}

export function DetailedErrorModal({
  error,
  isOpen,
  onClose,
  onRetry,
  onReport,
  showReportButton = true
}: DetailedErrorModalProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));

  const getErrorIcon = (category: ErrorCategory) => {
    switch (category) {
      case ErrorCategory.NETWORK:
        return <Network className="w-5 h-5" />;
      case ErrorCategory.VALIDATION:
        return <FileText className="w-5 h-5" />;
      case ErrorCategory.AUTHENTICATION:
      case ErrorCategory.AUTHORIZATION:
        return <Shield className="w-5 h-5" />;
      case ErrorCategory.RATE_LIMIT:
        return <Clock className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getErrorColor = (category: ErrorCategory) => {
    switch (category) {
      case ErrorCategory.NETWORK:
      case ErrorCategory.RATE_LIMIT:
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case ErrorCategory.VALIDATION:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case ErrorCategory.AUTHENTICATION:
      case ErrorCategory.AUTHORIZATION:
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const getSeverityBadge = (severity: ErrorSeverity) => {
    const variants = {
      [ErrorSeverity.LOW]: 'secondary',
      [ErrorSeverity.MEDIUM]: 'default',
      [ErrorSeverity.HIGH]: 'destructive',
      [ErrorSeverity.CRITICAL]: 'destructive'
    } as const;

    return (
      <Badge variant={variants[severity]} className="ml-2">
        {severity.toLowerCase()}
      </Badge>
    );
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const formatJson = (obj: unknown) => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getErrorColor(error.category)}`}>
              {getErrorIcon(error.category)}
            </div>
            <div className="flex-1">
              <span>Error Details</span>
              {getSeverityBadge(error.severity)}
            </div>
            {error.requestId && (
              <Badge variant="outline" className="text-xs">
                ID: {error.requestId}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Detailed information about the error that occurred
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="context">Context</TabsTrigger>
              <TabsTrigger value="technical">Technical</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto mt-4">
              <TabsContent value="overview" className="space-y-4">
                <Alert className={getErrorColor(error.category)}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error Summary</AlertTitle>
                  <AlertDescription className="mt-2">
                    <p className="font-medium">{error.userMessage}</p>
                    <p className="text-sm mt-1 opacity-80">{error.message}</p>
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Error Information</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <Badge variant="outline">{error.category}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span>{error.status}</span>
                      </div>
                      {error.code && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Code:</span>
                          <span className="font-mono text-xs">{error.code}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Timestamp:</span>
                        <span className="text-xs">{formatTimestamp(error.timestamp)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Request Information</h4>
                    <div className="space-y-1 text-sm">
                      {error.url && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">URL:</span>
                          <span className="font-mono text-xs truncate max-w-32" title={error.url}>
                            {error.url}
                          </span>
                        </div>
                      )}
                      {error.method && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Method:</span>
                          <Badge variant="outline">{error.method}</Badge>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Retryable:</span>
                        <Badge variant={error.retryable ? "default" : "secondary"}>
                          {error.retryable ? "Yes" : "No"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {error.suggestedActions && error.suggestedActions.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Suggested Actions</h4>
                    <ul className="space-y-1">
                      {error.suggestedActions.map((action, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-green-500 mt-0.5">•</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Error Details</h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <pre className="text-xs overflow-x-auto">
                        {formatJson(error.details)}
                      </pre>
                    </div>
                  </div>

                  {error.response && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Response Data</h4>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <pre className="text-xs overflow-x-auto">
                          {formatJson(error.response)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="context" className="space-y-4">
                <div className="space-y-4">
                  {error.context && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Error Context</h4>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <pre className="text-xs overflow-x-auto">
                          {formatJson(error.context)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {error.headers && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Request Headers</h4>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <pre className="text-xs overflow-x-auto">
                          {formatJson(error.headers)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="technical" className="space-y-4">
                <div className="space-y-4">
                  {error.stack && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Stack Trace</h4>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                          {error.stack}
                        </pre>
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold text-sm mb-2">Raw Error Data</h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <pre className="text-xs overflow-x-auto">
                        {formatJson(error)}
                      </pre>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(formatJson(error), 'Error details')}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Details
            </Button>
            {error.requestId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(error.requestId!, 'Request ID')}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy ID
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            {showReportButton && onReport && (
              <Button variant="outline" size="sm" onClick={onReport}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Report Issue
              </Button>
            )}
            {error.retryable && onRetry && (
              <Button size="sm" onClick={onRetry}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
