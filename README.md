# AI-Powered Interview Assistant

An intelligent React application that conducts automated technical interviews for full-stack developer positions. The system features AI-powered question generation, real-time answer evaluation, and comprehensive candidate assessment.

## Features

### For Candidates (Interviewee Tab)
- **Resume Upload**: Support for PDF and DOCX file formats
- **Smart Information Extraction**: Automatically extracts name, email, and phone from resumes
- **Interactive Chat Interface**: Conversational flow for missing information collection
- **Timed Questions**: Automatic progression with time limits:
  - Easy questions: 20 seconds
  - Medium questions: 60 seconds
  - Hard questions: 120 seconds
- **Real-time Feedback**: Instant scoring and feedback for each answer
- **Progress Tracking**: Visual indicators for interview progress

### For Interviewers (Dashboard Tab)
- **Candidate Rankings**: Sorted leaderboard based on performance scores
- **Detailed Analytics**: View complete interview transcripts and individual question scores
- **Search & Filter**: Find candidates by name, email, or phone number
- **Performance Metrics**: Color-coded scores and performance tags
- **Chat History**: Access to complete conversation logs

### Technical Features
- **State Persistence**: All data saved locally using Redux Persist
- **Session Management**: Pause/resume capability with Welcome Back modal
- **AI Integration**: OpenAI-powered question generation and answer evaluation
- **Responsive Design**: Modern UI with Ant Design components
- **Error Handling**: Graceful fallbacks for all edge cases

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **State Management**: Redux Toolkit with Redux Persist
- **UI Library**: Ant Design 5
- **AI Integration**: OpenAI API
- **PDF Processing**: PDF.js
- **DOCX Processing**: Mammoth.js
- **Date Handling**: date-fns
- **Unique IDs**: UUID

## Installation

1. Clone the repository:
```bash
git clone https://github.com/neha222222/ai-interview-assistant.git
cd ai-interview-assistant
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add your OpenAI API key (optional - app works without it):
```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to:
```
http://localhost:5173
```

## Usage Guide

### Starting an Interview

1. Navigate to the **Interviewee** tab
2. Upload your resume (PDF or DOCX format)
3. The system will extract your information automatically
4. If any information is missing, the chatbot will ask for it
5. Once all information is collected, the interview begins

### During the Interview

- **Read each question carefully** - You have limited time!
- **Type your answer** in the text area
- **Submit before time runs out** or it auto-submits
- **Review feedback** after each answer
- **Complete all 6 questions** to finish the interview

### Viewing Results

1. Switch to the **Interviewer** tab
2. View all completed interviews in the dashboard
3. Click "View Details" to see:
   - Complete question and answer pairs
   - Individual scores and feedback
   - Full chat transcript
   - Overall performance summary

### Resume/Pause Feature

- If you close the browser during an interview, don't worry!
- When you return, a "Welcome Back" modal will appear
- Choose to resume your session or start fresh
- All progress is automatically saved

## Interview Structure

The interview consists of 6 technical questions:
- **2 Easy Questions** (20 seconds each) - Basic concepts
- **2 Medium Questions** (60 seconds each) - Implementation details
- **2 Hard Questions** (120 seconds each) - Architecture & optimization

Topics covered include:
- React fundamentals and hooks
- Node.js and Express.js
- State management
- Performance optimization
- System design
- Full-stack architecture

## Configuration

### Without OpenAI API Key
The app functions with built-in questions and basic scoring algorithms:
- Predefined question bank
- Rule-based answer evaluation
- Keyword and length-based scoring

### With OpenAI API Key
Enhanced AI capabilities:
- Dynamic question generation
- Intelligent answer evaluation
- Contextual feedback
- Sophisticated performance summaries

## Browser Compatibility

- Chrome 90+ (Recommended)
- Firefox 88+
- Safari 14+
- Edge 90+

## Troubleshooting

### Resume Upload Issues
- Ensure PDF is not password-protected
- Check DOCX file isn't corrupted
- File size should be under 10MB

### Timer Not Working
- Check browser permissions
- Ensure JavaScript is enabled
- Try refreshing the page

### Data Not Persisting
- Check browser storage isn't full
- Ensure cookies are enabled
- Try clearing browser cache

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```