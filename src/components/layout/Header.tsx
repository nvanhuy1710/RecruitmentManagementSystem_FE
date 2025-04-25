import React, { useState, useEffect } from 'react';
import { Layout, Button, Space, Dropdown, message, Avatar } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { UserOutlined } from '@ant-design/icons';
import { authService } from '../../services/apiService';

const { Header: AntHeader } = Layout;

const Header: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUserInfo = localStorage.getItem('userInfo');
        if (storedUserInfo) {
          setUserInfo(JSON.parse(storedUserInfo));
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setUserInfo(null);
      message.success('Logged out successfully');
    } catch (error) {
      message.error('Failed to logout');
    }
  };

  const menuItems = [
    {
      key: 'logout',
      label: 'Logout',
      onClick: handleLogout
    }
  ];

  return (
    <AntHeader
      style={{
        position: 'fixed',
        zIndex: 1,
        width: '100%',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#ffffff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        height: '56px',
        lineHeight: '56px'
      }}
    >
      <Link to="/" style={{ 
        color: '#1890ff', 
        fontSize: '24px', 
        fontWeight: 'bold',
        paddingLeft: '20px'
      }}>
        Job Portal
      </Link>

      <Space>
        {isAuthenticated ? (
          <Dropdown menu={{ items: menuItems }} placement="bottomRight">
            <Button type="text" style={{ color: '#1890ff' }}>
              <Space>
                <Avatar 
                  src={userInfo?.avatarUrl} 
                  icon={<UserOutlined />}
                  size="large"
                />
                <span style={{ fontSize: '16px' }}>{userInfo?.username}</span>
              </Space>
            </Button>
          </Dropdown>
        ) : (
          <Space>
            <Link to="/login">
              <Button type="text" style={{ color: '#1890ff' }}>Login</Button>
            </Link>
            <Link to="/register">
              <Button style={{ 
                background: '#1890ff', 
                color: '#fff',
                border: 'none',
                borderRadius: '4px'
              }}>
                Register
              </Button>
            </Link>
          </Space>
        )}
      </Space>
    </AntHeader>
  );
};

export default Header; 