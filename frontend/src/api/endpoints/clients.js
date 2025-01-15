 
useEffect(() => {
  const fetchData = async () => {
    try {
      // Fetch pricing configuration
      const pricingResponse = await fetch('/api/pricing');
      const pricingData = await pricingResponse.json();
      setPricing(pricingData);

      // If editing an existing estimate, fetch its data
      if (id) {
        const estimateResponse = await fetch(`/api/estimates/${id}`);
        if (!estimateResponse.ok) {
          throw new Error('Failed to fetch estimate');
        }
        const estimateData = await estimateResponse.json();
        setEstimateData(estimateData);
      }

      // Add this line to debug
      console.log('Pricing data:', pricingData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [id]);
