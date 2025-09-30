import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  activeTab: 'interviewee' | 'interviewer';
  showWelcomeBackModal: boolean;
  selectedCandidateId: string | null;
}

const initialState: UIState = {
  activeTab: 'interviewee',
  showWelcomeBackModal: false,
  selectedCandidateId: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<'interviewee' | 'interviewer'>) => {
      state.activeTab = action.payload;
    },
    
    setShowWelcomeBackModal: (state, action: PayloadAction<boolean>) => {
      state.showWelcomeBackModal = action.payload;
    },
    
    setSelectedCandidateId: (state, action: PayloadAction<string | null>) => {
      state.selectedCandidateId = action.payload;
    },
  },
});

export const {
  setActiveTab,
  setShowWelcomeBackModal,
  setSelectedCandidateId,
} = uiSlice.actions;

export default uiSlice.reducer;
