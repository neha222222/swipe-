import OpenAI from 'openai';
import type { Question, Answer } from '../types';

// Initialize OpenAI client - API key should be set via environment variable
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true, // Only for demo purposes
});

// Question templates for different difficulty levels
const questionTemplates = {
  easy: [
    "What is React and what are its key features?",
    "Explain the difference between state and props in React.",
    "What is Node.js and why is it useful for backend development?",
    "Describe the purpose of package.json in a Node.js project.",
    "What are React hooks and name a few commonly used ones?",
    "Explain what JSX is in React.",
  ],
  medium: [
    "Explain the useEffect hook and its common use cases.",
    "How would you implement authentication in a Node.js Express application?",
    "What is the Virtual DOM and how does React use it?",
    "Describe the event loop in Node.js.",
    "How do you handle state management in large React applications?",
    "Explain middleware in Express.js with examples.",
  ],
  hard: [
    "How would you optimize a React application for performance?",
    "Design a scalable microservices architecture using Node.js.",
    "Explain React's reconciliation algorithm and fiber architecture.",
    "How would you implement server-side rendering with React and Node.js?",
    "Describe strategies for handling database transactions in Node.js.",
    "How would you implement real-time features using WebSockets in a full-stack application?",
  ],
};

export class AIService {
  /**
   * Generate interview questions based on difficulty progression
   */
  static async generateQuestions(): Promise<Question[]> {
    try {
      // For demo purposes, we'll use predefined questions
      // In production, you can use OpenAI to generate dynamic questions
      
      const questions: Question[] = [];
      let orderIndex = 0;
      
      // 2 Easy questions (20 seconds each)
      for (let i = 0; i < 2; i++) {
        const randomIndex = Math.floor(Math.random() * questionTemplates.easy.length);
        questions.push({
          id: `q_${orderIndex}`,
          text: questionTemplates.easy[randomIndex],
          difficulty: 'easy',
          timeLimit: 20,
          orderIndex: orderIndex++,
        });
      }
      
      // 2 Medium questions (60 seconds each)
      for (let i = 0; i < 2; i++) {
        const randomIndex = Math.floor(Math.random() * questionTemplates.medium.length);
        questions.push({
          id: `q_${orderIndex}`,
          text: questionTemplates.medium[randomIndex],
          difficulty: 'medium',
          timeLimit: 60,
          orderIndex: orderIndex++,
        });
      }
      
      // 2 Hard questions (120 seconds each)
      for (let i = 0; i < 2; i++) {
        const randomIndex = Math.floor(Math.random() * questionTemplates.hard.length);
        questions.push({
          id: `q_${orderIndex}`,
          text: questionTemplates.hard[randomIndex],
          difficulty: 'hard',
          timeLimit: 120,
          orderIndex: orderIndex++,
        });
      }
      
      return questions;
    } catch (error) {
      console.error('Error generating questions:', error);
      // Fallback to predefined questions
      return AIService.getFallbackQuestions();
    }
  }
  
  /**
   * Evaluate an answer and provide score and feedback
   */
  static async evaluateAnswer(question: Question, answer: string): Promise<{ score: number; feedback: string }> {
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      // Fallback evaluation when API key is not available
      return AIService.getFallbackEvaluation(answer);
    }
    
    try {
      const prompt = `
        Evaluate the following answer to a technical interview question.
        
        Question: ${question.text}
        Difficulty: ${question.difficulty}
        Answer: ${answer}
        
        Provide:
        1. A score from 0 to 10
        2. Brief feedback (max 2 sentences)
        
        Format your response as JSON:
        {
          "score": <number>,
          "feedback": "<string>"
        }
      `;
      
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an expert technical interviewer evaluating answers for a full-stack developer role.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 200,
      });
      
      const result = JSON.parse(response.choices[0].message?.content || '{}');
      return {
        score: Math.min(10, Math.max(0, result.score || 0)),
        feedback: result.feedback || 'Answer evaluated.',
      };
    } catch (error) {
      console.error('Error evaluating answer:', error);
      return AIService.getFallbackEvaluation(answer);
    }
  }
  
  /**
   * Generate final interview summary
   */
  static async generateSummary(answers: Answer[], questions: Question[]): Promise<{ totalScore: number; summary: string }> {
    const totalPossibleScore = questions.length * 10;
    const actualScore = answers.reduce((sum, ans) => sum + (ans.score || 0), 0);
    const percentage = Math.round((actualScore / totalPossibleScore) * 100);
    
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      return {
        totalScore: percentage,
        summary: `Candidate completed the interview with a score of ${percentage}%. ${
          percentage >= 70 ? 'Strong performance overall.' : 
          percentage >= 50 ? 'Adequate performance with room for improvement.' : 
          'Needs significant improvement in technical skills.'
        }`,
      };
    }
    
    try {
      const prompt = `
        Generate a brief summary (2-3 sentences) for a candidate's interview performance.
        
        Total Score: ${percentage}%
        Number of Questions: ${questions.length}
        
        Performance by difficulty:
        - Easy questions: ${answers.slice(0, 2).map(a => a.score).join(', ')}
        - Medium questions: ${answers.slice(2, 4).map(a => a.score).join(', ')}
        - Hard questions: ${answers.slice(4, 6).map(a => a.score).join(', ')}
        
        Provide a professional summary highlighting strengths and areas for improvement.
      `;
      
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an expert technical interviewer providing candidate summaries.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 150,
      });
      
      return {
        totalScore: percentage,
        summary: response.choices[0].message?.content || `Candidate scored ${percentage}% overall.`,
      };
    } catch (error) {
      console.error('Error generating summary:', error);
      return {
        totalScore: percentage,
        summary: `Candidate completed the interview with a score of ${percentage}%. ${
          percentage >= 70 ? 'Strong performance overall.' : 
          percentage >= 50 ? 'Adequate performance with room for improvement.' : 
          'Needs significant improvement in technical skills.'
        }`,
      };
    }
  }
  
  /**
   * Fallback questions when API is unavailable
   */
  private static getFallbackQuestions(): Question[] {
    return [
      // Easy
      { id: 'q_0', text: 'What is React and what are its key features?', difficulty: 'easy', timeLimit: 20, orderIndex: 0 },
      { id: 'q_1', text: 'Explain the difference between state and props in React.', difficulty: 'easy', timeLimit: 20, orderIndex: 1 },
      // Medium
      { id: 'q_2', text: 'How does the useEffect hook work and what are its use cases?', difficulty: 'medium', timeLimit: 60, orderIndex: 2 },
      { id: 'q_3', text: 'Explain middleware in Express.js with examples.', difficulty: 'medium', timeLimit: 60, orderIndex: 3 },
      // Hard
      { id: 'q_4', text: 'How would you optimize a React application for performance?', difficulty: 'hard', timeLimit: 120, orderIndex: 4 },
      { id: 'q_5', text: 'Design a scalable microservices architecture using Node.js.', difficulty: 'hard', timeLimit: 120, orderIndex: 5 },
    ];
  }
  
  /**
   * Fallback evaluation when API is unavailable
   */
  private static getFallbackEvaluation(answer: string): { score: number; feedback: string } {
    // Basic evaluation based on answer length and keywords
    const wordCount = answer.split(/\s+/).length;
    const hasKeywords = /react|node|javascript|component|state|props|hook|express|api|database/i.test(answer);
    
    let score = 5; // Base score
    
    if (wordCount > 50) score += 2;
    else if (wordCount > 20) score += 1;
    
    if (hasKeywords) score += 2;
    
    if (answer.length < 10) score = 2;
    
    score = Math.min(10, Math.max(0, score));
    
    const feedback = score >= 7 ? 'Good answer with relevant details.' :
                     score >= 5 ? 'Adequate answer but could be more comprehensive.' :
                     'Answer needs more detail and technical depth.';
    
    return { score, feedback };
  }
}
