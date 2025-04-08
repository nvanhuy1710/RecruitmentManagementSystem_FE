import React, { useState } from 'react';
import { Layout } from 'antd';
import Header from './Header';
import SideMenu from './SideMenu';

const { Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

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