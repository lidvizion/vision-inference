'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { InferenceResponse, Detection, Instance } from '@/types';

interface MediaViewerProps {
  imageUrl: string;
  results: InferenceResponse | null;
  showDetections: boolean;
  showInstances: boolean;
  showLabels: boolean;
  isProcessing: boolean;
  progress: number;
  onFileUpload?: (file: File) => void;
}

export default function MediaViewer({
  imageUrl,
  results,
  showDetections,
  showInstances,
  showLabels,
  isProcessing,
  progress,
  onFileUpload
}: MediaViewerProps) {
  const [imageError, setImageError] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleImageLoad = () => {
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file && onFileUpload) {
      onFileUpload(file);
    }
  };

  const renderDetectionBox = (detection: Detection, index: number) => {
    if (!showDetections) return null;
    
    const [x1, y1, x2, y2] = detection.box;
    const width = x2 - x1;
    const height = y2 - y1;
    
    return (
      <div
        key={index}
        className="absolute border-2 border-red-500 bg-red-500/20 animate-pulse-slow"
        style={{
          left: `${x1}px`,
          top: `${y1}px`,
          width: `${width}px`,
          height: `${height}px`,
        }}
      >
        <Badge 
          variant="destructive" 
          className="absolute -top-6 left-0 text-xs shadow-lg"
        >
          {detection.class} ({Math.round(detection.score * 100)}%)
        </Badge>
      </div>
    );
  };

  const renderInstanceMask = (instance: Instance, index: number) => {
    if (!showInstances) return null;
    
    return (
      <div
        key={`instance-${index}`}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-2 left-2">
          <Badge 
            variant="secondary" 
            className="bg-green-500/90 text-white text-xs shadow-lg animate-fade-in"
          >
            {instance.class} ({Math.round(instance.score * 100)}%)
          </Badge>
        </div>
      </div>
    );
  };

  const renderLabels = () => {
    if (!showLabels || !results?.labels) return null;
    
    return (
      <div className="absolute top-4 right-4 space-y-2">
        {results.labels.map((label, index) => (
          <Badge 
            key={index}
            variant="outline" 
            className="bg-blue-500/90 text-white border-blue-300 text-xs shadow-lg animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {label.class} ({Math.round(label.score * 100)}%)
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-200">
        <CardContent className="p-0">
          <div 
            ref={containerRef}
            id="media-viewer"
            data-testid="media-viewer"
            className={`relative bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 min-h-[500px] flex items-center justify-center transition-colors ${
              isDragOver ? 'bg-blue-100 dark:bg-blue-900/20 border-2 border-dashed border-blue-400' : ''
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
          {/* Main Image */}
          <div className="relative">
            {false && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <p className="text-sm text-muted-foreground">Loading image...</p>
                </div>
              </div>
            )}
            
            {imageError ? (
              <div className="flex flex-col items-center justify-center space-y-4 p-8">
                <AlertCircle className="h-12 w-12 text-red-500" />
                <div className="text-center">
                  <h3 className="font-semibold text-lg text-red-600">Image Load Error</h3>
                  <p className="text-sm text-muted-foreground">
                    Failed to load the image. Please try again.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setImageError(false);
                    // Retry logic
                  }}
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Retry</span>
                </Button>
              </div>
            ) : imageUrl && !imageUrl.includes('/sample/') ? (
              // Show actual uploaded image or video
              <div className="relative">
                {imageUrl.match(/\.(mp4|webm|ogg|mov|avi)$/i) ? (
                  // Video file
                  <video
                    src={imageUrl}
                    controls
                    className="max-w-full h-auto shadow-lg rounded-lg"
                    onLoadedData={handleImageLoad}
                    onError={handleImageError}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  // Image file
                  <Image
                    src={imageUrl}
                    alt="Inference target"
                    width={800}
                    height={600}
                    className="max-w-full h-auto shadow-lg rounded-lg"
                    priority
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                  />
                )}
                
                {/* Overlays */}
                {results && (
                  <>
                    {/* Detection boxes */}
                    {results.detections.map((detection, index) => 
                      renderDetectionBox(detection, index)
                    )}
                    
                    {/* Instance masks */}
                    {results.instances.map((instance, index) => 
                      renderInstanceMask(instance, index)
                    )}
                    
                    {/* Labels */}
                    {renderLabels()}
                  </>
                )}
              </div>
            ) : (
              // Show text placeholder for sample images
              <div className="text-center space-y-6 p-8">
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 rounded-full bg-slate-200 dark:bg-slate-700">
                    <Upload className="h-12 w-12 text-slate-500 dark:text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Image Display Area
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                      Upload an image or video file to see it displayed here with inference overlays.
                      Drag and drop files or click the upload button above.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Processing Overlay */}
          {isProcessing && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-8 max-w-sm w-full mx-4 shadow-2xl border">
                <div className="text-center space-y-6">
                  <div className="relative">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
                    <div className="absolute inset-0 h-12 w-12 mx-auto">
                      <div className="h-full w-full rounded-full border-4 border-blue-200 animate-ping"></div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Processing Inference
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Running {results?.metadata?.backend || 'ONNX'} inference...
                    </p>
                  </div>
                  <div className="space-y-3">
                    <Progress value={progress} className="w-full h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Analyzing image...</span>
                      <span className="font-mono">{Math.round(progress)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* Results Summary Overlay */}
          {results && !isProcessing && !imageError && (
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg p-4 shadow-lg border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-sm font-medium">{results.detections.length} Detections</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium">{results.instances.length} Instances</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm font-medium">{results.labels.length} Labels</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {results.metadata.inference_time}ms • {results.metadata.backend}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}