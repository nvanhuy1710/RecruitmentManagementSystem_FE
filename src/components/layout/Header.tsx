import React, { useEffect, useState } from 'react';
import { Layout, Menu, Button, Space, Avatar, Dropdown } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { UserOutlined, LogoutOutlined, LoginOutlined, UserAddOutlined, DownOutlined } from '@ant-design/icons';
import { authService } from '../../services/apiService';

const { Header: AntHeader } = Layout;

interface UserInfo {
  username: string;
  email?: string;
  fullName?: string;
}

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUserInfo(null);
  };

  const userMenu = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: 'Profile'
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: 'Logout'
      }
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === 'logout') {
        handleLogout();
      } else if (key === 'profile') {
        navigate('/profile');
      }
    }
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
        {userInfo ? (
          <Dropdown menu={userMenu} placement="bottomRight">
            <Button type="text" style={{ color: 'white' }}>
              <Space>
                <Avatar size="small" icon={<UserOutlined />} />
                {userInfo.username}
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>
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