import React, { useState, useMemo } from 'react';
import { Table, Input, Space, Button, Tag, Modal, Card, Typography, List, Progress, Divider } from 'antd';
import { EyeOutlined, UserOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { format } from 'date-fns';
import { useAppSelector } from '../../store/hooks';
import type { InterviewSession } from '../../types';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

const Dashboard: React.FC = () => {
  const sessions = useAppSelector(state => state.session.sessions);
  const chatHistory = useAppSelector(state => state.session.chatHistory);
  
  const [searchText, setSearchText] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<InterviewSession | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Filter completed sessions and sort by score
  const completedSessions = useMemo(() => {
    return sessions
      .filter(session => session.status === 'completed')
      .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
  }, [sessions]);
  
  // Filter sessions based on search
  const filteredSessions = useMemo(() => {
    if (!searchText) return completedSessions;
    
    const searchLower = searchText.toLowerCase();
    return completedSessions.filter(session => 
      session.candidateInfo.name.toLowerCase().includes(searchLower) ||
      session.candidateInfo.email.toLowerCase().includes(searchLower) ||
      session.candidateInfo.phone.includes(searchText)
    );
  }, [completedSessions, searchText]);
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };
  
  const getScoreTag = (score: number) => {
    if (score >= 80) return { color: 'green', text: 'Excellent' };
    if (score >= 70) return { color: 'blue', text: 'Good' };
    if (score >= 60) return { color: 'orange', text: 'Average' };
    if (score >= 50) return { color: 'volcano', text: 'Below Average' };
    return { color: 'red', text: 'Poor' };
  };
  
  const columns: ColumnsType<InterviewSession> = [
    {
      title: 'Rank',
      key: 'rank',
      width: 70,
      render: (_, __, index) => (
        <Text strong>#{index + 1}</Text>
      ),
    },
    {
      title: 'Candidate Name',
      dataIndex: ['candidateInfo', 'name'],
      key: 'name',
      sorter: (a, b) => a.candidateInfo.name.localeCompare(b.candidateInfo.name),
      render: (name) => (
        <Space>
          <UserOutlined />
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: ['candidateInfo', 'email'],
      key: 'email',
      render: (email) => (
        <Space>
          <MailOutlined />
          <Text>{email}</Text>
        </Space>
      ),
    },
    {
      title: 'Phone',
      dataIndex: ['candidateInfo', 'phone'],
      key: 'phone',
      render: (phone) => (
        <Space>
          <PhoneOutlined />
          <Text>{phone}</Text>
        </Space>
      ),
    },
    {
      title: 'Score',
      dataIndex: 'totalScore',
      key: 'score',
      width: 150,
      sorter: (a, b) => (a.totalScore || 0) - (b.totalScore || 0),
      render: (score) => {
        const scoreTag = getScoreTag(score || 0);
        return (
          <Space>
            <Progress
              type="circle"
              percent={score || 0}
              width={50}
              strokeColor={getScoreColor(score || 0)}
            />
            <Tag color={scoreTag.color}>{scoreTag.text}</Tag>
          </Space>
        );
      },
    },
    {
      title: 'Completed At',
      dataIndex: 'completedAt',
      key: 'completedAt',
      sorter: (a, b) => new Date(a.completedAt || '').getTime() - new Date(b.completedAt || '').getTime(),
      render: (date) => date ? format(new Date(date), 'MMM dd, yyyy HH:mm') : '-',
    },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedCandidate(record);
            setShowDetailModal(true);
          }}
        >
          View Details
        </Button>
      ),
    },
  ];
  
  const renderDetailModal = () => {
    if (!selectedCandidate) return null;
    
    const messages = chatHistory[selectedCandidate.id] || [];
    
    return (
      <Modal
        title={
          <Space>
            <UserOutlined />
            <Text strong>{selectedCandidate.candidateInfo.name}</Text>
            <Tag color={getScoreTag(selectedCandidate.totalScore || 0).color}>
              Score: {selectedCandidate.totalScore}%
            </Tag>
          </Space>
        }
        open={showDetailModal}
        onCancel={() => {
          setShowDetailModal(false);
          setSelectedCandidate(null);
        }}
        width={900}
        footer={[
          <Button key="close" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
        ]}
      >
        {/* Candidate Info */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Space split={<Divider type="vertical" />}>
            <Space>
              <MailOutlined />
              <Text>{selectedCandidate.candidateInfo.email}</Text>
            </Space>
            <Space>
              <PhoneOutlined />
              <Text>{selectedCandidate.candidateInfo.phone}</Text>
            </Space>
            <Text type="secondary">
              Completed: {selectedCandidate.completedAt ? 
                format(new Date(selectedCandidate.completedAt), 'MMM dd, yyyy HH:mm') : '-'}
            </Text>
          </Space>
        </Card>
        
        {/* Summary */}
        {selectedCandidate.summary && (
          <Card title="Interview Summary" size="small" style={{ marginBottom: 16 }}>
            <Paragraph>{selectedCandidate.summary}</Paragraph>
          </Card>
        )}
        
        {/* Questions and Answers */}
        <Card title="Interview Details" size="small" style={{ marginBottom: 16 }}>
          <List
            dataSource={selectedCandidate.questions}
            renderItem={(question, index) => {
              const answer = selectedCandidate.answers.find(a => a.questionId === question.id);
              return (
                <List.Item key={question.id}>
                  <div style={{ width: '100%' }}>
                    <Space style={{ marginBottom: 8 }}>
                      <Text strong>Question {index + 1}</Text>
                      <Tag color={
                        question.difficulty === 'easy' ? 'green' :
                        question.difficulty === 'medium' ? 'orange' : 'red'
                      }>
                        {question.difficulty.toUpperCase()}
                      </Tag>
                      {answer && (
                        <>
                          <Tag color={getScoreColor((answer.score || 0) * 10)}>
                            Score: {answer.score}/10
                          </Tag>
                          <Text type="secondary">
                            Time: {answer.timeTaken}s / {question.timeLimit}s
                          </Text>
                        </>
                      )}
                    </Space>
                    
                    <Paragraph style={{ marginBottom: 8 }}>
                      <Text type="secondary">Q:</Text> {question.text}
                    </Paragraph>
                    
                    {answer && (
                      <>
                        <Paragraph style={{ marginBottom: 8 }}>
                          <Text type="secondary">A:</Text> {answer.text || 'No answer provided'}
                        </Paragraph>
                        
                        {answer.feedback && (
                          <Paragraph type="secondary" italic style={{ marginLeft: 16 }}>
                            Feedback: {answer.feedback}
                          </Paragraph>
                        )}
                      </>
                    )}
                  </div>
                </List.Item>
              );
            }}
          />
        </Card>
        
        {/* Full Chat History */}
        <Card 
          title="Complete Chat History" 
          size="small"
          bodyStyle={{ maxHeight: 400, overflow: 'auto' }}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                marginBottom: 12,
                padding: 8,
                backgroundColor:
                  message.type === 'user' ? '#e6f7ff' :
                  message.type === 'system' ? '#f6ffed' : '#f0f0f0',
                borderRadius: 4,
              }}
            >
              <Text 
                strong 
                style={{
                  color: message.type === 'user' ? '#1890ff' :
                         message.type === 'system' ? '#52c41a' : '#8c8c8c'
                }}
              >
                {message.type === 'user' ? 'Candidate' :
                 message.type === 'system' ? 'System' : 'Interviewer'}:
              </Text>
              <Paragraph style={{ marginBottom: 0, marginTop: 4, whiteSpace: 'pre-wrap' }}>
                {message.content}
              </Paragraph>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {format(new Date(message.timestamp), 'HH:mm:ss')}
              </Text>
            </div>
          ))}
        </Card>
      </Modal>
    );
  };
  
  return (
    <div style={{ padding: 20 }}>
      <Title level={2}>Candidate Dashboard</Title>
      
      {/* Search and Stats */}
      <Card style={{ marginBottom: 20 }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Search
            placeholder="Search by name, email, or phone"
            onSearch={setSearchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          
          <Space>
            <Card size="small" bordered={false}>
              <Text type="secondary">Total Candidates:</Text>
              <Title level={4} style={{ margin: 0 }}>{completedSessions.length}</Title>
            </Card>
            
            <Card size="small" bordered={false}>
              <Text type="secondary">Average Score:</Text>
              <Title level={4} style={{ margin: 0 }}>
                {completedSessions.length > 0
                  ? Math.round(
                      completedSessions.reduce((sum, s) => sum + (s.totalScore || 0), 0) /
                      completedSessions.length
                    )
                  : 0}%
              </Title>
            </Card>
          </Space>
        </Space>
      </Card>
      
      {/* Candidates Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredSessions}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} candidates`,
          }}
        />
      </Card>
      
      {/* Detail Modal */}
      {renderDetailModal()}
    </div>
  );
};

export default Dashboard;
