const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs'); // Import for file handling
const fetch = require('node-fetch'); // Import fetch for backend API requests
const proposalRoutes = require('./routes/proposal');
const notificationRoutes = require('./routes/notifications');

// Load environment variables from .env file in the root directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Log to verify environment variables are loaded
console.log('API Key loaded:', process.env.ANTHROPIC_API_KEY ? 'Yes' : 'No');
console.log('Google Maps API Key loaded:', process.env.GOOGLE_MAPS_API_KEY ? 'Yes' : 'No');


const app = express();

// File path for pricing configuration
const filePath = path.join(__dirname, 'pricingConfiguration.json'); // Save JSON file in backend/src

app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes
app.use('/api/proposal', proposalRoutes);
app.use('/api/notifications', notificationRoutes);

// Pricing Configuration Endpoints
app.post('/api/save-pricing', (req, res) => {
  const pricingData = req.body;
  fs.writeFileSync(filePath, JSON.stringify(pricingData, null, 2));
  res.json({ success: true });
});

app.get('/api/load-pricing', (req, res) => {
  if (fs.existsSync(filePath)) {
    const pricingData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    res.json(pricingData);
  } else {
    res.status(404).json({ error: 'Pricing configuration not found' });
  }
});

// Mileage Calculation Endpoint
app.post('/api/mileage', async (req, res) => {
  const { origin, destination } = req.body;

  if (!origin || !destination) {
    return res.status(400).json({ error: 'Origin and destination are required' });
  }

  const apiKey = 'AIzaSyDwZUW-iKrQMIFY5SykUl9fK7inZwNA66E'; // Replace with your actual API key
  const apiUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
    origin
  )}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    // Log the API response to troubleshoot the structure
    console.log('Google API Response:', JSON.stringify(data, null, 2));

    if (data.status === 'OK' && data.rows?.[0]?.elements?.[0]?.status === 'OK') {
      const distanceElement = data.rows[0].elements[0];
      if (distanceElement?.distance?.value) {
        const distanceInMiles = distanceElement.distance.value / 1609.34; // Convert meters to miles
        return res.json({ distanceInMiles: Math.round(distanceInMiles) });
      } else {
        console.error('Unexpected API Response Structure:', data);
        return res.status(500).json({ error: 'Invalid API response structure' });
      }
    } else {
      const errorMessage = data.error_message || 'Failed to calculate mileage';
      console.error('Google API Error:', errorMessage);
      res.status(500).json({ error: errorMessage });
    }
  } catch (error) {
    console.error('Error fetching mileage:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
