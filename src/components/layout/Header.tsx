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
    <AntHeader style={{ padding: '0 50px', display: 'flex', justifyContent: 'space-between' }}>
      <div className="logo">
        <Link to="/">Recruitment System</Link>
      </div>
      <Space>
        {isAuthenticated ? (
          <>
            <Button type="primary">
              <Link to="/job-post">Post Job</Link>
            </Button>
            <Button>
              <Link to="/my-job-posts">My Job Posts</Link>
            </Button>
            <Dropdown menu={userMenu} placement="bottomRight">
              <Button type="text" style={{ color: 'white' }}>
                <Space>
                  <Avatar size="small" icon={<UserOutlined />} />
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
          </>
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