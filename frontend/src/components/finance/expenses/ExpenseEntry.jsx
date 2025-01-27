// src/components/finance/expenses/ExpenseEntry.jsx
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, Upload, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ExpenseEntry = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleCapture = async (file) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('receipt', file);

      const response = await fetch('/api/finance/expenses/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      navigate('/finance/expenses/process', { state: { receiptId: data.id } });
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Record Expense</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Camera Capture */}
        <div className="text-center p-8 border-2 border-dashed rounded-lg">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => handleCapture(e.target.files[0])}
            className="hidden"
            id="camera-capture"
          />
          <label htmlFor="camera-capture">
            <div className="flex flex-col items-center gap-2 cursor-pointer">
              <Camera className="h-8 w-8 text-gray-400" />
              <span className="text-sm text-gray-600">Snap Receipt</span>
            </div>
          </label>
        </div>

        {/* Upload Option */}
        <div>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => handleCapture(e.target.files[0])}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button variant="outline" className="w-full" asChild>
              <div>
                <Upload className="h-4 w-4 mr-2" />
                Upload Receipt
              </div>
            </Button>
          </label>
        </div>

        {/* Email Entry */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Forward receipt to..."
              value="receipts@company.com"
              readOnly
            />
            <Button variant="outline" onClick={() => navigator.clipboard.writeText('receipts@company.com')}>
              Copy
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Forward digital receipts to this address for automatic processing
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenseEntry;