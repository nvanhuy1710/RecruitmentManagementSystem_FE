import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography, Space } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from 'antd';
import { authService } from '../services/apiService';

const { Content } = Layout;
const { Title } = Typography;

const ForgotPasswordPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleSubmit = async (values: { username: string }) => {
    setLoading(true);
    try {
      const success = await authService.forgotPassword(values.username);
      if (success) {
        message.success('New password has been sent to your email!');
        navigate('/login');
      }
    } catch (error) {
      message.error('Username does not exist!');
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
            <Title level={2} style={{ margin: 0 }}>Forgot Password</Title>
            <Typography.Text type="secondary">
              Enter your username to reset your password
            </Typography.Text>
          </div>
          
          <Form
            form={form}
            name="forgot-password"
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Please enter your username!' }]}
            >
              <Input 
                prefix={<UserOutlined />}
                placeholder="Enter your username"
              />
            </Form.Item>

            <Form.Item>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button type="primary" htmlType="submit" loading={loading} block>
                  Send request
                </Button>
                <Link to="/login">
                  <Button block>Back to Login</Button>
                </Link>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </Content>
    </Layout>
  );
};

export default ForgotPasswordPage; 