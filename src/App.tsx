import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ConfigProvider, Tabs, Layout, Typography, Spin } from 'antd';
import { UserOutlined, TeamOutlined } from '@ant-design/icons';
import { store, persistor } from './store';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { setActiveTab, setShowWelcomeBackModal } from './store/slices/uiSlice';
import ChatInterface from './components/IntervieweeTab/ChatInterface';
import Dashboard from './components/InterviewerTab/Dashboard';
import WelcomeBackModal from './components/WelcomeBackModal';
import './App.css';

const { Header, Content } = Layout;
const { Title } = Typography;

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector(state => state.ui.activeTab);
  const sessions = useAppSelector(state => state.session.sessions);
  
  // Check for unfinished sessions on mount
  useEffect(() => {
    const unfinishedSessions = sessions.filter(
      session => session.status === 'paused' || 
                 session.status === 'in_progress' ||
                 session.status === 'collecting_info'
    );
    
    if (unfinishedSessions.length > 0) {
      dispatch(setShowWelcomeBackModal(true));
    }
  }, []);
  
  const tabItems = [
    {
      key: 'interviewee',
      label: (
        <span>
          <UserOutlined />
          Interviewee
        </span>
      ),
      children: <ChatInterface />,
    },
    {
      key: 'interviewer',
      label: (
        <span>
          <TeamOutlined />
          Interviewer
        </span>
      ),
      children: <Dashboard />,
    },
  ];
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        background: '#fff', 
        padding: '0 20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center'
      }}>
        <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
          🤖 AI Interview Assistant
        </Title>
      </Header>
      
      <Content style={{ padding: '24px', background: '#f0f2f5' }}>
        <div style={{ 
          background: '#fff', 
          minHeight: 'calc(100vh - 112px)',
          borderRadius: 8,
          overflow: 'hidden'
        }}>
          <Tabs
            activeKey={activeTab}
            onChange={(key) => dispatch(setActiveTab(key as 'interviewee' | 'interviewer'))}
            items={tabItems}
            size="large"
            style={{ height: '100%' }}
            tabBarStyle={{ paddingLeft: 20, paddingRight: 20 }}
          />
        </div>
      </Content>
      
      <WelcomeBackModal />
    </Layout>
  );
};

function App() {
  return (
    <Provider store={store}>
      <PersistGate 
        loading={
          <div style={{ 
            height: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <Spin size="large" tip="Loading..." />
          </div>
        } 
        persistor={persistor}
      >
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: '#1890ff',
              borderRadius: 6,
            },
          }}
        >
          <AppContent />
        </ConfigProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;