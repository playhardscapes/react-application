/ src/api/ai/ask.js
async function askAI(req, res) {
  try {
    const { question } = req.body;
    
    // Get context from database
    const context = await getAIContext();
    
    // Ask Claude
    const response = await claude.analyze({
      type: 'development_question',
      question: question,
      context: context
    });
    
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}