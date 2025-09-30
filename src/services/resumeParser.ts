import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure PDF.js worker - using specific version for compatibility
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

export interface ParsedResume {
  name?: string;
  email?: string;
  phone?: string;
  fullText: string;
}

export class ResumeParser {
  /**
   * Parse a resume file (PDF or DOCX) and extract candidate information
   */
  static async parseResume(file: File): Promise<ParsedResume> {
    const fileType = file.type;
    let fullText = '';
    
    if (fileType === 'application/pdf') {
      fullText = await ResumeParser.parsePDF(file);
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
               file.name.endsWith('.docx')) {
      fullText = await ResumeParser.parseDOCX(file);
    } else {
      throw new Error('Unsupported file format. Please upload a PDF or DOCX file.');
    }
    
    // Extract information from the text
    const extractedInfo = ResumeParser.extractInfo(fullText);
    
    return {
      ...extractedInfo,
      fullText,
    };
  }
  
  /**
   * Parse PDF file and extract text
   */
  private static async parsePDF(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }
      
      return fullText;
    } catch (error) {
      console.error('Error parsing PDF:', error);
      throw new Error('Failed to parse PDF file. Please ensure the file is not corrupted.');
    }
  }
  
  /**
   * Parse DOCX file and extract text
   */
  private static async parseDOCX(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (error) {
      console.error('Error parsing DOCX:', error);
      throw new Error('Failed to parse DOCX file. Please ensure the file is not corrupted.');
    }
  }
  
  /**
   * Extract name, email, and phone from resume text
   */
  private static extractInfo(text: string): { name?: string; email?: string; phone?: string } {
    const info: { name?: string; email?: string; phone?: string } = {};
    
    // Extract email
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
    const emailMatch = text.match(emailRegex);
    if (emailMatch && emailMatch.length > 0) {
      info.email = emailMatch[0].toLowerCase();
    }
    
    // Extract phone number (various formats)
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g;
    const phoneMatches = text.match(phoneRegex);
    if (phoneMatches) {
      // Filter for valid phone numbers (10+ digits)
      const validPhone = phoneMatches.find(match => {
        const digits = match.replace(/\D/g, '');
        return digits.length >= 10 && digits.length <= 15;
      });
      if (validPhone) {
        info.phone = validPhone.trim();
      }
    }
    
    // Extract name (heuristic: usually appears at the beginning)
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    // Try to find name in first few lines
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i].trim();
      
      // Skip lines that look like headers or contain special characters
      if (line.length < 50 && 
          !line.includes('@') && 
          !line.match(/\d{4,}/) && // Skip lines with 4+ digits
          !line.toLowerCase().includes('resume') &&
          !line.toLowerCase().includes('curriculum') &&
          line.match(/^[A-Za-z\s'-]+$/)) { // Only letters, spaces, hyphens, apostrophes
        
        // Check if it looks like a name (2-4 words)
        const words = line.split(/\s+/);
        if (words.length >= 2 && words.length <= 4) {
          // Check if words are capitalized (common for names)
          const isCapitalized = words.every(word => 
            word.length > 0 && word[0] === word[0].toUpperCase()
          );
          
          if (isCapitalized) {
            info.name = line;
            break;
          }
        }
      }
    }
    
    return info;
  }
  
  /**
   * Validate that all required fields are present
   */
  static validateInfo(info: ParsedResume): { isValid: boolean; missingFields: string[] } {
    const missingFields: string[] = [];
    
    if (!info.name || info.name.trim().length === 0) {
      missingFields.push('name');
    }
    
    if (!info.email || info.email.trim().length === 0) {
      missingFields.push('email');
    }
    
    if (!info.phone || info.phone.trim().length === 0) {
      missingFields.push('phone');
    }
    
    return {
      isValid: missingFields.length === 0,
      missingFields,
    };
  }
}
