import React, { useEffect, useState } from 'react';
import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  FileAddOutlined,
  ProfileOutlined,
  AuditOutlined,
  TeamOutlined,
  UserOutlined,
  FileSearchOutlined,
  BankOutlined,
  BuildOutlined
} from '@ant-design/icons';
import { authService } from '../../services/apiService';
import type { MenuProps } from 'antd';

const { Sider } = Layout;

interface SideMenuProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

const SideMenu: React.FC<SideMenuProps> = ({ collapsed, onCollapse }) => {
  const location = useLocation();
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

  const baseMenuItems = !userInfo || userInfo?.roleName === 'USER' ? [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">Home</Link>,
    },
    {
      key: '/companies',
      icon: <BuildOutlined />,
      label: <Link to="/view-companies">Companies</Link>,
      roles: ['USER'],
    }
  ] : [];

  const profileMenuItem = userInfo ? [
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: <Link to="/profile">Profile</Link>,
    }
  ] : [];

  const userMenuItems = userInfo?.roleName === 'USER' ? [
    {
      key: '/my-applications',
      icon: <ProfileOutlined />,
      label: <Link to="/my-applications">My Applications</Link>,
      roles: ['USER'],
    }
  ] : [];

  const employerMenuItems = userInfo?.roleName === 'EMPLOYER' ? [
    {
      key: '/dashboard',
      icon: <HomeOutlined />,
      label: <Link to="/dashboard">Dashboard</Link>,
    },
    {
      key: '/my-job-posts',
      icon: <ProfileOutlined />,
      label: <Link to="/my-job-posts">My Articles</Link>,
    },
    {
      key: '/applicants',
      icon: <FileSearchOutlined />,
      label: <Link to="/applicants">Applicants</Link>,
    }
  ] : [];

  const adminMenuItems = userInfo?.roleName === 'ADMIN' ? [
    {
      key: '/review-article',
      icon: <FileSearchOutlined />,
      label: <Link to="/review-articles">Review Article</Link>,
      roles: ['ADMIN'],
    },
    {
      key: '/users',
      icon: <TeamOutlined />,
      label: <Link to="/users">Users Management</Link>,
      roles: ['ADMIN'],
    },
    {
      key: '/companies',
      icon: <BankOutlined />,
      label: <Link to="/companies">Companies</Link>,
      roles: ['ADMIN'],
    }
  ] : [];

  const menuItems: MenuProps['items'] = [
    ...baseMenuItems,
    ...profileMenuItem,
    ...userMenuItems,
    ...employerMenuItems,
    ...adminMenuItems
  ];

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      style={{
        overflow: 'auto',
        height: 'calc(100vh - 56px)',
        position: 'fixed',
        left: 0,
        top: 56,
        bottom: 0,
        background: '#ffffff',
        boxShadow: '2px 0 8px rgba(0,0,0,0.1)'
      }}
      theme="light"
    >
      <Menu
        theme="light"
        selectedKeys={[location.pathname]}
        mode="inline"
        items={menuItems}
        style={{
          borderRight: 'none'
        }}
      />
    </Sider>
  );
};

export default SideMenu; 