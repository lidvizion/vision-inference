'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Target, 
  Layers, 
  Tag, 
  Clock, 
  Cpu, 
  Copy, 
  Download,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { InferenceResponse, BackendType, BACKEND_CONFIGS } from '@/types';
import { useState } from 'react';
import { useToast } from '@/components/ui/toast';

interface ResultsTabProps {
  results: InferenceResponse | null;
  selectedBackend: BackendType;
}

export default function ResultsTab({ results, selectedBackend }: ResultsTabProps) {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleCopyJSON = async () => {
    if (!results) return;
    
    try {
      await navigator.clipboard.writeText(JSON.stringify(results, null, 2));
      setCopied(true);
      showToast({
        title: 'Copied to Clipboard',
        description: 'Inference results copied successfully',
        type: 'success'
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      showToast({
        title: 'Copy Failed',
        description: 'Unable to copy to clipboard. Please try again or use the download option.',
        type: 'error'
      });
    }
  };

  const handleDownloadJSON = () => {
    if (!results) return;
    
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inference-results-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!results) {
    return (
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center space-y-6">
            <div className="relative">
              <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground" />
              <div className="absolute inset-0 h-16 w-16 mx-auto">
                <div className="h-full w-full rounded-full border-4 border-blue-200 animate-pulse"></div>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                No Results Yet
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                Run inference to see detection results, instance masks, and classification labels
              </p>
            </div>
            <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span>Detections</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Instances</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>Labels</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const backendConfig = BACKEND_CONFIGS[selectedBackend];

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Inference Results</span>
          </CardTitle>
          <CardDescription>
            Results from {backendConfig.name} backend
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${backendConfig.color}`} />
              <span className="text-sm font-medium">{backendConfig.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{backendConfig.latency}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Cpu className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{results.metadata.model_version}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {new Date(results.metadata.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Detections */}
        <Card className="hover:shadow-lg transition-all duration-300 animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20">
                <Target className="h-4 w-4 text-red-600" />
              </div>
              <span>Detections</span>
              <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300">
                {results.detections.length}
              </Badge>
            </CardTitle>
            <CardDescription>
              Object detection bounding boxes with confidence scores
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {results.detections.map((detection, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded-full bg-red-500 shadow-sm" />
                  <div>
                    <p className="font-medium capitalize text-sm">{detection.class}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      [{detection.box.join(', ')}]
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300">
                  {Math.round(detection.score * 100)}%
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Instances */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Layers className="h-5 w-5 text-green-600" />
              <span>Instances</span>
              <Badge variant="secondary">{results.instances.length}</Badge>
            </CardTitle>
            <CardDescription>
              Instance segmentation masks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {results.instances.map((instance, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <div>
                    <p className="font-medium capitalize">{instance.class}</p>
                    <p className="text-sm text-muted-foreground">
                      Mask data available
                    </p>
                  </div>
                </div>
                <Badge variant="outline">
                  {Math.round(instance.score * 100)}%
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Labels */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Tag className="h-5 w-5 text-blue-600" />
              <span>Labels</span>
              <Badge variant="secondary">{results.labels.length}</Badge>
            </CardTitle>
            <CardDescription>
              Scene classification labels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {results.labels.map((label, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <div>
                    <p className="font-medium capitalize">{label.class}</p>
                    <p className="text-sm text-muted-foreground">
                      Scene classification
                    </p>
                  </div>
                </div>
                <Badge variant="outline">
                  {Math.round(label.score * 100)}%
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* JSON Output */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>JSON Output</span>
            </CardTitle>
            <CardDescription>
              Raw inference response data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyJSON}
                className="flex items-center space-x-2"
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadJSON}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </Button>
            </div>
            
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 max-h-64 overflow-auto">
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
