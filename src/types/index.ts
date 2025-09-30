// Core types for the AI Interview Assistant

export interface CandidateInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  resumeUrl?: string;
  createdAt: string;
}

export interface Question {
  id: string;
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number; // in seconds
  orderIndex: number;
}

export interface Answer {
  questionId: string;
  text: string;
  timeTaken: number; // in seconds
  score?: number;
  feedback?: string;
  submittedAt: string;
}

export interface InterviewSession {
  id: string;
  candidateInfo: CandidateInfo;
  questions: Question[];
  answers: Answer[];
  currentQuestionIndex: number;
  status: 'not_started' | 'collecting_info' | 'in_progress' | 'completed' | 'paused';
  startedAt?: string;
  completedAt?: string;
  totalScore?: number;
  summary?: string;
  timeRemaining?: number;
  pausedAt?: string;
}

export interface ChatMessage {
  id: string;
  type: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: {
    isQuestion?: boolean;
    questionId?: string;
    isAnswer?: boolean;
  };
}

export interface AppState {
  sessions: InterviewSession[];
  currentSessionId: string | null;
  chatHistory: Record<string, ChatMessage[]>;
  ui: {
    activeTab: 'interviewee' | 'interviewer';
    showWelcomeBackModal: boolean;
  };
}
