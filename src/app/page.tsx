'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Upload, 
  Download, 
  Camera, 
  Settings, 
  Code, 
  FileText,
  Zap,
  Cpu,
  Monitor,
  Loader2
} from 'lucide-react';
import { InferenceResponse, BackendType, BACKEND_CONFIGS } from '@/types';
import { simulateInference, isLiveMode } from '@/lib/inference';
import { validateFile, getFileTypeCategory } from '@/lib/utils';
import { logger, logInfo, logError, logBusiness } from '@/lib/logger';
import { TracingUtils, MetricsUtils } from '@/lib/tracing';
import MediaViewer from '@/components/MediaViewer';
import ResultsTab from '../components/ResultsTab';
import DocsTab from '../components/DocsTab';
import DownloadsTab from '../components/DownloadsTab';
import OverlayControls from '@/components/ui/OverlayControls';
import { useToast, ToastContainer } from '@/components/ui/toast';

export default function Home() {
  const [currentImage, setCurrentImage] = useState('');
  const [selectedBackend, setSelectedBackend] = useState<BackendType>('ONNX');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<InferenceResponse | null>(null);
  const [showDetections, setShowDetections] = useState(true);
  const [showInstances, setShowInstances] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [liveMode, setLiveMode] = useState(false);
  const [isScreenshotting, setIsScreenshotting] = useState(false);
  const { showToast, toasts } = useToast();

  useEffect(() => {
    setLiveMode(isLiveMode());
    
    // Listen for file upload events from OverlayControls
    const handleFileUploadEvent = (event: CustomEvent) => {
      handleFileUpload(event.detail);
    };
    
    window.addEventListener('fileUpload', handleFileUploadEvent as EventListener);
    
    return () => {
      window.removeEventListener('fileUpload', handleFileUploadEvent as EventListener);
    };
  }, []);

  const handleInference = async () => {
    if (!currentImage) {
      logBusiness('Inference attempted without image', {
        component: 'main-page',
        operation: 'inference',
        backend: selectedBackend,
      });
      
      showToast({
        title: 'No Image Selected',
        description: 'Please select an image first',
        type: 'error'
      });
      return;
    }

    logBusiness('Starting inference', {
      component: 'main-page',
      operation: 'inference',
      backend: selectedBackend,
      hasImage: !!currentImage,
    });

    setIsProcessing(true);
    setProgress(0);
    setResults(null);

    showToast({
      title: 'Starting Inference',
      description: `Running ${selectedBackend} inference...`,
      type: 'info'
    });

    // Simulate progress with more realistic steps
    const progressSteps = [10, 25, 45, 65, 80, 90];
    let currentStep = 0;

    const progressInterval = setInterval(() => {
      if (currentStep < progressSteps.length) {
        setProgress(progressSteps[currentStep]);
        currentStep++;
      } else {
        clearInterval(progressInterval);
      }
    }, 300);

    try {
      const response = await simulateInference(selectedBackend);
      setResults(response);
      setProgress(100);
      
      logBusiness('Inference completed successfully', {
        component: 'main-page',
        operation: 'inference',
        backend: selectedBackend,
        detections: response.detections.length,
        instances: response.instances.length,
        labels: response.labels.length,
        inferenceTime: response.metadata.inference_time,
      });
      
      showToast({
        title: 'Inference Complete',
        description: `Found ${response.detections.length} detections in ${response.metadata.inference_time}ms`,
        type: 'success'
      });
      
      // Small delay to show 100% completion
      setTimeout(() => {
        setIsProcessing(false);
      }, 500);
    } catch (error) {
      logError('Inference failed', {
        component: 'main-page',
        operation: 'inference',
        backend: selectedBackend,
      }, error as Error);
      
      // Provide more specific error messages based on error type
      let errorMessage = 'Please try again or check your connection';
      if (error instanceof Error) {
        if (error.message.includes('Network error')) {
          errorMessage = 'Network connection issue. Please check your internet connection.';
        } else if (error.message.includes('Data parsing error')) {
          errorMessage = 'Invalid data received. Please try again.';
        } else if (error.message.includes('Inference failed')) {
          errorMessage = error.message;
        }
      }
      
      showToast({
        title: 'Inference Failed',
        description: errorMessage,
        type: 'error'
      });
      setIsProcessing(false);
    } finally {
      clearInterval(progressInterval);
    }
  };

  const handleFileUpload = (file: File) => {
    // Enhanced file validation
    const validation = validateFile(file);
    if (!validation.isValid) {
      showToast({
        title: 'File Validation Failed',
        description: validation.error || 'Invalid file format or size',
        type: 'error'
      });
      return;
    }

    try {
      // Create object URL for the uploaded file
      const fileUrl = URL.createObjectURL(file);
      setCurrentImage(fileUrl);

      const fileType = getFileTypeCategory(file.type);
      showToast({
        title: `${fileType.charAt(0).toUpperCase() + fileType.slice(1)} Uploaded`,
        description: `${file.name} uploaded successfully`,
        type: 'success'
      });
    } catch (error) {
      console.error('File upload error:', error);
      showToast({
        title: 'Upload Failed',
        description: 'Failed to process the uploaded file. Please try again.',
        type: 'error'
      });
    }
  };

  const handleScreenshot = async () => {
    if (isScreenshotting) return; // Prevent multiple simultaneous screenshots
    
    setIsScreenshotting(true);
    
    try {
      showToast({
        title: 'Capturing Screenshot',
        description: 'Please wait while we capture the image...',
        type: 'info'
      });

      // Dynamic import with error handling
      const html2canvas = (await import('html2canvas')).default;
      
      // Wait a bit for the DOM to be ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const element = document.getElementById('media-viewer');
      
      if (!element) {
        // Try alternative selectors
        const alternativeElement = document.querySelector('[data-testid="media-viewer"]') || 
                                 document.querySelector('.media-viewer') ||
                                 document.querySelector('[id*="media"]');
        
        if (!alternativeElement) {
          throw new Error('Media viewer element not found. Please ensure the Media tab is active and try again.');
        }
        
        // Use the alternative element
        const canvas = await html2canvas(alternativeElement as HTMLElement, {
          backgroundColor: '#ffffff',
          scale: 1.5,
          useCORS: true,
          allowTaint: true,
          logging: false,
          width: (alternativeElement as HTMLElement).scrollWidth,
          height: (alternativeElement as HTMLElement).scrollHeight,
          ignoreElements: (element) => {
            return element.classList.contains('animate-pulse') || 
                   element.classList.contains('animate-spin') ||
                   element.classList.contains('animate-ping');
          },
          onclone: (clonedDoc) => {
            const style = clonedDoc.createElement('style');
            style.textContent = `
              * {
                animation: none !important;
                transition: none !important;
              }
              .animate-pulse, .animate-spin, .animate-ping {
                animation: none !important;
              }
            `;
            clonedDoc.head.appendChild(style);
            
            const images = clonedDoc.querySelectorAll('img');
            images.forEach(img => {
              if (!img.complete) {
                img.style.display = 'none';
              }
            });
          }
        });

        // Create download link
        const link = document.createElement('a');
        link.download = 'edge-vision-inference-sdk.png';
        link.href = canvas.toDataURL('image/png', 1.0);
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast({
          title: 'Screenshot Saved',
          description: 'Image saved as edge-vision-inference-sdk.png',
          type: 'success'
        });
        
        setIsScreenshotting(false);
        return;
      }

      // Configure html2canvas options for better quality and compatibility
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 1.5, // Reduced scale to avoid memory issues
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight,
        ignoreElements: (element) => {
          // Skip elements that might cause color parsing issues
          return element.classList.contains('animate-pulse') || 
                 element.classList.contains('animate-spin') ||
                 element.classList.contains('animate-ping');
        },
        onclone: (clonedDoc) => {
          // Remove problematic CSS that might cause "lab" color function errors
          const style = clonedDoc.createElement('style');
          style.textContent = `
            * {
              animation: none !important;
              transition: none !important;
            }
            .animate-pulse, .animate-spin, .animate-ping {
              animation: none !important;
            }
          `;
          clonedDoc.head.appendChild(style);
          
          // Ensure all images are loaded in the cloned document
          const images = clonedDoc.querySelectorAll('img');
          images.forEach(img => {
            if (!img.complete) {
              img.style.display = 'none';
            }
          });
        }
      });

      // Create download link
      const link = document.createElement('a');
      link.download = 'edge-vision-inference-sdk.png';
      link.href = canvas.toDataURL('image/png', 1.0);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToast({
        title: 'Screenshot Saved',
        description: 'Image saved as edge-vision-inference-sdk.png',
        type: 'success'
      });
      
    } catch (error) {
      console.error('Screenshot failed:', error);
      showToast({
        title: 'Screenshot Failed',
        description: error instanceof Error ? error.message : 'Could not capture screenshot. Please try again.',
        type: 'error'
      });
    } finally {
      setIsScreenshotting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 animate-fade-in">
      {/* Header */}
      <header className="border-b bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                  <Cpu className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Edge Vision Inference SDK
                </h1>
              </div>
              <Badge 
                variant={liveMode ? "default" : "secondary"} 
                className={`${liveMode ? "bg-green-500 hover:bg-green-600" : "bg-yellow-500 hover:bg-yellow-600"} transition-colors shadow-sm`}
              >
                <div className={`w-2 h-2 rounded-full mr-2 ${liveMode ? "bg-green-200" : "bg-yellow-200"} animate-pulse`}></div>
                {liveMode ? "Live Mode" : "Demo Mode"}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <Select value={selectedBackend} onValueChange={(value: BackendType) => setSelectedBackend(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(BACKEND_CONFIGS).map(([key, backend]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${backend.color}`} />
                        <span>{backend.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                onClick={handleInference} 
                disabled={isProcessing}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Run Inference
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleScreenshot}
                disabled={isScreenshotting}
              >
                {isScreenshotting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4 mr-2" />
                )}
                {isScreenshotting ? 'Capturing...' : 'Screenshot'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="media" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="media" className="flex items-center space-x-2">
              <Monitor className="h-4 w-4" />
              <span>Media</span>
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Results</span>
            </TabsTrigger>
            <TabsTrigger value="docs" className="flex items-center space-x-2">
              <Code className="h-4 w-4" />
              <span>Docs</span>
            </TabsTrigger>
            <TabsTrigger value="downloads" className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Downloads</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="media" className="space-y-6 animate-slide-up">
            <MediaViewer
              imageUrl={currentImage}
              results={results}
              showDetections={showDetections}
              showInstances={showInstances}
              showLabels={showLabels}
              isProcessing={isProcessing}
              progress={progress}
              onFileUpload={(file) => {
                // Validate file type
                const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml', 'video/mp4', 'video/webm', 'video/ogg'];
                if (!validTypes.includes(file.type)) {
                  showToast({
                    title: 'Invalid File Type',
                    description: 'Please upload an image or video file',
                    type: 'error'
                  });
                  return;
                }

                // Validate file size (max 50MB)
                const maxSize = 50 * 1024 * 1024; // 50MB
                if (file.size > maxSize) {
                  showToast({
                    title: 'File Too Large',
                    description: 'Please upload a file smaller than 50MB',
                    type: 'error'
                  });
                  return;
                }

                // Create object URL for the uploaded file
                const fileUrl = URL.createObjectURL(file);
                setCurrentImage(fileUrl);

                showToast({
                  title: 'File Uploaded',
                  description: `${file.name} uploaded successfully`,
                  type: 'success'
                });
              }}
            />
            
            {/* Controls */}
            <OverlayControls
              showDetections={showDetections}
              showInstances={showInstances}
              showLabels={showLabels}
              onDetectionsChange={setShowDetections}
              onInstancesChange={setShowInstances}
              onLabelsChange={setShowLabels}
            />
          </TabsContent>

          <TabsContent value="results">
            <ResultsTab results={results} selectedBackend={selectedBackend} />
          </TabsContent>

          <TabsContent value="docs">
            <DocsTab />
          </TabsContent>

          <TabsContent value="downloads">
            <DownloadsTab />
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} />
    </div>
  );
}