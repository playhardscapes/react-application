import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Loader2, CheckCircle2, AlertCircle, Receipt } from 'lucide-react';

const BillAnalysis = ({ 
  extractedText, 
  onConfirm, 
  onModify 
}) => {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const BillAnalysis = ({ extractedText, onConfirm, onModify }) => {
    const { token } = useAuth();
    const [analysis, setAnalysis] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState(null);
  
    const analyzeBill = async () => {
      setIsAnalyzing(true);
      setError(null);
  
      try {
        const response = await fetch('/api/ai/analyze-document', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ extractedText })
        });

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Bill Analysis
        </CardTitle>
      </CardHeader>

      <CardContent>
        {!analysis && !isAnalyzing && (
          <Button onClick={analyzeBill}>
            Analyze Bill
          </Button>
        )}

        {isAnalyzing && (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Analyzing bill content...</span>
          </div>
        )}

        {analysis && (
          <div className="space-y-6">
            {/* Vendor Information */}
            <div>
              <h3 className="text-sm font-medium mb-2">Vendor Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Vendor Name</Label>
                  <Input 
                    value={analysis.vendor.name} 
                    onChange={(e) => setAnalysis(prev => ({
                      ...prev,
                      vendor: { ...prev.vendor, name: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label>Match Confidence</Label>
                  <div className="mt-2">
                    {(analysis.vendor.matchConfidence * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Bill Details */}
            <div>
              <h3 className="text-sm font-medium mb-2">Bill Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Invoice Number</Label>
                  <Input 
                    value={analysis.billDetails.invoiceNumber} 
                    onChange={(e) => setAnalysis(prev => ({
                      ...prev,
                      billDetails: { ...prev.billDetails, invoiceNumber: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label>Date</Label>
                  <Input 
                    type="date"
                    value={analysis.billDetails.date}
                    onChange={(e) => setAnalysis(prev => ({
                      ...prev,
                      billDetails: { ...prev.billDetails, date: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Input 
                    type="date"
                    value={analysis.billDetails.dueDate}
                    onChange={(e) => setAnalysis(prev => ({
                      ...prev,
                      billDetails: { ...prev.billDetails, dueDate: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label>Total Amount</Label>
                  <Input 
                    type="number"
                    value={analysis.billDetails.totalAmount}
                    onChange={(e) => setAnalysis(prev => ({
                      ...prev,
                      billDetails: { ...prev.billDetails, totalAmount: parseFloat(e.target.value) }
                    }))}
                  />
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div>
              <h3 className="text-sm font-medium mb-2">Line Items</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-24">Quantity</TableHead>
                    <TableHead className="w-32">Unit Price</TableHead>
                    <TableHead className="w-32">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analysis.lineItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input 
                          value={item.description}
                          onChange={(e) => {
                            const newItems = [...analysis.lineItems];
                            newItems[index].description = e.target.value;
                            setAnalysis(prev => ({
                              ...prev,
                              lineItems: newItems
                            }));
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const newItems = [...analysis.lineItems];
                            newItems[index].quantity = parseInt(e.target.value);
                            newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
                            setAnalysis(prev => ({
                              ...prev,
                              lineItems: newItems
                            }));
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => {
                            const newItems = [...analysis.lineItems];
                            newItems[index].unitPrice = parseFloat(e.target.value);
                            newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
                            setAnalysis(prev => ({
                              ...prev,
                              lineItems: newItems
                            }));
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        ${item.total.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>

      {analysis && (
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onModify(analysis)}>
            Modify
          </Button>
          <Button onClick={() => onConfirm(analysis)}>
            Create Vendor Bill
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default BillAnalysis;