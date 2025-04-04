import React from 'react';
import { Layout, Menu, Button, Space, Avatar } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { UserOutlined, LogoutOutlined, LoginOutlined, UserAddOutlined } from '@ant-design/icons';

const { Header: AntHeader } = Layout;

const Header: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = false; // TODO: Replace with actual auth state

  const handleLogout = () => {
    // TODO: Implement logout logic
    navigate('/login');
  };

  return (
    <AntHeader className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ marginRight: '24px', display: 'flex', alignItems: 'center' }}>
          <Avatar
            style={{
              backgroundColor: '#1890ff',
              marginRight: '12px'
            }}
            icon={<UserOutlined />}
          />
          <Link to="/" style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
            Job Portal
          </Link>
        </div>
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']}>
          <Menu.Item key="1">
            <Link to="/">Home</Link>
          </Menu.Item>
          <Menu.Item key="2">
            <Link to="/job-post">Post Job</Link>
          </Menu.Item>
        </Menu>
      </div>
      <Space>
        {isAuthenticated ? (
          <>
            <Button type="text" icon={<UserOutlined />} style={{ color: 'white' }}>
              Profile
            </Button>
            <Button type="text" icon={<LogoutOutlined />} style={{ color: 'white' }} onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <Button 
              type="text" 
              icon={<LoginOutlined />} 
              style={{ color: 'white' }} 
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
            <Button 
              type="primary" 
              icon={<UserAddOutlined />} 
              onClick={() => navigate('/register')}
            >
              Register
            </Button>
          </>
        )}
      </Space>
    </AntHeader>
  );
};

export default Header; 