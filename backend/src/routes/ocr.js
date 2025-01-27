// src/routes/ocr.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const { auth: authenticateToken } = require('../middleware/auth');

router.post('/process', upload.single('file'), async (req, res) => {
  try {
    // Check for environment variables first
    if (!process.env.AZURE_VISION_ENDPOINT || !process.env.AZURE_VISION_KEY) {
      console.error('Azure Vision credentials not found in environment variables');
      return res.status(500).json({ 
        error: 'Azure Vision configuration missing',
        details: 'Please check environment variables'
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { ComputerVisionClient } = require('@azure/cognitiveservices-computervision');
    const { ApiKeyCredentials } = require('@azure/ms-rest-js');

    const computerVisionClient = new ComputerVisionClient(
      new ApiKeyCredentials({ 
        inHeader: { 
          'Ocp-Apim-Subscription-Key': process.env.AZURE_VISION_KEY 
        }
      }),
      process.env.AZURE_VISION_ENDPOINT
    );

    // Start the read operation
    const readOperation = await computerVisionClient.readInStream(req.file.buffer);
    const operationId = readOperation.operationLocation.split('/').pop();

    // Wait for the results
    let result;
    let attempts = 0;
    do {
      result = await computerVisionClient.getReadResult(operationId);
      if (result.status !== 'running') {
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    } while (attempts < 10);

    if (result.status !== 'succeeded') {
      throw new Error('OCR operation failed or timed out');
    }

    // Extract text from the results
    const text = result.analyzeResult.readResults
      .map(page => page.lines.map(line => line.text).join('\n'))
      .join('\n\n');

    res.json({
      text,
      metadata: {
        pages: result.analyzeResult.readResults.length,
        language: result.analyzeResult.language || 'en'
      }
    });

  } catch (error) {
    console.error('OCR processing error:', error);
    res.status(500).json({ 
      error: 'Failed to process document',
      details: error.message 
    });
  }
});

// Export just the router
module.exports = router;