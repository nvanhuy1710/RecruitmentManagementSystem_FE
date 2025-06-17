import React, { useState, useEffect } from 'react';
import { Layout, Button, Space, Dropdown, message, Avatar, Menu, Badge, Pagination } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { UserOutlined, LogoutOutlined, BellOutlined, RightOutlined } from '@ant-design/icons';
import { authService, connectNotificationWebSocket } from '../../services/apiService';
import { Client } from '@stomp/stompjs';

const { Header: AntHeader } = Layout;

interface Notification {
  id: number;
  articleId: number;
  companyName: string;
  data: string;
  viewed: boolean;
}

const Header: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [unviewedCount, setUnviewedCount] = useState(0);
  const navigate = useNavigate();

  const fetchUnviewedCount = async () => {
    try {
      const count = await authService.getUnviewedNotificationCount();
      setUnviewedCount(count);
    } catch (error) {
      console.error('Error fetching unviewed count:', error);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUserInfo = localStorage.getItem('userInfo');
        if (storedUserInfo) {
          const user = JSON.parse(storedUserInfo);
          setUserInfo(user);
          setIsAuthenticated(true);
          if (user.roleName === 'USER') {
            fetchNotifications();
            fetchUnviewedCount();
            const client = connectNotificationWebSocket(user.id, () => {
              fetchNotifications();
              fetchUnviewedCount();
              message.info('New notification received');
            });
            setStompClient(client);
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      }
    };
    checkAuth();

    return () => {
      if (stompClient) {
        stompClient.deactivate();
      }
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await authService.getNotifications(currentPage, pageSize);
      console.log('Notification response:', response);
      setNotifications(response.data);
      setTotalNotifications(response.total);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setTotalNotifications(0);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page - 1);
  };

  useEffect(() => {
    if (isAuthenticated && userInfo?.roleName === 'USER') {
      fetchNotifications();
    }
  }, [currentPage]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setUserInfo(null);
      message.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      message.error('Failed to logout');
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.viewed) {
      try {
        await authService.updateNotificationViewed(notification.id);
        setNotifications(prev => 
          prev.map(n => 
            n.id === notification.id ? { ...n, viewed: true } : n
          )
        );
        fetchUnviewedCount();
      } catch (error) {
        console.error('Error updating notification viewed status:', error);
      }
    }
    navigate(`/view-article/${notification.articleId}`);
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  const notificationMenu = (
    <Menu style={{ width: 300, maxHeight: 400, overflow: 'auto' }}>
      {notifications.length > 0 ? (
        <>
          {notifications.map((notification) => (
            <Menu.Item 
              key={notification.id}
              style={{ 
                backgroundColor: notification.viewed ? 'inherit' : '#f0f7ff',
                padding: '12px 16px',
                cursor: 'pointer'
              }}
              onClick={() => handleNotificationClick(notification)}
            >
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: notification.viewed ? 'normal' : 'bold' }}>
                  {notification.companyName} company has a new job post.
                </span>
                <span style={{ 
                  fontSize: '12px', 
                  color: '#1890ff', 
                  marginLeft: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <RightOutlined style={{ marginLeft: '4px' }} />
                </span>
              </div>
            </Menu.Item>
          ))}
          {totalNotifications > pageSize && (
            <>
              <Menu.Divider />
              <div style={{ padding: '8px 16px', textAlign: 'center' }}>
                <Pagination
                  size="small"
                  current={currentPage + 1}
                  pageSize={pageSize}
                  total={totalNotifications}
                  onChange={handlePageChange}
                />
              </div>
            </>
          )}
        </>
      ) : (
        <Menu.Item disabled>No notifications</Menu.Item>
      )}
    </Menu>
  );

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
        {isAuthenticated && userInfo?.roleName === 'USER' && (
          <Dropdown overlay={notificationMenu} trigger={['click']} placement="bottomRight">
            <Badge 
              count={unviewedCount} 
              size="small"
              style={{ 
                marginRight: '10px',
                marginTop: '10px'
              }}
            >
              <Button 
                type="text" 
                icon={<BellOutlined style={{ fontSize: '20px' }} />} 
                style={{ 
                  padding: '4px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  height: '56px'
                }}
              />
            </Badge>
          </Dropdown>
        )}
        {isAuthenticated ? (
          <Space>
            <span style={{ color: '#000000', fontWeight: 'normal' }}>
              {userInfo?.username}
            </span>
            <Dropdown overlay={userMenu} trigger={['click']}>
              <Avatar 
                src={userInfo?.avatarUrl} 
                icon={<UserOutlined />}
                size="large"
                style={{ cursor: 'pointer' }}
              />
            </Dropdown>
          </Space>
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