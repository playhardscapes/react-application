// src/hooks/usePricing.js
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

export const usePricing = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPricing = async () => {
      if (!token) return;

      try {
        const response = await fetch('/api/pricing', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Failed to fetch pricing data');

        const data = await response.json();
        setPricing(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching pricing:', err);
        setError(err.message);
        toast({
          title: "Error",
          description: "Failed to load pricing data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
  }, [token]);

  const getPriceByName = (name) => {
    const matchedItem = pricing?.find(p => 
      p.name.toLowerCase() === name.toLowerCase()
    );
    return matchedItem ? matchedItem.value : 0;
  };

  const getPriceById = (id) => {
    const matchedItem = pricing?.find(p => p.id === id);
    return matchedItem ? matchedItem.value : 0;
  };

  const getPricesByCategory = (category) => {
    return pricing?.filter(p => p.category === category) || [];
  };

  return {
    pricing,
    loading,
    error,
    getPriceByName,
    getPriceById,
    getPricesByCategory
  };
};