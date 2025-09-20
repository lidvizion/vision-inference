'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  Package, 
  Monitor, 
  Smartphone, 
  Server,
  Globe,
  FileText,
  Archive
} from 'lucide-react';
import { useState } from 'react';

interface DownloadItem {
  id: string;
  name: string;
  platform: string;
  architecture: string;
  size: string;
  version: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
  downloadUrl: string;
}

export default function DownloadsTab() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const downloadItems: DownloadItem[] = [
    {
      id: 'windows-x64',
      name: 'Windows SDK',
      platform: 'Windows',
      architecture: 'x64',
      size: '45.2 MB',
      version: 'v2.1.0',
      description: 'Complete SDK for Windows x64 with ONNX Runtime and OpenCV',
      icon: <Monitor className="h-5 w-5" />,
      color: 'bg-blue-500',
      features: ['ONNX Runtime', 'OpenCV', 'TensorRT Support', 'Visual Studio 2019+'],
      downloadUrl: '#'
    },
    {
      id: 'linux-x64',
      name: 'Linux SDK',
      platform: 'Linux',
      architecture: 'x64',
      size: '42.8 MB',
      version: 'v2.1.0',
      description: 'Ubuntu/CentOS compatible SDK with all backends',
      icon: <Server className="h-5 w-5" />,
      color: 'bg-green-500',
      features: ['ONNX Runtime', 'OpenCV', 'TensorRT', 'OpenVINO', 'CUDA Support'],
      downloadUrl: '#'
    },
    {
      id: 'android-arm64',
      name: 'Android SDK',
      platform: 'Android',
      architecture: 'ARM64',
      size: '38.5 MB',
      version: 'v2.1.0',
      description: 'JNI-enabled SDK for Android ARM64 devices',
      icon: <Smartphone className="h-5 w-5" />,
      color: 'bg-purple-500',
      features: ['JNI Bindings', 'ONNX Runtime', 'OpenCV Mobile', 'NDK 21+'],
      downloadUrl: '#'
    },
    {
      id: 'jetson-xavier',
      name: 'Jetson SDK',
      platform: 'Jetson',
      architecture: 'Xavier/Orin',
      size: '52.1 MB',
      version: 'v2.1.0',
      description: 'Optimized for NVIDIA Jetson platforms with TensorRT',
      icon: <Package className="h-5 w-5" />,
      color: 'bg-orange-500',
      features: ['TensorRT Optimized', 'CUDA 11.4+', 'JetPack 5.0+', 'ONNX Runtime'],
      downloadUrl: '#'
    },
    {
      id: 'ios-arm64',
      name: 'iOS SDK',
      platform: 'iOS',
      architecture: 'ARM64',
      size: '35.7 MB',
      version: 'v2.1.0',
      description: 'Framework for iOS apps with CoreML integration',
      icon: <Smartphone className="h-5 w-5" />,
      color: 'bg-gray-500',
      features: ['CoreML Bridge', 'ONNX Runtime', 'iOS 14+', 'Xcode 12+'],
      downloadUrl: '#'
    },
    {
      id: 'webassembly',
      name: 'WebAssembly',
      platform: 'Browser',
      architecture: 'WASM',
      size: '28.3 MB',
      version: 'v2.1.0',
      description: 'WebAssembly build for browser-based inference',
      icon: <Globe className="h-5 w-5" />,
      color: 'bg-indigo-500',
      features: ['WebAssembly', 'ONNX Runtime WASM', 'WebGL Support', 'Modern Browsers'],
      downloadUrl: '#'
    }
  ];

  const handleDownload = async (item: DownloadItem) => {
    setDownloading(item.id);
    
    try {
      // Create a fake file content based on the item
      let content = '';
      const filename = item.name;
      let mimeType = 'application/octet-stream';
      
      if (item.name.includes('.zip')) {
        mimeType = 'application/zip';
        content = 'PK\x03\x04'; // ZIP file header
      } else if (item.name.includes('.tar.gz')) {
        mimeType = 'application/gzip';
        content = '\x1f\x8b'; // GZIP file header
      } else if (item.name.includes('.deb')) {
        mimeType = 'application/vnd.debian.binary-package';
        content = '!<arch>'; // DEB file header
      } else if (item.name.includes('.apk')) {
        mimeType = 'application/vnd.android.package-archive';
        content = 'PK\x03\x04'; // APK is a ZIP file
      } else if (item.name.includes('.dmg')) {
        mimeType = 'application/x-apple-diskimage';
        content = 'koly'; // DMG file header
      }
      
      // Create a blob with the fake content
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
      
      // Simulate download time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDownloading(null);
      
      // Show success message
      console.log(`Downloaded ${item.name} successfully`);
      
    } catch (error) {
      console.error('Download failed:', error);
      setDownloading(null);
    }
  };

  const handleResourceDownload = async (filename: string, type: string) => {
    try {
      let content = '';
      let mimeType = 'application/octet-stream';
      
      if (type === 'PDF') {
        mimeType = 'application/pdf';
        content = '%PDF-1.4'; // PDF header
      } else if (type === 'ZIP') {
        mimeType = 'application/zip';
        content = 'PK\x03\x04'; // ZIP file header
      } else if (type === 'Tool') {
        mimeType = 'application/octet-stream';
        content = '#!/bin/bash'; // Tool header
      }
      
      // Create a blob with the fake content
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
      
      console.log(`Downloaded ${filename} successfully`);
      
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Windows':
        return '🪟';
      case 'Linux':
        return '🐧';
      case 'Android':
        return '🤖';
      case 'Jetson':
        return '🚀';
      case 'iOS':
        return '🍎';
      case 'Browser':
        return '🌐';
      default:
        return '💻';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>SDK Downloads</span>
          </CardTitle>
          <CardDescription>
            Download pre-built SDK packages for your target platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">6</div>
              <div className="text-sm text-muted-foreground">Platforms</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">v2.1.0</div>
              <div className="text-sm text-muted-foreground">Latest Version</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">100%</div>
              <div className="text-sm text-muted-foreground">Open Source</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Download Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {downloadItems.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${item.color} text-white`}>
                    {item.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <CardDescription>
                      {item.platform} • {item.architecture}
                    </CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline">{item.version}</Badge>
                  <div className="text-sm text-muted-foreground mt-1">
                    {item.size}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Features:</h4>
                <div className="flex flex-wrap gap-1">
                  {item.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>{getPlatformIcon(item.platform)}</span>
                  <span>{item.platform}</span>
                </div>
                <Button
                  onClick={() => handleDownload(item)}
                  disabled={downloading === item.id}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {downloading === item.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      <span>Download</span>
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Additional Resources</span>
          </CardTitle>
          <CardDescription>
            Documentation, examples, and development tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold">Documentation</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">API Reference</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleResourceDownload('api-reference.pdf', 'PDF')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Archive className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Example Projects</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleResourceDownload('example-projects.zip', 'ZIP')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    ZIP
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold">Development Tools</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Model Converter</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleResourceDownload('model-converter.sh', 'Tool')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Tool
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Performance Profiler</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleResourceDownload('performance-profiler.sh', 'Tool')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Tool
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Build from Source */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Build from Source</span>
          </CardTitle>
          <CardDescription>
            Compile the SDK from source code for custom configurations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
{`# Clone repository
git clone https://github.com/your-org/edge-vision-inference-sdk.git
cd edge-vision-inference-sdk

# Install dependencies
./scripts/install-deps.sh

# Build with custom options
mkdir build && cd build
cmake .. -DENABLE_TENSORRT=ON -DENABLE_OPENVINO=ON -DCMAKE_BUILD_TYPE=Release
make -j$(nproc)

# Run tests
ctest --output-on-failure`}
            </pre>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline"
              onClick={() => handleResourceDownload('edge-vision-sdk-source.zip', 'ZIP')}
            >
              <Download className="h-4 w-4 mr-2" />
              Source Code
            </Button>
            <Button 
              variant="outline"
              onClick={() => handleResourceDownload('build-guide.pdf', 'PDF')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Build Guide
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
