import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Upload, message, Card, Progress, Typography, Space, Alert } from 'antd';
import { UploadOutlined, SendOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { 
  createSession, 
  updateCandidateInfo, 
  setQuestions, 
  submitAnswer, 
  addChatMessage,
  updateTimeRemaining,
  setFinalResults
} from '../../store/slices/sessionSlice';
import { ResumeParser } from '../../services/resumeParser';
import { AIService } from '../../services/aiService';
import { v4 as uuidv4 } from 'uuid';
import type { ChatMessage, Answer } from '../../types';
import type { UploadFile } from 'antd/es/upload/interface';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const ChatInterface: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentSessionId = useAppSelector(state => state.session.currentSessionId);
  const currentSession = useAppSelector(state => 
    state.session.sessions.find(s => s.id === currentSessionId)
  );
  const chatHistory = useAppSelector(state => 
    currentSessionId ? state.session.chatHistory[currentSessionId] || [] : []
  );
  
  const [inputValue, setInputValue] = useState('');
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);
  
  // Timer management
  useEffect(() => {
    if (currentSession?.status === 'in_progress' && currentSession.questions.length > 0) {
      const currentQuestion = currentSession.questions[currentSession.currentQuestionIndex];
      
      if (!currentQuestion) return;
      
      // Set initial time or resume from saved time
      if (currentSession.timeRemaining !== undefined) {
        setTimeRemaining(currentSession.timeRemaining);
      } else {
        setTimeRemaining(currentQuestion.timeLimit);
      }
      
      // Start countdown
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Time's up! Auto-submit
            handleAutoSubmit();
            return 0;
          }
          
          // Save time remaining to store
          if (currentSessionId) {
            dispatch(updateTimeRemaining({ 
              sessionId: currentSessionId, 
              timeRemaining: prev - 1 
            }));
          }
          
          return prev - 1;
        });
      }, 1000);
      
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [currentSession?.status, currentSession?.currentQuestionIndex]);
  
  const handleAutoSubmit = async () => {
    if (!currentSession || !currentSessionId) return;
    
    const currentQuestion = currentSession.questions[currentSession.currentQuestionIndex];
    if (!currentQuestion) return;
    
    // Submit whatever answer is in the input (or empty)
    await submitAnswerHandler(inputValue || "Time expired - no answer provided");
  };
  
  const handleFileUpload = async (file: UploadFile) => {
    try {
      console.log('Starting file upload:', file.name, file.type);
      
      // Ensure file is a File object
      const fileToProcess = file.originFileObj || file;
      
      if (!fileToProcess) {
        throw new Error('No file provided');
      }
      
      console.log('Processing file:', fileToProcess);
      const parsedResume = await ResumeParser.parseResume(fileToProcess as File);
      console.log('Parsed resume:', parsedResume);
      
      // Create new session
      const candidateInfo = {
        id: uuidv4(),
        name: parsedResume.name || '',
        email: parsedResume.email || '',
        phone: parsedResume.phone || '',
        createdAt: new Date().toISOString(),
      };
      
      dispatch(createSession(candidateInfo));
      const sessionId = candidateInfo.id; // We'll use this to track the session
      
      // Add system message
      const systemMessage: ChatMessage = {
        id: uuidv4(),
        type: 'system',
        content: 'Resume uploaded successfully. Let me verify your information.',
        timestamp: new Date().toISOString(),
      };
      dispatch(addChatMessage({ sessionId, message: systemMessage }));
      
      // Check for missing fields
      const validation = ResumeParser.validateInfo(parsedResume);
      console.log('Validation result:', validation);
      
      if (!validation.isValid) {
        // Ask for missing information
        const missingFieldsMessage: ChatMessage = {
          id: uuidv4(),
          type: 'assistant',
          content: `I noticed some information is missing from your resume. Please provide your ${validation.missingFields.join(', ')}.`,
          timestamp: new Date().toISOString(),
        };
        dispatch(addChatMessage({ sessionId, message: missingFieldsMessage }));
      } else {
        // All info present, start interview
        await startInterview(sessionId);
      }
      
      message.success('Resume processed successfully!');
    } catch (error) {
      console.error('Error processing resume:', error);
      message.error(`Failed to parse resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  const startInterview = async (sessionId: string) => {
    // Generate questions
    const questions = await AIService.generateQuestions();
    dispatch(setQuestions({ sessionId, questions }));
    
    // Send first question
    const firstQuestion = questions[0];
    const questionMessage: ChatMessage = {
      id: uuidv4(),
      type: 'assistant',
      content: `Great! Let's begin the interview.\n\nQuestion 1 (${firstQuestion.difficulty}):\n${firstQuestion.text}`,
      timestamp: new Date().toISOString(),
      metadata: {
        isQuestion: true,
        questionId: firstQuestion.id,
      },
    };
    dispatch(addChatMessage({ sessionId, message: questionMessage }));
  };
  
  const handleSendMessage = async () => {
    if (!inputValue.trim() || !currentSessionId || !currentSession) return;
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      id: uuidv4(),
      type: 'user',
      content: inputValue,
      timestamp: new Date().toISOString(),
    };
    dispatch(addChatMessage({ sessionId: currentSessionId, message: userMessage }));
    
    // Handle based on session status
    if (currentSession.status === 'collecting_info') {
      // Check if we're collecting missing info
      const validation = ResumeParser.validateInfo(currentSession.candidateInfo as any);
      
      if (validation.missingFields.includes('name') && !currentSession.candidateInfo.name) {
        dispatch(updateCandidateInfo({ 
          sessionId: currentSessionId, 
          info: { name: inputValue } 
        }));
      } else if (validation.missingFields.includes('email') && !currentSession.candidateInfo.email) {
        dispatch(updateCandidateInfo({ 
          sessionId: currentSessionId, 
          info: { email: inputValue } 
        }));
      } else if (validation.missingFields.includes('phone') && !currentSession.candidateInfo.phone) {
        dispatch(updateCandidateInfo({ 
          sessionId: currentSessionId, 
          info: { phone: inputValue } 
        }));
      }
      
      // Check if all info is now complete
      const updatedInfo = { ...currentSession.candidateInfo };
      const newValidation = ResumeParser.validateInfo(updatedInfo as any);
      
      if (newValidation.isValid) {
        await startInterview(currentSessionId);
      } else {
        // Ask for next missing field
        const nextField = newValidation.missingFields[0];
        const promptMessage: ChatMessage = {
          id: uuidv4(),
          type: 'assistant',
          content: `Thank you! Now, please provide your ${nextField}.`,
          timestamp: new Date().toISOString(),
        };
        dispatch(addChatMessage({ sessionId: currentSessionId, message: promptMessage }));
      }
    } else if (currentSession.status === 'in_progress') {
      // Submit answer to current question
      await submitAnswerHandler(inputValue);
    }
    
    setInputValue('');
  };
  
  const submitAnswerHandler = async (answerText: string) => {
    if (!currentSession || !currentSessionId) return;
    
    setIsSubmitting(true);
    
    const currentQuestion = currentSession.questions[currentSession.currentQuestionIndex];
    
    // Evaluate answer
    const evaluation = await AIService.evaluateAnswer(currentQuestion, answerText);
    
    // Create answer object
    const answer: Answer = {
      questionId: currentQuestion.id,
      text: answerText,
      timeTaken: currentQuestion.timeLimit - timeRemaining,
      score: evaluation.score,
      feedback: evaluation.feedback,
      submittedAt: new Date().toISOString(),
    };
    
    // Submit answer
    dispatch(submitAnswer({ sessionId: currentSessionId, answer }));
    
    // Add feedback message
    const feedbackMessage: ChatMessage = {
      id: uuidv4(),
      type: 'system',
      content: `Score: ${evaluation.score}/10. ${evaluation.feedback}`,
      timestamp: new Date().toISOString(),
    };
    dispatch(addChatMessage({ sessionId: currentSessionId, message: feedbackMessage }));
    
    // Check if there are more questions
    if (currentSession.currentQuestionIndex < currentSession.questions.length - 1) {
      // Send next question after a short delay
      setTimeout(() => {
        const nextQuestion = currentSession.questions[currentSession.currentQuestionIndex + 1];
        const questionMessage: ChatMessage = {
          id: uuidv4(),
          type: 'assistant',
          content: `Question ${currentSession.currentQuestionIndex + 2} (${nextQuestion.difficulty}):\n${nextQuestion.text}`,
          timestamp: new Date().toISOString(),
          metadata: {
            isQuestion: true,
            questionId: nextQuestion.id,
          },
        };
        dispatch(addChatMessage({ sessionId: currentSessionId, message: questionMessage }));
      }, 1000);
    } else {
      // Interview complete - generate summary
      const allAnswers = [...currentSession.answers, answer];
      const summary = await AIService.generateSummary(allAnswers, currentSession.questions);
      
      dispatch(setFinalResults({ 
        sessionId: currentSessionId, 
        totalScore: summary.totalScore, 
        summary: summary.summary 
      }));
      
      // Add completion message
      const completionMessage: ChatMessage = {
        id: uuidv4(),
        type: 'system',
        content: `🎉 Interview Complete!\n\nFinal Score: ${summary.totalScore}%\n\n${summary.summary}`,
        timestamp: new Date().toISOString(),
      };
      dispatch(addChatMessage({ sessionId: currentSessionId, message: completionMessage }));
    }
    
    setIsSubmitting(false);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getTimerColor = () => {
    if (timeRemaining <= 10) return '#ff4d4f';
    if (timeRemaining <= 30) return '#faad14';
    return '#52c41a';
  };
  
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 20 }}>
      {!currentSession ? (
        <Card style={{ maxWidth: 600, margin: '0 auto', marginTop: 50 }}>
          <Title level={3}>Welcome to AI Interview Assistant</Title>
          <Paragraph>
            Please upload your resume (PDF or DOCX) to begin the interview process.
          </Paragraph>
          <Upload
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            beforeUpload={(file) => {
              console.log('File selected:', file);
              handleFileUpload(file as any);
              return false; // Prevent default upload behavior
            }}
            showUploadList={false}
            maxCount={1}
          >
            <Button icon={<UploadOutlined />} type="primary" size="large">
              Upload Resume (PDF or DOCX)
            </Button>
          </Upload>
        </Card>
      ) : (
        <>
          {/* Timer display for active questions */}
          {currentSession.status === 'in_progress' && timeRemaining > 0 && (
            <Card style={{ marginBottom: 16 }}>
              <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                <Space>
                  <ClockCircleOutlined style={{ fontSize: 20, color: getTimerColor() }} />
                  <Text strong style={{ fontSize: 18, color: getTimerColor() }}>
                    Time Remaining: {formatTime(timeRemaining)}
                  </Text>
                </Space>
                <Progress 
                  percent={Math.round((timeRemaining / (currentSession.questions[currentSession.currentQuestionIndex]?.timeLimit || 1)) * 100)}
                  strokeColor={getTimerColor()}
                  showInfo={false}
                  style={{ width: 200 }}
                />
              </Space>
            </Card>
          )}
          
          {/* Progress indicator */}
          {currentSession.status === 'in_progress' && (
            <Alert
              message={`Question ${currentSession.currentQuestionIndex + 1} of ${currentSession.questions.length}`}
              type="info"
              style={{ marginBottom: 16 }}
            />
          )}
          
          {/* Chat messages */}
          <Card 
            style={{ 
              flex: 1, 
              marginBottom: 16, 
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column'
            }}
            bodyStyle={{ 
              flex: 1, 
              overflow: 'auto',
              padding: 16
            }}
          >
            <div style={{ minHeight: 400 }}>
              {chatHistory.map((message) => (
                <div
                  key={message.id}
                  style={{
                    marginBottom: 16,
                    textAlign: message.type === 'user' ? 'right' : 'left',
                  }}
                >
                  <Card
                    size="small"
                    style={{
                      display: 'inline-block',
                      maxWidth: '70%',
                      backgroundColor:
                        message.type === 'user' ? '#1890ff' :
                        message.type === 'system' ? '#f0f0f0' : '#fff',
                      color: message.type === 'user' ? '#fff' : '#000',
                      border: message.type === 'assistant' ? '1px solid #d9d9d9' : 'none',
                    }}
                  >
                    <Text style={{ color: 'inherit', whiteSpace: 'pre-wrap' }}>
                      {message.content}
                    </Text>
                  </Card>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </Card>
          
          {/* Input area */}
          {currentSession.status !== 'completed' && (
            <Space.Compact style={{ width: '100%' }}>
              <TextArea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onPressEnter={(e) => {
                  if (!e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={
                  currentSession.status === 'collecting_info' 
                    ? "Enter the requested information..."
                    : "Type your answer here..."
                }
                autoSize={{ minRows: 2, maxRows: 6 }}
                style={{ width: '100%' }}
                disabled={isSubmitting}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSendMessage}
                loading={isSubmitting}
                style={{ height: 'auto' }}
              >
                Send
              </Button>
            </Space.Compact>
          )}
        </>
      )}
    </div>
  );
};

export default ChatInterface;
