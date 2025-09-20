'use client';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Settings } from 'lucide-react';

interface OverlayControlsProps {
  showDetections: boolean;
  showInstances: boolean;
  showLabels: boolean;
  onDetectionsChange: (checked: boolean) => void;
  onInstancesChange: (checked: boolean) => void;
  onLabelsChange: (checked: boolean) => void;
}

export default function OverlayControls({
  showDetections,
  showInstances,
  showLabels,
  onDetectionsChange,
  onInstancesChange,
  onLabelsChange
}: OverlayControlsProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
            <Settings className="h-4 w-4 text-white" />
          </div>
          <span>Display Controls</span>
        </CardTitle>
        <CardDescription>
          Toggle overlay elements and select media for inference
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Switch
              id="detections"
              checked={showDetections}
              onCheckedChange={onDetectionsChange}
              aria-label="Toggle detection boxes overlay"
              aria-describedby="detections-description"
            />
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500" aria-hidden="true"></div>
              <Label 
                htmlFor="detections" 
                className="font-medium"
                id="detections-description"
              >
                Show Detections
              </Label>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Switch
              id="instances"
              checked={showInstances}
              onCheckedChange={onInstancesChange}
              aria-label="Toggle instance segmentation masks overlay"
              aria-describedby="instances-description"
            />
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500" aria-hidden="true"></div>
              <Label 
                htmlFor="instances" 
                className="font-medium"
                id="instances-description"
              >
                Show Instances
              </Label>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Switch
              id="labels"
              checked={showLabels}
              onCheckedChange={onLabelsChange}
              aria-label="Toggle classification labels overlay"
              aria-describedby="labels-description"
            />
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" aria-hidden="true"></div>
              <Label 
                htmlFor="labels" 
                className="font-medium"
                id="labels-description"
              >
                Show Labels
              </Label>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground">Upload Media</h4>
          <div className="space-y-3">
            <div 
              className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center hover:border-blue-400 transition-colors"
              role="button"
              tabIndex={0}
              aria-label="Upload media file by clicking or dragging and dropping"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  const input = document.getElementById('file-upload') as HTMLInputElement;
                  input?.click();
                }
              }}
            >
              <input
                type="file"
                id="file-upload"
                accept="image/*,video/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // This will be handled by the parent component
                    const event = new CustomEvent('fileUpload', { detail: file });
                    window.dispatchEvent(event);
                  }
                  e.target.value = ''; // Clear the input
                }}
                className="hidden"
                aria-label="Select media file to upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <div className="p-4 rounded-full bg-slate-200 dark:bg-slate-700" aria-hidden="true">
                  <svg className="h-8 w-8 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground">Images and videos supported</p>
                </div>
              </label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
