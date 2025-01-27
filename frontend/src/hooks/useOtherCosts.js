// src/hooks/useOtherCosts.js
import { useMemo } from 'react';

export const useOtherCosts = (data) => {
  return useMemo(() => {
    const items = data.other_items || [];
    const total = items.reduce((sum, item) => sum + (item.cost || 0), 0);

    return {
      items,
      total
    };
  }, [data.other_items]);
};