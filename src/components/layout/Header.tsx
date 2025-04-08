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
    <AntHeader style={{ padding: '0 50px', display: 'flex', justifyContent: 'space-between' }}>
      <div className="logo">
        <Link to="/">Recruitment System</Link>
      </div>
      <Space>
        {userInfo ? (
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
                  {userInfo.username}
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