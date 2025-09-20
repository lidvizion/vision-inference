export interface Detection {
  class: string;
  score: number;
  box: [number, number, number, number]; // [x1, y1, x2, y2]
}

export interface Instance {
  class: string;
  score: number;
  mask: string; // base64 encoded mask
}

export interface Label {
  class: string;
  score: number;
}

export interface InferenceResponse {
  detections: Detection[];
  instances: Instance[];
  labels: Label[];
  metadata: {
    inference_time: number;
    backend: string;
    model_version: string;
    timestamp: string;
  };
}

export type BackendType = 'ONNX' | 'TensorRT' | 'OpenVINO' | 'Cloud';

export interface BackendConfig {
  name: string;
  latency: string;
  description: string;
  color: string;
}

export const BACKEND_CONFIGS: Record<BackendType, BackendConfig> = {
  ONNX: {
    name: 'ONNX Runtime',
    latency: '~18ms Jetson',
    description: 'Optimized for various hardware, good balance of speed and compatibility.',
    color: 'bg-green-500'
  },
  TensorRT: {
    name: 'NVIDIA TensorRT',
    latency: '~12ms Jetson',
    description: 'NVIDIA specific, highest performance on Jetson/GPU platforms.',
    color: 'bg-red-500'
  },
  OpenVINO: {
    name: 'Intel OpenVINO',
    latency: '~55ms Android NDK',
    description: 'Intel specific, optimized for Intel CPUs, VPUs, and iGPUs.',
    color: 'bg-blue-500'
  },
  Cloud: {
    name: 'Cloud API',
    latency: '~220ms Cloud',
    description: 'Fallback to cloud-based inference for complex models or remote processing.',
    color: 'bg-purple-500'
  }
};
