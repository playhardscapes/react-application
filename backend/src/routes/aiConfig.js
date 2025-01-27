// src/routes/aiConfig.js
const express = require('express');
const router = express.Router();
const aiConfigService = require('../services/aiConfigService');
const codeCleanupService = require('../services/codeCleanupService');

// Initialize database on startup
aiConfigService.initializeDatabase().catch(console.error);

// Get all prompts
router.get('/prompts', async (req, res) => {
  try {
    const prompts = await aiConfigService.getAllPrompts();
    res.json(prompts);
  } catch (error) {
    console.error('Error fetching prompts:', error);
    res.status(500).json({ error: 'Failed to fetch prompts' });
  }
});

// Get prompt by ID
router.get('/prompts/:id', async (req, res) => {
  try {
    const prompt = await aiConfigService.getPromptById(req.params.id);
    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }
    res.json(prompt);
  } catch (error) {
    console.error('Error fetching prompt:', error);
    res.status(500).json({ error: 'Failed to fetch prompt' });
  }
});

// Update prompt
router.put('/prompts/:id', async (req, res) => {
  try {
    const prompt = await aiConfigService.updatePrompt(req.params.id, req.body);
    res.json(prompt);
  } catch (error) {
    console.error('Error updating prompt:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reset prompt to default
router.post('/prompts/:id/reset', async (req, res) => {
  try {
    const prompt = await aiConfigService.resetPrompt(req.params.id);
    res.json(prompt);
  } catch (error) {
    console.error('Error resetting prompt:', error);
    res.status(500).json({ error: error.message });
  }
});

// Analyze project for cleanup
router.get('/cleanup/analyze', async (req, res) => {
  try {
    const projectRoot = process.cwd();
    console.log('Analyzing project at:', projectRoot);
    
    const analysis = await codeCleanupService.analyzeProject(projectRoot);
    
    console.log('Analysis complete:', {
      duplicates: analysis.duplicates?.length || 0,
      unused: analysis.unused?.length || 0,
      priorities: analysis.priorities?.length || 0
    });
    
    res.json({
      duplicateFiles: analysis.duplicates || [],
      unusedFiles: analysis.unused || [],
      cleanupPriorities: analysis.priorities || [],
      totalFiles: analysis.totalFiles,
      scannedDirectories: analysis.scannedDirs
    });
  } catch (error) {
    console.error('Error analyzing project:', error);
    res.status(500).json({ 
      error: 'Failed to analyze project',
      details: error.message 
    });
  }
});

module.exports = router;