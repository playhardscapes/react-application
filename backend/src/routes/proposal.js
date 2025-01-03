// backend/src/routes/proposal.js
require('dotenv').config(); // Load environment variables
const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const pdf = require('pdf-parse');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');

const anthropicClient = new Anthropic.Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

// Retry function with exponential backoff
const retryWithBackoff = async (fn, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            console.log(`Attempt ${i + 1} of ${maxRetries}...`);
            return await fn();
        } catch (error) {
            if (error.status === 529) { // Overloaded error
                const delay = Math.min(1000 * Math.pow(2, i), 10000); // Exponential backoff, max 10s
                console.log(`Server overloaded, retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                if (i === maxRetries - 1) throw error;
                continue;
            }
            throw error;
        }
    }
};

// Function to extract text from PDF
const extractPDFText = async (filePath) => {
    try {
        const dataBuffer = await fs.readFile(filePath);
        const data = await pdf(dataBuffer);
        return data.text;
    } catch (error) {
        console.error(`Error extracting text from ${filePath}:`, error);
        return 'Could not extract text from document';
    }
};

router.post('/generate', async (req, res) => {
    try {
        const { projectData, supportingDocs } = req.body;
        console.log('Starting proposal generation...');

        // Extract text from supporting documents
        const documentContents = await Promise.all(
            supportingDocs.map(async (docUrl) => {
                // Convert URL to local file path
                const localFilePath = path.join(
                    __dirname,
                    '../../frontend/public',
                    docUrl.replace(/^\//, '')
                );

                const documentText = await extractPDFText(localFilePath);
                return {
                    url: docUrl,
                    content: documentText
                };
            })
        );

        const generateProposal = async () => {
            return await anthropicClient.messages.create({
                model: 'claude-3-opus-20240229',
                messages: [{
                    role: 'user',
                    content: `Create a detailed proposal from the perspective of Play Hardscapes.
                    Write in first person, as though Patrick from Play Hardscapes is writing directly to the client.
                    Use proper HTML formatting for the response.

                    Project details:
                    ${JSON.stringify(projectData, null, 2)}

                    Supporting Documents Information:
                    ${documentContents.map(doc =>
                        `Document: ${doc.url}\n` +
                        `Key Information: ${doc.content.slice(0, 1000)}...`
                    ).join('\n\n')}

                    Format the response with:
                    1. Clear HTML section headers (<h2>, <p> tags)
                    2. Professional but personal tone
                    3. Specific details from the provided data
                    4. Incorporate insights from supporting documents
                    5. Clear next steps at the end

                    Write the response in clean HTML format.`
                }],
                max_tokens: 4096
            });
        };

        const completion = await retryWithBackoff(generateProposal);
        console.log('Proposal generated successfully');
        res.json({
            content: completion.content[0].text,
            documentDetails: documentContents.map(doc => ({
                url: doc.url,
                summary: doc.content.slice(0, 500)
            }))
        });

    } catch (error) {
        console.error('Error details:', error);
        res.status(error.status || 500).json({
            error: 'Failed to generate proposal',
            message: error.message,
            shouldRetry: error.status === 529
        });
    }
});

module.exports = router;
