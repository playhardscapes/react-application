// src/routes/ai.js
const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const Anthropic = require('@anthropic-ai/sdk');

// Proposal Generation Routes
router.post('/generate-proposal', async (req, res) => {
  try {
    const { estimateData, clientData, model } = req.body;
    const proposal = await aiService.generateProposal(estimateData, clientData, model);
    res.json({ proposal });
  } catch (error) {
    console.error('Proposal generation error:', error);
    res.status(500).json({ error: 'Failed to generate proposal' });
  }
});

// Development Partner Routes
router.get('/analyze-schema', async (req, res) => {
  try {
    const analysis = await aiService.analyzeSchema();
    res.json(analysis);
  } catch (error) {
    console.error('Schema analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze schema' });
  }
});

router.post('/ask', async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const response = await aiService.processQuestion(question);
    res.json({ response });
  } catch (error) {
    console.error('AI question error:', error);
    res.status(500).json({ error: 'Failed to process question' });
  }
});

router.post('/generate-document-message', async (req, res) => {
    try {
      const { documentType, documentName, clientContext } = req.body;
      const message = await aiService.generateDocumentMessage({
        type: documentType,
        original_name: documentName,
        clientContext
      });
      res.json({ message });
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate message' });
    }
  });


router.get('/development-progress', async (req, res) => {
  try {
    const analysis = await aiService.analyzeDevelopmentProgress();
    res.json(analysis);
  } catch (error) {
    console.error('Development analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze development progress' });
  }
});

// New Metadata Extraction Route
router.post('/extract-metadata', async (req, res) => {
  try {
    const { text } = req.body;
    
    // Use Claude for metadata extraction
    const anthropic = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY
    });

    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: `Extract metadata from this document text:

${text}

Return a JSON object with:
- category: string
- description: string
- tags: string[]
- confidence: number (0-1)

Ensure the output is valid JSON.`
        }
      ]
    });

    // Parse the response
    const metadata = JSON.parse(response.content[0].text);
    
    res.json(metadata);
  } catch (error) {
    console.error('Metadata extraction error:', error);
    res.status(500).json({ 
      category: 'Uncategorized', 
      description: 'Failed to extract metadata', 
      tags: ['import-error'],
      confidence: 0 
    });
  }
});

module.exports = router;