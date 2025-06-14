import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography, Space } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from 'antd';
import { authService } from '../services/apiService';

const { Content } = Layout;
const { Title } = Typography;

interface LoginFormValues {
  username: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<string>('');
  const navigate = useNavigate();

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);
    setLoginError('');
    try {
      await authService.login(values.username, values.password);
      message.success('Login successful!');
      navigate('/');
    } catch (error: any) {
      setLoginError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Content style={{ 
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f0f2f5'
      }}>
        <Card style={{ width: 400, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Title level={2} style={{ margin: 0 }}>Login</Title>
            <Typography.Text type="secondary">
              Welcome back! Please login to your account
            </Typography.Text>
          </div>
          
          <Form
            name="login"
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="username"
              rules={[
                { required: true, message: 'Please input your username!' },
                { max: 50, message: 'Username cannot exceed 50 characters!' }
              ]}
            >
              <Input 
                prefix={<UserOutlined />}
                placeholder="Username"
                maxLength={50}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Please input your password!' },
                { max: 100, message: 'Password cannot exceed 100 characters!' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
                maxLength={100}
              />
            </Form.Item>

            {loginError && (
              <Form.Item>
                <Typography.Text type="danger">{loginError}</Typography.Text>
              </Form.Item>
            )}

            <Form.Item>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button type="primary" htmlType="submit" loading={loading} block>
                  Login
                </Button>
                <Link to="/">
                  <Button block>Homepage</Button>
                </Link>
              </Space>
            </Form.Item>

            <div style={{ textAlign: 'center' }}>
              <Space direction="vertical" size="small">
                <Link to="/forgot-password">
                  <Button type="link">Forgot password?</Button>
                </Link>
                <div>
                  Don't have an account?{' '}
                  <Button type="link" onClick={() => navigate('/register')}>
                    Register now
                  </Button>
                </div>
              </Space>
            </div>
          </Form>
        </Card>
      </Content>
    </Layout>
  );
};

export default LoginPage; 