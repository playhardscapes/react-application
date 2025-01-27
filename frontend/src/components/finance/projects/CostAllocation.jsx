// src/components/finance/projects/CostAllocation.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Save, Plus, Minus } from 'lucide-react';

const CostAllocation = () => {
  const [transactions, setTransactions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [allocations, setAllocations] = useState([
    { projectId: '', percentage: '', amount: '' }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [transactionsRes, projectsRes] = await Promise.all([
          fetch('/api/finance/unallocated-transactions'),
          fetch('/api/projects/active')
        ]);

        const [transactionsData, projectsData] = await Promise.all([
          transactionsRes.json(),
          projectsRes.json()
        ]);

        setTransactions(transactionsData);
        setProjects(projectsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleTransactionSelect = (transaction) => {
    setSelectedTransaction(transaction);
    setAllocations([{ projectId: '', percentage: '100', amount: transaction.amount }]);
  };

  const addAllocation = () => {
    setAllocations([...allocations, { projectId: '', percentage: '', amount: '' }]);
  };

  const removeAllocation = (index) => {
    const newAllocations = allocations.filter((_, i) => i !== index);
    setAllocations(newAllocations);
  };

  const updateAllocation = (index, field, value) => {
    const newAllocations = [...allocations];
    newAllocations[index] = { ...newAllocations[index], [field]: value };

    if (field === 'percentage') {
      const percentage = parseFloat(value) || 0;
      newAllocations[index].amount = (selectedTransaction.amount * (percentage / 100)).toFixed(2);
    } else if (field === 'amount') {
      const amount = parseFloat(value) || 0;
      newAllocations[index].percentage = ((amount / selectedTransaction.amount) * 100).toFixed(2);
    }

    setAllocations(newAllocations);
  };

  const saveAllocations = async () => {
    try {
      await fetch('/api/finance/allocations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: selectedTransaction.id,
          allocations
        })
      });
      
      // Remove allocated transaction and reset form
      setTransactions(transactions.filter(t => t.id !== selectedTransaction.id));
      setSelectedTransaction(null);
      setAllocations([{ projectId: '', percentage: '', amount: '' }]);
    } catch (error) {
      console.error('Error saving allocations:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Unallocated Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Unallocated Transactions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {transactions.map(transaction => (
            <div
              key={transaction.id}
              onClick={() => handleTransactionSelect(transaction)}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedTransaction?.id === transaction.id 
                  ? 'bg-blue-50 border-blue-200'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(transaction.date).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-lg font-bold">
                  ${transaction.amount.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Allocation Form */}
      {selectedTransaction && (
        <Card>
          <CardHeader>
            <CardTitle>Allocate Costs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Transaction</p>
                <p>{selectedTransaction.description}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Amount</p>
                <p className="text-lg font-bold">
                  ${selectedTransaction.amount.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Allocation Lines */}
            {allocations.map((allocation, index) => (
              <div key={index} className="grid grid-cols-4 gap-4 items-center">
                <Select
                  value={allocation.projectId}
                  onValueChange={(value) => updateAllocation(index, 'projectId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="relative">
                  <Input
                    type="number"
                    value={allocation.percentage}
                    onChange={(e) => updateAllocation(index, 'percentage', e.target.value)}
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    %
                  </span>
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    $
                  </span>
                  <Input
                    type="number"
                    value={allocation.amount}
                    onChange={(e) => updateAllocation(index, 'amount', e.target.value)}
                    className="pl-8"
                  />
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeAllocation(index)}
                  disabled={allocations.length === 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <div className="flex justify-between items-center">
              <Button
                type="button"
                variant="outline"
                onClick={addAllocation}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Allocation
              </Button>

              <Button
                onClick={saveAllocations}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Allocations
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CostAllocation;