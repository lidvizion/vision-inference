# Edge Vision Inference SDK Demo

A professional demonstration of a C++ Edge Inference SDK concept, built with Next.js, Tailwind CSS, and shadcn/ui components.

## 🚀 Features

### Core Capabilities
- **Multi-backend Support**: ONNX, TensorRT, OpenVINO, and Cloud inference
- **Real-time Simulation**: Fake latency simulation with backend-specific performance metrics
- **Interactive UI**: Polished interface with overlay toggles and controls
- **Live/Demo Mode**: Switches between demo simulation and live API calls based on environment variables

### UI Components
- **Media Viewer**: Image display with detection boxes, instance masks, and classification labels
- **Results Tab**: Detailed inference results with JSON export
- **Documentation Tab**: CMake configuration, C++ examples, and JNI bindings
- **Downloads Tab**: Platform-specific SDK packages and build tools

### Backend Simulation
- **ONNX**: ~18ms inference time (cross-platform)
- **TensorRT**: ~12ms inference time (NVIDIA optimized)
- **OpenVINO**: ~16ms inference time (Intel optimized)
- **Cloud**: ~220ms inference time (remote processing)

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Lucide React icons
- **Styling**: Custom animations, gradients, and responsive design
- **Screenshot**: html2canvas for hero image generation

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main application component
│   └── globals.css           # Global styles and animations
├── components/
│   ├── MediaViewer.tsx       # Image viewer with overlays
│   ├── ResultsTab.tsx        # Inference results display
│   ├── DocsTab.tsx           # Documentation and examples
│   └── DownloadsTab.tsx      # SDK downloads and resources
├── lib/
│   └── inference.ts          # Inference simulation logic
└── types/
    └── index.ts              # TypeScript type definitions

public/
├── sample/
│   └── road.jpg              # Sample road scene image
├── mock/
│   ├── onnx-response.json    # ONNX backend mock data
│   ├── tensorrt-response.json # TensorRT backend mock data
│   ├── openvino-response.json # OpenVINO backend mock data
│   └── cloud-response.json   # Cloud backend mock data
└── og/
    └── edge-vision-inference-sdk.png # Hero image
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd edge-vision-inference-sdk
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Environment Variables

To enable Live Mode (real API calls), set these environment variables:

```bash
NEXT_PUBLIC_LV_API_URL=https://your-api-endpoint.com
NEXT_PUBLIC_LV_API_KEY=your-api-key
NEXT_PUBLIC_MODEL_SLUG=your-model-slug
NEXT_PUBLIC_REGION=your-region
```

Without these variables, the app runs in Demo Mode with simulated inference.

## 🎯 Usage

### Running Inference
1. Select a backend from the dropdown (ONNX, TensorRT, OpenVINO, Cloud)
2. Click "Run Inference" to start processing
3. Watch the progress bar and latency simulation
4. View results in the Media tab with overlays

### Toggle Overlays
- **Detections**: Bounding boxes with class labels and confidence scores
- **Instances**: Segmentation masks with instance information
- **Labels**: Scene classification labels

### Export Results
- **Screenshot**: Capture the current view as PNG
- **JSON Export**: Download raw inference results
- **Copy to Clipboard**: Copy JSON data for external use

## 📊 Mock Data

The demo includes realistic mock data for different backends:

- **Detection Results**: Cars, people, trucks, bicycles with bounding boxes
- **Instance Masks**: Road markings, sidewalks with segmentation data
- **Classification Labels**: Urban scene, traffic, daylight conditions
- **Metadata**: Inference time, backend info, timestamps

## 🎨 Design Features

- **Professional UI**: Clean, modern interface with subtle animations
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Dark Mode Support**: Automatic theme switching
- **Gradient Accents**: Blue-to-purple gradients for visual appeal
- **Smooth Animations**: Fade-in, slide-up, and hover effects

## 🔮 Future Enhancements

- Real video stream support
- Model comparison tools
- Performance benchmarking
- Custom model upload
- Batch processing interface
- Real-time camera feed

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For support, email support@example.com or join our Discord community.