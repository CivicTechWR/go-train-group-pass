'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { createWorker } from 'tesseract.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Upload, CheckCircle, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PassUploadModalProps {
  groupId: string;
  groupNumber: number;
  memberCount: number;
  costPerPerson: number;
  onClose: () => void;
  onSuccess: () => void;
}

interface OCRResult {
  ticketNumber: string;
  passengerCount: number;
  activatedAt: string;
  confidence: number;
}

export function PassUploadModal({
  groupId,
  groupNumber,
  memberCount,
  costPerPerson,
  onClose,
  onSuccess,
}: PassUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [manualEntry, setManualEntry] = useState({
    ticketNumber: '',
    passengerCount: memberCount,
    activatedAt: new Date().toISOString().slice(0, 16),
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const processImageWithOCR = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const worker = await createWorker('eng');

      // Configure OCR for better text recognition
      await worker.setParameters({
        tessedit_char_whitelist:
          '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz: -',
      });

      const {
        data: { text, confidence },
      } = await worker.recognize(file);
      await worker.terminate();

      // Parse the OCR text to extract relevant information
      const lines = text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      // Look for ticket number (alphanumeric pattern)
      const ticketNumberMatch = text.match(/[A-Z]{2}\d{8,10}/);
      const ticketNumber = ticketNumberMatch ? ticketNumberMatch[0] : '';

      // Look for passenger count (x4, x5, etc.)
      const passengerCountMatch = text.match(/x\s*(\d+)/i);
      const passengerCount = passengerCountMatch
        ? parseInt(passengerCountMatch[1])
        : memberCount;

      // Look for activation time (HH:MM AM/PM format)
      const timeMatch = text.match(/(\d{1,2}:\d{2}(?::\d{2})?\s*[AP]M)/i);
      const activatedAt = timeMatch
        ? timeMatch[0]
        : new Date().toISOString().slice(0, 16);

      const result: OCRResult = {
        ticketNumber,
        passengerCount,
        activatedAt,
        confidence: confidence / 100,
      };

      setOcrResult(result);

      // Update manual entry with OCR results
      setManualEntry({
        ticketNumber: result.ticketNumber,
        passengerCount: result.passengerCount,
        activatedAt: result.activatedAt,
      });

      toast.success('OCR processing completed!');
    } catch (error) {
      console.error('OCR processing error:', error);
      toast.error(
        'Failed to process image with OCR. Please enter details manually.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select an image first');
      return;
    }

    setIsUploading(true);
    try {
      // Convert file to base64
      const base64 = await new Promise<string>(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const response = await fetch('/api/steward/upload-pass', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId,
          ticketNumber: manualEntry.ticketNumber,
          passengerCount: manualEntry.passengerCount,
          activatedAt: manualEntry.activatedAt,
          screenshotFile: base64,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload pass');
      }

      toast.success('Pass uploaded successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to upload pass'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const hasPassengerCountMismatch =
    ocrResult && ocrResult.passengerCount !== memberCount;

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'>
      <Card className='w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
        <CardHeader className='pb-4'>
          <div className='flex items-center justify-between'>
            <CardTitle>Upload Group Pass - Group {groupNumber}</CardTitle>
            <Button variant='ghost' size='icon' onClick={onClose}>
              <X className='h-4 w-4' />
            </Button>
          </div>
        </CardHeader>

        <CardContent className='space-y-6'>
          {/* File Upload */}
          <div className='space-y-2'>
            <Label>Pass Screenshot</Label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }`}
            >
              <input {...getInputProps()} />
              {preview ? (
                <div className='space-y-2'>
                  <img
                    src={preview}
                    alt='Pass preview'
                    className='max-h-48 mx-auto rounded'
                  />
                  <p className='text-sm text-muted-foreground'>
                    {file?.name} ({(file?.size! / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>
              ) : (
                <div className='space-y-2'>
                  <Upload className='h-8 w-8 mx-auto text-muted-foreground' />
                  <p className='text-sm'>
                    {isDragActive
                      ? 'Drop the image here...'
                      : 'Drag & drop an image, or click to select'}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    PNG, JPG, JPEG, WEBP up to 5MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* OCR Processing */}
          {file && !ocrResult && (
            <div className='space-y-2'>
              <Button
                onClick={processImageWithOCR}
                disabled={isProcessing}
                className='w-full'
              >
                {isProcessing ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    Processing with OCR...
                  </>
                ) : (
                  <>
                    <Upload className='h-4 w-4 mr-2' />
                    Extract Details with OCR
                  </>
                )}
              </Button>
              <p className='text-xs text-muted-foreground text-center'>
                OCR will automatically extract ticket number, passenger count,
                and activation time
              </p>
            </div>
          )}

          {/* OCR Results */}
          {ocrResult && (
            <Card className='bg-blue-50 border-blue-200'>
              <CardContent className='p-4'>
                <div className='flex items-center gap-2 mb-3'>
                  <CheckCircle className='h-4 w-4 text-blue-600' />
                  <span className='text-sm font-medium text-blue-800'>
                    OCR Results
                  </span>
                  <Badge variant='outline' className='text-xs'>
                    {Math.round(ocrResult.confidence * 100)}% confidence
                  </Badge>
                </div>

                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span>Ticket Number:</span>
                    <span className='font-mono'>
                      {ocrResult.ticketNumber || 'Not detected'}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Passenger Count:</span>
                    <span className='font-mono'>
                      {ocrResult.passengerCount}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Activation Time:</span>
                    <span className='font-mono'>{ocrResult.activatedAt}</span>
                  </div>
                </div>

                {hasPassengerCountMismatch && (
                  <div className='mt-3 p-2 bg-orange-100 border border-orange-300 rounded text-sm text-orange-800'>
                    <div className='flex items-center gap-1'>
                      <AlertCircle className='h-4 w-4' />
                      <span className='font-medium'>Pass Mismatch Warning</span>
                    </div>
                    <p className='mt-1'>
                      OCR detected {ocrResult.passengerCount} passengers, but
                      your group has {memberCount} members. Please verify you
                      bought the correct pass.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Manual Entry Form */}
          <div className='space-y-4'>
            <h3 className='text-sm font-medium'>Pass Details</h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='ticketNumber'>Ticket Number</Label>
                <Input
                  id='ticketNumber'
                  value={manualEntry.ticketNumber}
                  onChange={e =>
                    setManualEntry(prev => ({
                      ...prev,
                      ticketNumber: e.target.value,
                    }))
                  }
                  placeholder='e.g., AB12345678'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='passengerCount'>Passenger Count</Label>
                <Input
                  id='passengerCount'
                  type='number'
                  min='1'
                  max='5'
                  value={manualEntry.passengerCount}
                  onChange={e =>
                    setManualEntry(prev => ({
                      ...prev,
                      passengerCount: parseInt(e.target.value) || 1,
                    }))
                  }
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='activatedAt'>Activation Time</Label>
              <Input
                id='activatedAt'
                type='datetime-local'
                value={manualEntry.activatedAt}
                onChange={e =>
                  setManualEntry(prev => ({
                    ...prev,
                    activatedAt: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          {/* Group Info */}
          <Card className='bg-muted/50'>
            <CardContent className='p-4'>
              <h4 className='text-sm font-medium mb-2'>Group Information</h4>
              <div className='grid grid-cols-2 gap-4 text-sm'>
                <div>
                  <span className='text-muted-foreground'>Members:</span>
                  <span className='ml-2 font-medium'>{memberCount}</span>
                </div>
                <div>
                  <span className='text-muted-foreground'>
                    Cost per person:
                  </span>
                  <span className='ml-2 font-medium'>
                    ${costPerPerson.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className='text-muted-foreground'>Total cost:</span>
                  <span className='ml-2 font-medium'>
                    ${(costPerPerson * memberCount).toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className='text-muted-foreground'>Expected pass:</span>
                  <span className='ml-2 font-medium'>x{memberCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className='flex gap-2 pt-4'>
            <Button variant='outline' onClick={onClose} className='flex-1'>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || isUploading || !manualEntry.ticketNumber}
              className='flex-1'
            >
              {isUploading ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  Uploading...
                </>
              ) : (
                'Upload Pass'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
