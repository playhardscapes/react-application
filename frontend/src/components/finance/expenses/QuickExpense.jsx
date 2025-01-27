import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Upload, FileText, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const QuickExpense = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const captureInputRef = useRef(null);
  const uploadInputRef = useRef(null);

  const handleQuickCapture = async (file) => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('receipt', file);

    try {
      const response = await fetch('/api/finance/expenses/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      navigate('/finance/expenses/process', { state: { receiptId: data.documentId } });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "There was a problem uploading your receipt. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Quick Expense Entry</CardTitle>
              <p className="text-sm text-muted-foreground">
                Capture or upload receipts for quick processing
              </p>
            </div>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <input
                  ref={captureInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => handleQuickCapture(e.target.files?.[0])}
                  className="hidden"
                  id="quick-capture"
                  disabled={loading}
                />
                <Button 
                  className="w-full flex gap-2 items-center justify-center" 
                  variant="secondary"
                  disabled={loading}
                  onClick={() => captureInputRef.current?.click()}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                  Capture Receipt
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <input
                  ref={uploadInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleQuickCapture(e.target.files?.[0])}
                  className="hidden"
                  id="quick-upload"
                  disabled={loading}
                />
                <Button 
                  className="w-full flex gap-2 items-center justify-center" 
                  variant="outline"
                  disabled={loading}
                  onClick={() => uploadInputRef.current?.click()}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  Upload File
                </Button>
              </CardContent>
            </Card>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            Supported formats: JPG, PNG, PDF (max 10MB)
          </p>
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default QuickExpense;