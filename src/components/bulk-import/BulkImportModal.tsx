'use client';

/**
 * Bulk Import Modal Component
 * Modal for uploading CSV/Excel files for bulk import
 */

import { useState, useRef, ChangeEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Download,
} from 'lucide-react';
import {
  uploadBulkImport,
  validateFile,
  getModuleDisplayName,
  getAcceptedFileTypes,
  type ModuleName,
  type BulkImportResponse,
} from '@/lib/client/bulkImportClient';
import { downloadCSVTemplate } from '@/lib/utils/csvTemplate';

type BulkImportModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultModule?: ModuleName;
  onSuccess?: (result: BulkImportResponse) => void;
};

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

export function BulkImportModal({
  open,
  onOpenChange,
  defaultModule = 'dorks',
  onSuccess,
}: BulkImportModalProps) {
  const [moduleName, setModuleName] = useState<ModuleName>(defaultModule);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [result, setResult] = useState<BulkImportResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset state when closing
      setTimeout(() => {
        setModuleName(defaultModule);
        setSelectedFile(null);
        setUploadState('idle');
        setErrorMessage('');
        setResult(null);
      }, 200);
    }
    onOpenChange(newOpen);
  };

  // Handle file selection
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid file');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setErrorMessage('');
    setUploadState('idle');
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select a file');
      return;
    }

    setUploadState('uploading');
    setErrorMessage('');

    try {
      const response = await uploadBulkImport(moduleName, selectedFile);
      setResult(response);
      setUploadState('success');
      
      // Call success callback
      if (onSuccess) {
        onSuccess(response);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      setErrorMessage(message);
      setUploadState('error');
    }
  };

  // Trigger file input click
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  // Handle template download
  const handleDownloadTemplate = () => {
    downloadCSVTemplate(moduleName);
  };

  // Handle drag and drop
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid file');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setErrorMessage('');
    setUploadState('idle');
  };

  // Render upload area
  const renderUploadArea = () => {
    if (uploadState === 'success' && result) {
      return (
        <div className="space-y-4">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <div className="font-medium">Import completed successfully!</div>
              <div className="mt-2 text-sm">
                <div>Total processed: {result.result.totalProcessed}</div>
                <div>Successfully inserted: {result.result.successCount}</div>
                {result.result.failureCount > 0 && (
                  <div className="text-orange-600">
                    Failed: {result.result.failureCount}
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>

          {result.result.failed.length > 0 && (
            <div className="max-h-40 overflow-y-auto rounded-md border border-orange-200 bg-orange-50 p-3">
              <div className="text-sm font-medium text-orange-800 mb-2">
                Failed Rows:
              </div>
              <div className="space-y-1 text-xs text-orange-700">
                {result.result.failed.map((fail, idx) => (
                  <div key={idx}>
                    Row {fail.rowNumber}: {fail.error}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={getAcceptedFileTypes()}
          onChange={handleFileChange}
          className="hidden"
        />

        {selectedFile ? (
          <div className="space-y-2">
            <FileSpreadsheet className="h-12 w-12 mx-auto text-green-600" />
            <div className="text-sm font-medium text-gray-900">
              {selectedFile.name}
            </div>
            <div className="text-xs text-gray-500">
              {(selectedFile.size / 1024).toFixed(2)} KB
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile(null);
              }}
            >
              Remove
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="h-12 w-12 mx-auto text-gray-400" />
            <div className="text-sm font-medium text-gray-900">
              Click to browse or drag and drop
            </div>
            <div className="text-xs text-gray-500">
              CSV or Excel files (max 10MB)
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Bulk Import</DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file to import multiple records at once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Module Selection */}
          <div className="space-y-2">
            <Label htmlFor="module">Select Module</Label>
            <Select
              value={moduleName}
              onValueChange={(value) => setModuleName(value as ModuleName)}
              disabled={uploadState === 'uploading' || uploadState === 'success'}
            >
              <SelectTrigger id="module">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dorks">Dorks</SelectItem>
                <SelectItem value="categories">Categories</SelectItem>
                <SelectItem value="locations">Locations</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Choose which module to import data into
            </p>
          </div>

          {/* File Upload Area */}
          <div className="space-y-2">
            <Label>Upload File</Label>
            {renderUploadArea()}
          </div>

          {/* Upload Progress */}
          {uploadState === 'uploading' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Uploading...</span>
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              </div>
              <Progress value={undefined} className="h-2" />
            </div>
          )}

          {/* Error Message */}
          {errorMessage && uploadState === 'error' && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Validation Error */}
          {errorMessage && uploadState === 'idle' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Help Text */}
          {uploadState === 'idle' && !errorMessage && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="text-sm">
                  <div className="font-medium mb-1">Required format for {getModuleDisplayName(moduleName)}:</div>
                  {moduleName === 'dorks' && (
                    <div className="text-xs text-gray-600">
                      Header: <code className="bg-gray-100 px-1 rounded">query</code>
                    </div>
                  )}
                  {moduleName === 'categories' && (
                    <div className="text-xs text-gray-600">
                      Header: <code className="bg-gray-100 px-1 rounded">name</code> (optional: slug)
                    </div>
                  )}
                  {moduleName === 'locations' && (
                    <div className="text-xs text-gray-600">
                      Header: <code className="bg-gray-100 px-1 rounded">name</code> (optional: slug)
                    </div>
                  )}
                  <button
                    onClick={handleDownloadTemplate}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 underline"
                  >
                    <Download className="h-3 w-3" />
                    Download {getModuleDisplayName(moduleName)} Template
                  </button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          {uploadState === 'success' ? (
            <Button onClick={() => handleOpenChange(false)}>
              Close
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={uploadState === 'uploading'}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploadState === 'uploading'}
              >
                {uploadState === 'uploading' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload & Import
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
