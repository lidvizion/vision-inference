import { InferenceResponse, BackendType } from '@/types';
import { logError, logInfo, logPerformance } from './logger';
import { TracingUtils, MetricsUtils } from './tracing';

export const simulateInference = async (
  backend: BackendType
): Promise<InferenceResponse> => {
  const startTime = Date.now();
  
  return TracingUtils.traceInference(backend, 'simulate', async () => {
    try {
      logInfo('Starting inference simulation', {
        component: 'inference',
        operation: 'simulate',
        backend,
      });

      // Simulate network delay based on backend with more realistic timing
      const delays = {
        ONNX: 1200,
        TensorRT: 800,
        OpenVINO: 1000,
        Cloud: 2500
      };

      // Add some randomness to make it feel more realistic
      const randomDelay = Math.random() * 200;
      const totalDelay = delays[backend] + randomDelay;
      
      logInfo('Simulating network delay', {
        component: 'inference',
        operation: 'delay',
        backend,
        delay: totalDelay,
      });
      
      await new Promise(resolve => setTimeout(resolve, totalDelay));

    // Load mock response based on backend
    const responseFiles = {
      ONNX: '/mock/onnx-response.json',
      TensorRT: '/mock/tensorrt-response.json',
      OpenVINO: '/mock/openvino-response.json',
      Cloud: '/mock/cloud-response.json'
    };

      logInfo('Loading mock response', {
        component: 'inference',
        operation: 'fetch',
        backend,
        responseFile: responseFiles[backend],
      });

      const response = await fetch(responseFiles[backend]);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      logInfo('Mock response loaded successfully', {
        component: 'inference',
        operation: 'fetch',
        backend,
        responseSize: JSON.stringify(data).length,
      });
    
    // Validate response structure
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format');
    }
    
    // Ensure required fields exist with defaults
    const validatedData: InferenceResponse = {
      detections: Array.isArray(data.detections) ? data.detections : [],
      instances: Array.isArray(data.instances) ? data.instances : [],
      labels: Array.isArray(data.labels) ? data.labels : [],
      metadata: {
        inference_time: data.metadata?.inference_time || delays[backend],
        backend: data.metadata?.backend || backend,
        model_version: data.metadata?.model_version || 'v2.1.0',
        timestamp: data.metadata?.timestamp || new Date().toISOString()
      }
    };
    
      // Add some randomness to the results to make them feel more dynamic
      if (validatedData.detections) {
        validatedData.detections = validatedData.detections.map((detection) => ({
          ...detection,
          score: Math.min(0.99, Math.max(0.01, detection.score + (Math.random() - 0.5) * 0.1))
        }));
      }
      
      const duration = Date.now() - startTime;
      
      logInfo('Inference simulation completed successfully', {
        component: 'inference',
        operation: 'simulate',
        backend,
        duration,
        detections: validatedData.detections.length,
        instances: validatedData.instances.length,
        labels: validatedData.labels.length,
      });
      
      logPerformance('inference_simulation', duration, {
        component: 'inference',
        backend,
      });
      
      // Record metrics
      MetricsUtils.recordInference(backend, duration, true);
      
      return validatedData;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      logError('Inference simulation failed', {
        component: 'inference',
        operation: 'simulate',
        backend,
        duration,
      }, error as Error);
      
      // Record error metrics
      MetricsUtils.recordInference(backend, duration, false);
      
      // Provide more specific error messages
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to load inference data. Please check your connection.');
      }
      
      if (error instanceof SyntaxError) {
        throw new Error('Data parsing error: Invalid response format received.');
      }
      
      // Generic fallback error
      throw new Error('Inference failed: Could not process the request. Please try again.');
    }
  });
};

export const isLiveMode = (): boolean => {
  return !!(
    process.env.NEXT_PUBLIC_LV_API_URL &&
    process.env.NEXT_PUBLIC_LV_API_KEY &&
    process.env.NEXT_PUBLIC_MODEL_SLUG &&
    process.env.NEXT_PUBLIC_REGION
  );
};
