import React, { useState, useEffect } from 'react';
import { Menu, Button, Layout } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined, FileTextOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  UserOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { checkAuth } from '../../services/apiService';

const { Sider } = Layout;

interface SideMenuProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

const SideMenu: React.FC<SideMenuProps> = ({ collapsed, onCollapse }) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      const isAuth = await checkAuth();
      setIsAuthenticated(isAuth);
    };
    verifyAuth();
  }, []);

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">Home</Link>,
    },
    ...(isAuthenticated ? [
      {
        key: '/profile',
        icon: <UserOutlined />,
        label: <Link to="/profile">Profile</Link>,
      },
      {
        key: '/my-job-posts',
        icon: <FileTextOutlined />,
        label: <Link to="/my-job-posts">My Job Posts</Link>,
      }
    ] : []),
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: <Link to="/settings">Settings</Link>,
    }
  ];

  return (
    <Sider 
      trigger={null} 
      collapsible 
      collapsed={collapsed}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 64,
        bottom: 0,
        transition: 'all 0.2s',
      }}
    >
      <Menu
        theme="light"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        style={{ 
          height: '100%', 
          borderRight: 0,
          background: '#ffffff',
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)'
        }}
      />
      <div style={{ position: 'absolute', bottom: 0, width: '100%', padding: '16px' }}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => onCollapse(!collapsed)}
          style={{ width: '100%', color: 'white' }}
        />
      </div>
    </Sider>
  );
};

export default SideMenu; 