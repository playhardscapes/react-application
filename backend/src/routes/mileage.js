// src/routes/mileage.js
const express = require('express');
const router = express.Router();
const { Client } = require('@googlemaps/google-maps-services-js');
const { body, validationResult } = require('express-validator');

// Create Google Maps client
const client = new Client({});

// Custom validation middleware
const validateMileageRequest = async (req, res, next) => {
  await Promise.all([
    body('origin').trim().notEmpty().withMessage('Origin is required').run(req),
    body('destination').trim().notEmpty().withMessage('Destination is required').run(req)
  ]);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation Failed', 
      details: errors.array() 
    });
  }
  next();
};

// Mileage calculation endpoint
router.post('/mileage', validateMileageRequest, async (req, res) => {
  try {
    const { origin, destination } = req.body;

    const response = await client.distancematrix({
      params: {
        origins: [origin],
        destinations: [destination],
        mode: 'driving',
        units: 'imperial',
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });

    if (response.data.status === 'OK') {
      const element = response.data.rows[0].elements[0];
      if (element.status === 'OK') {
        const distanceInMiles = parseFloat(element.distance.text.replace(' mi', ''));

        res.json({
          distanceInMiles,
          origin,
          destination
        });
      } else {
        throw new Error('Could not calculate distance between locations');
      }
    } else {
      throw new Error('Google Maps API request failed');
    }
  } catch (error) {
    console.error('Mileage calculation error:', error);
    res.status(500).json({ 
      error: 'Failed to calculate mileage',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;