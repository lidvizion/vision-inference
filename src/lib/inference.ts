import { InferenceResponse, BackendType } from '@/types';

export const simulateInference = async (
  backend: BackendType
): Promise<InferenceResponse> => {
  // Simulate network delay based on backend with more realistic timing
  const delays = {
    ONNX: 1200,
    TensorRT: 800,
    OpenVINO: 1000,
    Cloud: 2500
  };

  // Add some randomness to make it feel more realistic
  const randomDelay = Math.random() * 200;
  await new Promise(resolve => setTimeout(resolve, delays[backend] + randomDelay));

  // Load mock response based on backend
  const responseFiles = {
    ONNX: '/mock/onnx-response.json',
    TensorRT: '/mock/tensorrt-response.json',
    OpenVINO: '/mock/openvino-response.json',
    Cloud: '/mock/cloud-response.json'
  };

  try {
    const response = await fetch(responseFiles[backend]);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Add some randomness to the results to make them feel more dynamic
    if (data.detections) {
      data.detections = data.detections.map((detection: { score: number; [key: string]: unknown }) => ({
        ...detection,
        score: Math.min(0.99, detection.score + (Math.random() - 0.5) * 0.1)
      }));
    }
    
    return data;
  } catch (error) {
    console.error('Failed to load mock response:', error);
    throw new Error('Failed to load inference results. Please try again.');
  }
};

export const isLiveMode = (): boolean => {
  return !!(
    process.env.NEXT_PUBLIC_LV_API_URL &&
    process.env.NEXT_PUBLIC_LV_API_KEY &&
    process.env.NEXT_PUBLIC_MODEL_SLUG &&
    process.env.NEXT_PUBLIC_REGION
  );
};
