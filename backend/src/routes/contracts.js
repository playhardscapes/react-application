// src/routes/contracts.js
const express = require('express');
const router = express.Router();
const contractService = require('../services/contractService');

// Get all contracts
router.get('/', async (req, res) => {
  try {
    const contracts = await contractService.getAllContracts();
    res.json(contracts);
  } catch (error) {
    console.error('Error fetching contracts:', error);
    res.status(500).json({ error: 'Failed to fetch contracts' });
  }
});

// Get contract by ID
router.get('/:id', async (req, res) => {
  try {
    const contract = await contractService.getContractById(req.params.id);
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    res.json(contract);
  } catch (error) {
    console.error('Error fetching contract:', error);
    res.status(500).json({ error: 'Failed to fetch contract' });
  }
});

// Generate contract from proposal
router.post('/generate', async (req, res) => {
  try {
    const { proposalData } = req.body;
    console.log('Route received proposal data:', proposalData);

    if (!proposalData) {
      return res.status(400).json({ error: 'Proposal data is required' });
    }

    const contract = await contractService.generateContract(proposalData);
    console.log('Contract generated:', { id: contract.id });

    res.json(contract);
  } catch (error) {
    console.error('Contract generation error:', error);
    res.status(500).json({
      error: 'Failed to generate contract',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Update contract content
router.put('/:id', async (req, res) => {
  try {
    console.log('Updating contract:', req.params.id, req.body);
    
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const result = await contractService.updateContract(req.params.id, { content });
    
    console.log('Contract updated:', result);
    res.json(result);
  } catch (error) {
    console.error('Error updating contract:', error);
    res.status(500).json({
      error: 'Failed to update contract',
      details: error.message
    });
  }
});

// Update contract details (status, dates, etc)
router.put('/:id/details', async (req, res) => {
  try {
    console.log('Updating contract details:', req.body);
    const { status } = req.body;
    
    // Validate status if provided
    const validStatuses = ['draft', 'pending_signature', 'signed', 'active', 'completed', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    const contract = await contractService.updateContract(req.params.id, req.body);
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    console.log('Contract updated:', contract);
    res.json(contract);
  } catch (error) {
    console.error('Error updating contract details:', error);
    res.status(500).json({ 
      error: 'Failed to update contract details',
      details: error.message
    });
  }
});

// Delete contract
router.delete('/:id', async (req, res) => {
  try {
    console.log('Deleting contract:', req.params.id);
    
    const contract = await contractService.getContractById(req.params.id);
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    await contractService.deleteContract(req.params.id);
    
    res.json({ message: 'Contract deleted successfully' });
  } catch (error) {
    console.error('Error deleting contract:', error);
    res.status(500).json({ 
      error: 'Failed to delete contract',
      details: error.message
    });
  }
});

module.exports = router;