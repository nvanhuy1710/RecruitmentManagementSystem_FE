import React, { useState, useEffect } from 'react';
import { Layout, Button, Space, Dropdown, message, Avatar, Menu, Badge } from 'antd';
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
  const navigate = useNavigate();

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
            // Connect to WebSocket
            const client = connectNotificationWebSocket(user.id, () => {
              // Khi nhận thông báo mới từ WebSocket, gọi lại API lấy tất cả thông báo
              fetchNotifications();
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

    // Cleanup WebSocket connection
    return () => {
      if (stompClient) {
        stompClient.deactivate();
      }
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await authService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

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
        notifications.map((notification) => (
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
        ))
      ) : (
        <Menu.Item disabled>Chưa có thông báo nào</Menu.Item>
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
              count={notifications.filter(n => !n.viewed).length} 
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