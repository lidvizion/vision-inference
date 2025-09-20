'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Code, 
  Terminal, 
  Settings, 
  BookOpen,
  Copy,
  CheckCircle
} from 'lucide-react';
import { useState } from 'react';

export default function DocsTab() {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const cmakeExample = `# CMakeLists.txt for Edge Vision Inference SDK
cmake_minimum_required(VERSION 3.16)
project(edge-vision-inference)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find required packages
find_package(OpenCV REQUIRED)
find_package(ONNXRuntime REQUIRED)

# Add SDK source
add_subdirectory(edge-vision-sdk)

# Create your application
add_executable(my_app main.cpp)
target_link_libraries(my_app 
    edge-vision-sdk
    \${OpenCV_LIBS}
    onnxruntime
)

# Optional: Enable TensorRT
option(ENABLE_TENSORRT "Enable TensorRT backend" OFF)
if(ENABLE_TENSORRT)
    find_package(TensorRT REQUIRED)
    target_link_libraries(my_app TensorRT::nvinfer)
endif()

# Optional: Enable OpenVINO
option(ENABLE_OPENVINO "Enable OpenVINO backend" OFF)
if(ENABLE_OPENVINO)
    find_package(OpenVINO REQUIRED)
    target_link_libraries(my_app openvino::runtime)
endif()`;

  const jniExample = `// JNI bindings for Android integration
#include <jni.h>
#include "edge_vision_sdk.h"

extern "C" JNIEXPORT jlong JNICALL
Java_com_yourpackage_EdgeVisionSDK_nativeCreate(
    JNIEnv *env, jobject thiz, jstring modelPath) {
    
    const char *model_path = env->GetStringUTFChars(modelPath, 0);
    
    // Create SDK instance
    auto* sdk = new EdgeVisionSDK();
    sdk->loadModel(model_path);
    
    env->ReleaseStringUTFChars(modelPath, model_path);
    return reinterpret_cast<jlong>(sdk);
}

extern "C" JNIEXPORT jobjectArray JNICALL
Java_com_yourpackage_EdgeVisionSDK_nativeInference(
    JNIEnv *env, jobject thiz, jlong sdkPtr, jbyteArray imageData) {
    
    auto* sdk = reinterpret_cast<EdgeVisionSDK*>(sdkPtr);
    
    // Convert Java byte array to C++ vector
    jbyte* data = env->GetByteArrayElements(imageData, nullptr);
    jsize len = env->GetArrayLength(imageData);
    
    std::vector<uint8_t> image(data, data + len);
    
    // Run inference
    auto results = sdk->inference(image);
    
    // Convert results back to Java objects
    // ... (implementation details)
    
    env->ReleaseByteArrayElements(imageData, data, JNI_ABORT);
    return javaResults;
}`;

  const cppExample = `// C++ usage example
#include "edge_vision_sdk.h"
#include <opencv2/opencv.hpp>

int main() {
    // Initialize SDK
    EdgeVisionSDK sdk;
    sdk.loadModel("yolov8.onnx");
    
    // Load image
    cv::Mat image = cv::imread("input.jpg");
    
    // Run inference
    auto results = sdk.inference(image);
    
    // Process results
    for (const auto& detection : results.detections) {
        std::cout << "Class: " << detection.class_name 
                  << ", Score: " << detection.confidence 
                  << ", Box: [" << detection.bbox.x << ", " 
                  << detection.bbox.y << ", " 
                  << detection.bbox.width << ", " 
                  << detection.bbox.height << "]" << std::endl;
    }
    
    // Draw results on image
    sdk.drawResults(image, results);
    cv::imwrite("output.jpg", image);
    
    return 0;
}`;

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Edge Vision Inference SDK</span>
          </CardTitle>
          <CardDescription>
            Vendor-agnostic C++ SDK for on-device inference across embedded platforms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Key Features</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Multi-backend support (ONNX, TensorRT, OpenVINO)</li>
                <li>• Unified I/O schema for all tasks</li>
                <li>• JNI bindings for Android integration</li>
                <li>• USB/RTSP video capture support</li>
                <li>• Performance counters and profiling</li>
                <li>• Multi-arch Docker builds</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Supported Platforms</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Android NDK (ARM64, ARM32)</li>
                <li>• NVIDIA Jetson (Xavier, Orin)</li>
                <li>• Windows (x64, ARM64)</li>
                <li>• iOS (ARM64)</li>
                <li>• Linux (x64, ARM64)</li>
                <li>• WebAssembly (Browser)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CMake Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>CMake Configuration</span>
          </CardTitle>
          <CardDescription>
            Build configuration and dependency management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">CMakeLists.txt</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(cmakeExample, 'cmake')}
                className="flex items-center space-x-2"
              >
                {copied === 'cmake' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span>{copied === 'cmake' ? 'Copied!' : 'Copy'}</span>
              </Button>
            </div>
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 max-h-64 overflow-auto">
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                {cmakeExample}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* C++ Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Code className="h-5 w-5" />
            <span>C++ Usage Example</span>
          </CardTitle>
          <CardDescription>
            Basic inference workflow and API usage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">main.cpp</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(cppExample, 'cpp')}
                className="flex items-center space-x-2"
              >
                {copied === 'cpp' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span>{copied === 'cpp' ? 'Copied!' : 'Copy'}</span>
              </Button>
            </div>
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 max-h-64 overflow-auto">
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                {cppExample}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* JNI Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Terminal className="h-5 w-5" />
            <span>Android JNI Integration</span>
          </CardTitle>
          <CardDescription>
            Native Android integration with JNI bindings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">jni_bindings.cpp</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(jniExample, 'jni')}
                className="flex items-center space-x-2"
              >
                {copied === 'jni' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span>{copied === 'jni' ? 'Copied!' : 'Copy'}</span>
              </Button>
            </div>
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 max-h-64 overflow-auto">
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                {jniExample}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Build Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Terminal className="h-5 w-5" />
            <span>Build Notes</span>
          </CardTitle>
          <CardDescription>
            Platform-specific build instructions and requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Dependencies</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>OpenCV</span>
                  <Badge variant="outline">4.8+</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>ONNX Runtime</span>
                  <Badge variant="outline">1.16+</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>TensorRT (Optional)</span>
                  <Badge variant="outline">8.6+</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>OpenVINO (Optional)</span>
                  <Badge variant="outline">2023.3+</Badge>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Build Flags</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>ENABLE_TENSORRT</span>
                  <Badge variant="secondary">OFF</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>ENABLE_OPENVINO</span>
                  <Badge variant="secondary">OFF</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>ENABLE_GPU</span>
                  <Badge variant="secondary">ON</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>ENABLE_PROFILING</span>
                  <Badge variant="secondary">ON</Badge>
                </div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="font-semibold mb-3">Quick Start</h4>
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
{`# Clone the repository
git clone https://github.com/your-org/edge-vision-inference-sdk.git
cd edge-vision-inference-sdk

# Create build directory
mkdir build && cd build

# Configure with CMake
cmake .. -DENABLE_TENSORRT=ON -DENABLE_OPENVINO=ON

# Build
make -j\$(nproc)

# Run example
./examples/basic_inference`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
