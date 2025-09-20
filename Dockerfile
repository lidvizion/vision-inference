# Multi-stage Dockerfile for Edge Vision Inference SDK
# Supports amd64, arm64 (Jetson), and other architectures

# Stage 1: Base image with common dependencies
FROM --platform=$BUILDPLATFORM ubuntu:22.04 as base

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=UTC

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git \
    wget \
    curl \
    pkg-config \
    libopencv-dev \
    libeigen3-dev \
    && rm -rf /var/lib/apt/lists/*

# Stage 2: ONNX Runtime build
FROM base as onnx-builder

# Install ONNX Runtime dependencies
RUN apt-get update && apt-get install -y \
    python3-dev \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Download and build ONNX Runtime
ARG ONNX_VERSION=1.16.3
RUN wget https://github.com/microsoft/onnxruntime/releases/download/v${ONNX_VERSION}/onnxruntime-linux-x64-${ONNX_VERSION}.tgz \
    && tar -xzf onnxruntime-linux-x64-${ONNX_VERSION}.tgz \
    && mv onnxruntime-linux-x64-${ONNX_VERSION} /opt/onnxruntime

# Stage 3: TensorRT build (NVIDIA Jetson specific)
FROM base as tensorrt-builder

# Install CUDA and TensorRT dependencies
RUN apt-get update && apt-get install -y \
    cuda-toolkit-11-4 \
    libnvinfer8 \
    libnvinfer-plugin8 \
    libnvparsers8 \
    libnvonnxparsers8 \
    libnvinfer-dev \
    libnvinfer-plugin-dev \
    libnvparsers-dev \
    libnvonnxparsers-dev \
    && rm -rf /var/lib/apt/lists/*

# Set CUDA environment
ENV CUDA_HOME=/usr/local/cuda
ENV PATH=${CUDA_HOME}/bin:${PATH}
ENV LD_LIBRARY_PATH=${CUDA_HOME}/lib64:${LD_LIBRARY_PATH}

# Stage 4: OpenVINO build (Intel specific)
FROM base as openvino-builder

# Install OpenVINO dependencies
RUN apt-get update && apt-get install -y \
    libgomp1 \
    libusb-1.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Download and install OpenVINO
ARG OPENVINO_VERSION=2023.3.0
RUN wget https://apt.repos.intel.com/intel-gpg-keys/GPG-PUB-KEY-INTEL-SW-PRODUCTS.PUB \
    && apt-key add GPG-PUB-KEY-INTEL-SW-PRODUCTS.PUB \
    && echo "deb https://apt.repos.intel.com/openvino/2023 focal main" > /etc/apt/sources.list.d/intel-openvino-2023.list \
    && apt-get update \
    && apt-get install -y intel-openvino-runtime-ubuntu22-${OPENVINO_VERSION} \
    && rm -rf /var/lib/apt/lists/*

# Stage 5: Final runtime image
FROM base as runtime

# Copy built libraries from previous stages
COPY --from=onnx-builder /opt/onnxruntime /opt/onnxruntime
COPY --from=tensorrt-builder /usr/local/cuda /usr/local/cuda
COPY --from=openvino-builder /opt/intel /opt/intel

# Set environment variables
ENV ONNXRUNTIME_HOME=/opt/onnxruntime
ENV LD_LIBRARY_PATH=/opt/onnxruntime/lib:/usr/local/cuda/lib64:/opt/intel/openvino_2023/runtime/lib/intel64:${LD_LIBRARY_PATH}

# Create application directory
WORKDIR /app

# Copy application files
COPY . .

# Build the application
RUN mkdir build && cd build \
    && cmake .. \
        -DCMAKE_BUILD_TYPE=Release \
        -DENABLE_ONNX=ON \
        -DENABLE_TENSORRT=ON \
        -DENABLE_OPENVINO=ON \
    && make -j$(nproc)

# Create non-root user for security
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Default command
CMD ["./build/edge-vision-inference-sdk"]

# Resource requirements and cost notes:
# 
# Jetson GPU Layers (TensorRT):
# - Memory: ~2-4GB GPU memory for inference
# - Cost: Higher power consumption, requires active cooling
# - Performance: 10-50x faster than CPU for compatible models
# - Use case: Real-time inference, high throughput scenarios
#
# Multi-arch Build Considerations:
# - amd64: Standard x86_64 architecture, most common
# - arm64: ARM64 architecture (Jetson, Apple Silicon, ARM servers)
# - armv7: Older ARM devices (Raspberry Pi 3 and earlier)
#
# Build Command Examples:
# docker buildx build --platform linux/amd64,linux/arm64 -t edge-vision-sdk:latest .
# docker buildx build --platform linux/arm64 -t edge-vision-sdk:jetson --target tensorrt-builder .
# docker buildx build --platform linux/amd64 -t edge-vision-sdk:intel --target openvino-builder .
