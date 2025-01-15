// src/routes/proposals.js
const express = require('express');
const router = express.Router();
const proposalService = require('../services/proposalService');
const db = require('../config/database');  // Add this for accepted proposals query

// Get all proposals with optional status filter
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    if (status === 'accepted') {
      // Special handling for accepted proposals
      const query = `
        SELECT 
          p.*,
          c.name as client_name,
          c.email as client_email,
          c.phone as client_phone,
          e.project_location,
          e.total_amount
        FROM proposals p
        LEFT JOIN clients c ON p.client_id = c.id
        LEFT JOIN estimates e ON p.estimate_id = e.id
        WHERE p.status = 'accepted'
        ORDER BY p.created_at DESC
      `;
      const result = await db.query(query);
      return res.json(result.rows);
    }
    
    // Regular proposals fetch
    const proposals = await proposalService.getAllProposals();
    res.json(proposals);
  } catch (error) {
    console.error('Error fetching proposals:', error);
    res.status(500).json({ error: 'Failed to fetch proposals' });
  }
});

// Get single proposal
router.get('/:id', async (req, res) => {
  try {
    const proposal = await proposalService.getProposalById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    res.json(proposal);
  } catch (error) {
    console.error('Error fetching proposal:', error);
    res.status(500).json({ error: 'Failed to fetch proposal' });
  }
});

// Generate proposal from estimate
router.post('/generate', async (req, res) => {
  try {
    const { estimateData, model } = req.body;
    console.log('Generating proposal with:', { estimateData, model });
    const content = await proposalService.generateProposal(estimateData, null, model);
    res.json({ content });
  } catch (error) {
    console.error('Error generating proposal:', error);
    res.status(500).json({ 
      error: 'Failed to generate proposal',
      details: error.message 
    });
  }
});

// Create new proposal
router.post('/', async (req, res) => {
  try {
    const proposal = await proposalService.createProposal(req.body);
    res.status(201).json(proposal);
  } catch (error) {
    console.error('Error creating proposal:', error);
    res.status(500).json({ error: 'Failed to create proposal' });
  }
});

// Update proposal
router.put('/:id', async (req, res) => {
  try {
    const proposal = await proposalService.updateProposal(req.params.id, req.body);
    res.json(proposal);
  } catch (error) {
    console.error('Error updating proposal:', error);
    res.status(500).json({ error: 'Failed to update proposal' });
  }
});

module.exports = router;