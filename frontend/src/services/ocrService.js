// src/services/ocrService.js
class OCRService {
  async extractText(file, token) {
    try {
      console.log('Starting OCR process with file:', {
        name: file.name,
        type: file.type,
        size: file.size
      });

      const formData = new FormData();
      formData.append('file', file);

      console.log('Sending OCR request...');
      const response = await fetch('/api/ocr/process', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      console.log('OCR Response status:', response.status);
      const responseData = await response.json();
      console.log('OCR Response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || 'OCR processing failed');
      }

      return responseData;

    } catch (error) {
      console.error('OCR Error:', {
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }
}

export default new OCRService();