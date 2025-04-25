import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';
import Header from './Header';
import SideMenu from './SideMenu';
import { TeamOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { authService } from '../../services/apiService';

const { Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  
  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const data = await authService.getUserInfo();
      setUserInfo(data);
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const menuItems = [
    userInfo?.roleName === 'ADMIN' && {
      key: 'users',
      icon: <TeamOutlined />,
      label: <Link to="/users">Users Management</Link>,
    },
  ].filter(Boolean);

  return (
    <Layout>
      <Header />
      <Layout style={{ marginTop: 64 }}>
        <SideMenu collapsed={collapsed} onCollapse={setCollapsed} />
        <Content style={{ 
          marginLeft: collapsed ? 80 : 200,
          padding: '24px',
          minHeight: 'calc(100vh - 64px)',
          transition: 'all 0.2s',
          background: '#f0f2f5'
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout; 