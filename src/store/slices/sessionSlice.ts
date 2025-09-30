import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { InterviewSession, CandidateInfo, Question, Answer, ChatMessage } from '../../types';
import { v4 as uuidv4 } from 'uuid';

interface SessionState {
  sessions: InterviewSession[];
  currentSessionId: string | null;
  chatHistory: Record<string, ChatMessage[]>;
}

const initialState: SessionState = {
  sessions: [],
  currentSessionId: null,
  chatHistory: {},
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    createSession: (state, action: PayloadAction<CandidateInfo>) => {
      const sessionId = uuidv4();
      const newSession: InterviewSession = {
        id: sessionId,
        candidateInfo: action.payload,
        questions: [],
        answers: [],
        currentQuestionIndex: 0,
        status: 'collecting_info',
        startedAt: new Date().toISOString(),
      };
      state.sessions.push(newSession);
      state.currentSessionId = sessionId;
      state.chatHistory[sessionId] = [];
    },
    
    updateCandidateInfo: (state, action: PayloadAction<{ sessionId: string; info: Partial<CandidateInfo> }>) => {
      const session = state.sessions.find(s => s.id === action.payload.sessionId);
      if (session) {
        session.candidateInfo = { ...session.candidateInfo, ...action.payload.info };
      }
    },
    
    setQuestions: (state, action: PayloadAction<{ sessionId: string; questions: Question[] }>) => {
      const session = state.sessions.find(s => s.id === action.payload.sessionId);
      if (session) {
        session.questions = action.payload.questions;
        session.status = 'in_progress';
      }
    },
    
    submitAnswer: (state, action: PayloadAction<{ sessionId: string; answer: Answer }>) => {
      const session = state.sessions.find(s => s.id === action.payload.sessionId);
      if (session) {
        session.answers.push(action.payload.answer);
        if (session.currentQuestionIndex < session.questions.length - 1) {
          session.currentQuestionIndex++;
        } else {
          session.status = 'completed';
          session.completedAt = new Date().toISOString();
        }
      }
    },
    
    updateSessionStatus: (state, action: PayloadAction<{ sessionId: string; status: InterviewSession['status'] }>) => {
      const session = state.sessions.find(s => s.id === action.payload.sessionId);
      if (session) {
        session.status = action.payload.status;
        if (action.payload.status === 'paused') {
          session.pausedAt = new Date().toISOString();
        }
      }
    },
    
    setFinalResults: (state, action: PayloadAction<{ sessionId: string; totalScore: number; summary: string }>) => {
      const session = state.sessions.find(s => s.id === action.payload.sessionId);
      if (session) {
        session.totalScore = action.payload.totalScore;
        session.summary = action.payload.summary;
      }
    },
    
    addChatMessage: (state, action: PayloadAction<{ sessionId: string; message: ChatMessage }>) => {
      if (!state.chatHistory[action.payload.sessionId]) {
        state.chatHistory[action.payload.sessionId] = [];
      }
      state.chatHistory[action.payload.sessionId].push(action.payload.message);
    },
    
    setCurrentSession: (state, action: PayloadAction<string | null>) => {
      state.currentSessionId = action.payload;
    },
    
    updateTimeRemaining: (state, action: PayloadAction<{ sessionId: string; timeRemaining: number }>) => {
      const session = state.sessions.find(s => s.id === action.payload.sessionId);
      if (session) {
        session.timeRemaining = action.payload.timeRemaining;
      }
    },
    
    resumeSession: (state, action: PayloadAction<string>) => {
      const session = state.sessions.find(s => s.id === action.payload);
      if (session && session.status === 'paused') {
        session.status = 'in_progress';
        session.pausedAt = undefined;
      }
      state.currentSessionId = action.payload;
    },
  },
});

export const {
  createSession,
  updateCandidateInfo,
  setQuestions,
  submitAnswer,
  updateSessionStatus,
  setFinalResults,
  addChatMessage,
  setCurrentSession,
  updateTimeRemaining,
  resumeSession,
} = sessionSlice.actions;

export default sessionSlice.reducer;
