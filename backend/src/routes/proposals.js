// src/routes/proposals.js
const express = require('express');
const router = express.Router();
const proposalService = require('../services/proposalService');

// Get all proposals
router.get('/proposals', async (req, res) => {
  try {
    const proposals = await proposalService.getAllProposals();
    res.json(proposals);
  } catch (error) {
    console.error('Error fetching proposals:', error);
    res.status(500).json({ error: 'Failed to fetch proposals' });
  }
});

// Get proposals needing follow-up
router.get('/proposals/follow-up', async (req, res) => {
  try {
    const proposals = await proposalService.getProposalsNeedingFollowUp();
    res.json(proposals);
  } catch (error) {
    console.error('Error fetching follow-up proposals:', error);
    res.status(500).json({ error: 'Failed to fetch follow-up proposals' });
  }
});

// Get single proposal
router.get('/proposals/:id', async (req, res) => {
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

// Create new proposal
router.post('/proposals', async (req, res) => {
  try {
    const proposal = await proposalService.createProposal(req.body);
    res.status(201).json(proposal);
  } catch (error) {
    console.error('Error creating proposal:', error);
    res.status(500).json({ error: 'Failed to create proposal' });
  }
});

// Update proposal status
router.patch('/proposals/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    const proposal = await proposalService.updateProposalStatus(req.params.id, status);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    res.json(proposal);
  } catch (error) {
    console.error('Error updating proposal status:', error);
    res.status(500).json({ error: 'Failed to update proposal status' });
  }
});

module.exports = router;