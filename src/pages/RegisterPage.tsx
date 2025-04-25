import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography, DatePicker, Select, Layout, Radio } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, UserAddOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { authService } from '../services/apiService';

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

interface RegisterFormValues {
  email: string;
  fullName: string;
  username: string;
  password: string;
  confirmPassword: string;
  gender: 'male' | 'female' | 'other';
  birth: dayjs.Dayjs;
}

const RegisterPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: RegisterFormValues) => {
    try {
      setLoading(true);
      const { confirmPassword, ...registerData } = values;
      
      const userData = {
        ...registerData,
        gender: values.gender === 'male' ? 'true' : 'false',
        birth: dayjs(values.birth).format('YYYY-MM-DD[T]00:00:00[Z]')
      };

      await authService.register(userData);
      message.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Registration failed');
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
        background: '#f0f2f5',
        padding: '20px'
      }}>
        <Card style={{ width: 500, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Title level={2} style={{ margin: 0 }}>Register</Title>
            <Typography.Text type="secondary">
              Create your account to get started
            </Typography.Text>
          </div>
          
          <Form
            name="register"
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input 
                prefix={<MailOutlined />}
                placeholder="Email"
              />
            </Form.Item>

            <Form.Item
              name="fullName"
              rules={[{ required: true, message: 'Please input your full name!' }]}
            >
              <Input 
                prefix={<UserAddOutlined />}
                placeholder="Full Name"
              />
            </Form.Item>

            <Form.Item
              name="username"
              rules={[
                { required: true, message: 'Please input your username!' },
                { min: 2, message: 'Username must be at least 2 characters!' }
              ]}
            >
              <Input 
                prefix={<UserOutlined />}
                placeholder="Username"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Please input your password!' },
                { min: 6, message: 'Password must be at least 6 characters!' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Please confirm your password!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('The two passwords do not match!'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm Password"
              />
            </Form.Item>

            <Form.Item
              name="gender"
              rules={[{ required: true, message: 'Please select your gender!' }]}
            >
              <Radio.Group>
                <Radio value="male">Male</Radio>
                <Radio value="female">Female</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              name="birth"
              rules={[{ required: true, message: 'Please select your birth date!' }]}
            >
              <DatePicker 
                style={{ width: '100%' }}
                placeholder="Birth Date"
                format="DD/MM/YYYY"
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                Register
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center' }}>
              Already have an account?{' '}
              <Button type="link" onClick={() => navigate('/login')}>
                Login now
              </Button>
            </div>
          </Form>
        </Card>
      </Content>
    </Layout>
  );
};

export default RegisterPage;
