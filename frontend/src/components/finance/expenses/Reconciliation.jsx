// src/components/finance/expenses/Reconciliation.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

const Reconciliation = () => {
  const [transactions, setTransactions] = useState([]);
  const [bankData, setBankData] = useState([]);

  useEffect(() => {
    // Fetch transactions and bank data
    const fetchData = async () => {
      try {
        const [transactionsRes, bankDataRes] = await Promise.all([
          fetch('/api/finance/transactions'),
          fetch('/api/finance/bank-transactions')
        ]);

        const [transactionsData, bankData] = await Promise.all([
          transactionsRes.json(),
          bankDataRes.json()
        ]);

        setTransactions(transactionsData);
        setBankData(bankData);
      } catch (error) {
        console.error('Error fetching reconciliation data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Reconciliation</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="amex">
          <TabsList>
            <TabsTrigger value="amex">American Express</TabsTrigger>
            <TabsTrigger value="bluevine">Bluevine</TabsTrigger>
          </TabsList>

          <TabsContent value="amex">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map(transaction => (
                  <TableRow key={transaction.id}>
                    <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        transaction.matched ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transaction.matched ? 'Matched' : 'Pending'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        Match
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="bluevine">
            {/* Similar table structure for Bluevine */}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default Reconciliation;