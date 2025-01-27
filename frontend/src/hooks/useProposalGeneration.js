// useProposalGeneration.js
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { generateProposal, sendProposalEmail } from '../services/proposalService';

export const useProposalGeneration = () => {
  const { token } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [generatedContent, setGeneratedContent] = useState('');

  const generate = async (projectData, supportingDocs) => {
    if (!token) return;
    setIsGenerating(true);
    setError(null);
    
    try {
      const result = await generateProposal(projectData, supportingDocs, token);
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
    if (!generatedContent || !token) {
      throw new Error('No proposal content to send or not authenticated');
    }

    setIsSending(true);
    try {
      await sendProposalEmail(email, generatedContent, clientInfo, token);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsSending(false);
    }
  };

  return { generate, sendEmail, isGenerating, isSending, error, generatedContent, setError };
};