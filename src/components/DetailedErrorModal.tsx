"use client";

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui';
import { AlertTriangle, RefreshCw, MessageCircle } from 'lucide-react';

interface DetailedErrorModalProps {
  error: {
    message: string;
    userMessage: string;
    suggestedActions?: string[];
    retryable: boolean;
    severity: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onRetry?: () => void;
  onReport?: () => void;
  showReportButton?: boolean;
}

export const DetailedErrorModal: React.FC<DetailedErrorModalProps> = ({
  error,
  isOpen,
  onClose,
  onRetry,
  onReport,
  showReportButton = false,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span>Error Occurred</span>
          </DialogTitle>
          <DialogDescription>
            {error.userMessage}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {error.suggestedActions && error.suggestedActions.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-white mb-2">Suggested Actions:</h4>
              <ul className="text-sm text-white/70 space-y-1">
                {error.suggestedActions.map((action, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span>•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="flex space-x-2 pt-4">
            <Button variant="ghost" onClick={onClose} className="flex-1">
              Close
            </Button>
            
            {error.retryable && onRetry && (
              <Button onClick={onRetry} className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
            
            {showReportButton && onReport && (
              <Button variant="outline" onClick={onReport}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Report
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
