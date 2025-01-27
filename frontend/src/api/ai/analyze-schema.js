// src/api/ai/analyze-schema.js
async function analyzeSchema(req, res) {
    try {
      // Get current database schema
      const schema = await getDatabaseSchema();
      
      // Send to Claude API for analysis
      const analysis = await claude.analyze({
        type: 'schema_review',
        schema: schema,
        context: 'court construction business'
      });
      
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }