import React from 'react';
import { Modal, Button, List, Typography, Tag } from 'antd';
import { format } from 'date-fns';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setShowWelcomeBackModal } from '../store/slices/uiSlice';
import { resumeSession, setCurrentSession } from '../store/slices/sessionSlice';
import type { InterviewSession } from '../types';

const { Title, Text } = Typography;

const WelcomeBackModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const showModal = useAppSelector(state => state.ui.showWelcomeBackModal);
  const sessions = useAppSelector(state => state.session.sessions);
  
  // Find paused or in-progress sessions
  const unfinishedSessions = sessions.filter(
    session => session.status === 'paused' || session.status === 'in_progress'
  );
  
  const handleResume = (sessionId: string) => {
    dispatch(resumeSession(sessionId));
    dispatch(setShowWelcomeBackModal(false));
  };
  
  const handleStartNew = () => {
    dispatch(setCurrentSession(null));
    dispatch(setShowWelcomeBackModal(false));
  };
  
  const getStatusColor = (status: InterviewSession['status']) => {
    switch (status) {
      case 'paused':
        return 'orange';
      case 'in_progress':
        return 'blue';
      default:
        return 'default';
    }
  };
  
  const getProgressText = (session: InterviewSession) => {
    if (session.questions.length === 0) {
      return 'Not started';
    }
    return `Question ${session.currentQuestionIndex + 1} of ${session.questions.length}`;
  };
  
  return (
    <Modal
      title={<Title level={3}>Welcome Back!</Title>}
      open={showModal && unfinishedSessions.length > 0}
      onCancel={handleStartNew}
      footer={null}
      width={600}
    >
      <Text>You have unfinished interview sessions. Would you like to continue?</Text>
      
      <List
        style={{ marginTop: 20 }}
        dataSource={unfinishedSessions}
        renderItem={(session) => (
          <List.Item
            actions={[
              <Button type="primary" onClick={() => handleResume(session.id)}>
                Resume
              </Button>
            ]}
          >
            <List.Item.Meta
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Text strong>{session.candidateInfo.name}</Text>
                  <Tag color={getStatusColor(session.status)}>
                    {session.status === 'paused' ? 'Paused' : 'In Progress'}
                  </Tag>
                </div>
              }
              description={
                <div>
                  <Text type="secondary">
                    Started: {format(new Date(session.startedAt || ''), 'MMM dd, yyyy HH:mm')}
                  </Text>
                  <br />
                  <Text type="secondary">
                    Progress: {getProgressText(session)}
                  </Text>
                </div>
              }
            />
          </List.Item>
        )}
      />
      
      <div style={{ marginTop: 20, textAlign: 'center' }}>
        <Button onClick={handleStartNew}>Start New Interview</Button>
      </div>
    </Modal>
  );
};

export default WelcomeBackModal;
