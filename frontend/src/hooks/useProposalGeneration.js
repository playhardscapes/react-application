 
// src/hooks/useProposalGeneration.js
import { useState } from 'react';
import { generateProposal, sendProposalEmail } from '../services/proposalService';

export const useProposalGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [generatedContent, setGeneratedContent] = useState('');

  const generate = async (projectData, supportingDocs) => {
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateProposal(projectData, supportingDocs);
      setGeneratedContent(result.content);
      return result.content;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  const sendEmail = async (email, clientInfo) => {
    if (!generatedContent) {
      throw new Error('No proposal content to send');
    }

    setIsSending(true);
    try {
      await sendProposalEmail(email, generatedContent, clientInfo);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsSending(false);
    }
  };

  return {
    generate,
    sendEmail,
    isGenerating,
    isSending,
    error,
    generatedContent,
    setError
  };
};
