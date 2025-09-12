import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from ".//ui/card";
import { Button } from ".//ui/button";
import { Badge } from ".//ui/badge";
import { Input } from ".//ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from ".//ui/select";
import { 
  Search, 
  Download, 
  RefreshCw, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Clock,
  Eye,
  EyeOff,
  Copy
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ExecutionLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  metadata?: Record<string, any>;
  requestId?: string;
  userId?: string;
  agentId?: string;
  executionTime?: number;
  tokensUsed?: number;
  cost?: number;
}

interface ExecutionLogsProps {
  logs: ExecutionLog[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onExport?: () => void;
  className?: string;
}

export function ExecutionLogs({
  logs,
  isLoading = false,
  onRefresh,
  onExport,
  className,
}: ExecutionLogsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [showMetadata, setShowMetadata] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  // Filter logs based on search and level
  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.requestId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.agentId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    
    return matchesSearch && matchesLevel;
  });

  const toggleLogExpansion = (logId: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'info':
        return <Info className="w-4 h-4 text-blue-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      default:
        return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  const getLevelBadge = (level: string) => {
    const variants = {
      info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      error: 'bg-red-500/20 text-red-400 border-red-500/30',
      success: 'bg-green-500/20 text-green-400 border-green-500/30',
    };

    return (
      <Badge className={cn('border', variants[level as keyof typeof variants] || variants.info)}>
        {level.toUpperCase()}
      </Badge>
    );
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(timestamp);
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  return (
    <Card className={cn('bg-white/5 backdrop-blur-xl border border-white/20', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Execution Logs
            <Badge className="bg-white/20 text-white border-white/30">
              {filteredLogs.length}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMetadata(!showMetadata)}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              {showMetadata ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              Metadata
            </Button>
            {onExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            )}
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
          </div>
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white/10 border-white/20">
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="success">Success</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-white/10 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-8">
            <Info className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <p className="text-white/60">No logs found</p>
            {searchTerm || levelFilter !== 'all' ? (
              <p className="text-white/40 text-sm mt-2">Try adjusting your filters</p>
            ) : (
              <p className="text-white/40 text-sm mt-2">No execution logs available</p>
            )}
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className={cn(
                  'p-4 rounded-xl border transition-all duration-200',
                  log.level === 'error' && 'bg-red-500/10 border-red-500/20',
                  log.level === 'warning' && 'bg-yellow-500/10 border-yellow-500/20',
                  log.level === 'success' && 'bg-green-500/10 border-green-500/20',
                  log.level === 'info' && 'bg-blue-500/10 border-blue-500/20',
                  'hover:bg-white/5 cursor-pointer'
                )}
                onClick={() => toggleLogExpansion(log.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getLevelIcon(log.level)}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-white font-medium">{log.message}</span>
                        {getLevelBadge(log.level)}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/60">
                        <span>{formatTimestamp(log.timestamp)}</span>
                        {log.executionTime && (
                          <span>• {formatDuration(log.executionTime)}</span>
                        )}
                      </div>
                    </div>

                    {/* Request Info */}
                    <div className="flex items-center gap-4 text-xs text-white/60">
                      {log.requestId && (
                        <div className="flex items-center gap-1">
                          <span>Request ID:</span>
                          <code className="bg-white/10 px-2 py-1 rounded text-xs">
                            {log.requestId}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(log.requestId!);
                            }}
                            className="h-4 w-4 p-0 text-white/60 hover:text-white"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                      {log.agentId && (
                        <div className="flex items-center gap-1">
                          <span>Agent:</span>
                          <code className="bg-white/10 px-2 py-1 rounded text-xs">
                            {log.agentId}
                          </code>
                        </div>
                      )}
                      {log.userId && (
                        <div className="flex items-center gap-1">
                          <span>User:</span>
                          <code className="bg-white/10 px-2 py-1 rounded text-xs">
                            {log.userId}
                          </code>
                        </div>
                      )}
                    </div>

                    {/* Metrics */}
                    {(log.executionTime || log.tokensUsed || log.cost) && (
                      <div className="flex items-center gap-4 text-xs text-white/60">
                        {log.executionTime && (
                          <span>⏱️ {formatDuration(log.executionTime)}</span>
                        )}
                        {log.tokensUsed && (
                          <span>🧠 {log.tokensUsed.toLocaleString()} tokens</span>
                        )}
                        {log.cost && (
                          <span>💰 {log.cost} credits</span>
                        )}
                      </div>
                    )}

                    {/* Expanded Metadata */}
                    {expandedLogs.has(log.id) && showMetadata && log.metadata && (
                      <div className="mt-3 p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white/80">Metadata</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(JSON.stringify(log.metadata, null, 2));
                            }}
                            className="h-6 w-6 p-0 text-white/60 hover:text-white"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <pre className="text-xs text-white/70 overflow-x-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Hook for managing execution logs
export function useExecutionLogs() {
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (log: Omit<ExecutionLog, 'id' | 'timestamp'>) => {
    const newLog: ExecutionLog = {
      ...log,
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const exportLogs = () => {
    const csvContent = [
      'Timestamp,Level,Message,Request ID,Agent ID,User ID,Execution Time,Tokens Used,Cost,Metadata',
      ...logs.map(log => [
        log.timestamp.toISOString(),
        log.level,
        `"${log.message.replace(/"/g, '""')}"`,
        log.requestId || '',
        log.agentId || '',
        log.userId || '',
        log.executionTime || '',
        log.tokensUsed || '',
        log.cost || '',
        log.metadata ? `"${JSON.stringify(log.metadata).replace(/"/g, '""')}"` : '',
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `execution-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    logs,
    isLoading,
    addLog,
    clearLogs,
    exportLogs,
    setIsLoading,
  };
} 