import React, { useState, useEffect } from 'react';
import { Layout, Button, Space, Dropdown, Avatar, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { UserOutlined, DownOutlined } from '@ant-design/icons';
import { checkAuth, authService } from '../../services/apiService';

const { Header: AntHeader } = Layout;

const Header: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAuth = async () => {
      const isAuth = await checkAuth();
      setIsAuthenticated(isAuth);
    };
    verifyAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('JSESSIONID');
      setIsAuthenticated(false);
      navigate('/login');
      message.success('Logged out successfully');
    } catch (error) {
      message.error('Failed to logout');
    }
  };

  const userMenu = {
    items: [
      {
        key: 'profile',
        label: <Link to="/profile">Profile</Link>,
      },
      {
        key: 'logout',
        label: 'Logout',
        onClick: handleLogout,
      },
    ],
  };

  return (
    <AntHeader style={{ 
      padding: '0 50px', 
      display: 'flex', 
      justifyContent: 'space-between',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      height: 64,
      lineHeight: '64px',
      background: '#ffffff',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    }}>
      <div className="logo">
        <Link to="/" style={{ color: '#1890ff' }}>Recruitment System</Link>
      </div>
      <Space>
        {isAuthenticated ? (
          <Dropdown menu={userMenu} placement="bottomRight">
            <Button type="text" style={{ color: '#1890ff' }}>
              <Space>
                <Avatar size="small" icon={<UserOutlined />} />
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>
        ) : (
          <>
            <Button type="link">
              <Link to="/login">Login</Link>
            </Button>
            <Button type="primary">
              <Link to="/register">Register</Link>
            </Button>
          </>
        )}
      </Space>
    </AntHeader>
  );
};

export default Header; 