// src/utils/messageFormatter.js

/**
 * Formats AI responses with consistent HTML structure and styling
 */
const messageFormatter = {
    formatAIResponse(content) {
      if (!content) return '';
      
      let formatted = content;
  
      // Convert markdown-style headers to proper HTML headers
      formatted = formatted.replace(/###\s+([^\n]+)/g, '<h3 class="text-lg font-semibold mt-6 mb-3">$1</h3>');
      
      // Format code blocks with proper styling
      formatted = formatted.replace(
        /`([^`]+)`/g, 
        '<code class="bg-gray-100 px-1 rounded text-sm font-mono">$1</code>'
      );
  
      // Format lists with proper nesting and styling
      formatted = formatted.replace(
        /(?:^\s*[-*+]\s+(.+(?:\n|$)(?:\s+[-*+]\s+.+(?:\n|$))*))+/gm,
        (match) => {
          const items = match
            .split('\n')
            .filter(line => line.trim())
            .map(line => {
              const indentLevel = (line.match(/^\s+/) || [''])[0].length;
              const content = line.replace(/^\s*[-*+]\s+/, '');
              return `<li class="ml-${Math.min(indentLevel, 8)}">${content}</li>`;
            })
            .join('\\n');
          return `<ul class="list-disc pl-6 mb-4 space-y-2">${items}</ul>`;
        }
      );
  
      // Format paragraphs with proper spacing
      formatted = formatted.replace(
        /(?:^|\n\n)([^<\n].*?)(?=\n\n|$)/g,
        '<p class="mb-4">$1</p>'
      );
  
      // Clean up any double-spacing issues
      formatted = formatted.replace(/\n{3,}/g, '\n\n');
  
      return formatted;
    },
  
    // Parse and sanitize incoming AI responses
    parseAIResponse(response) {
      try {
        // If response is already an object with content property
        if (response && response.content) {
          return {
            ...response,
            content: this.formatAIResponse(response.content)
          };
        }
        
        // If response is just a string
        return {
          role: 'assistant',
          content: this.formatAIResponse(response),
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        console.error('Error parsing AI response:', error);
        return {
          role: 'system',
          content: '<p class="text-red-600">Error formatting response</p>',
          timestamp: new Date().toISOString(),
          error: true
        };
      }
    }
  };
  
  module.exports = messageFormatter;