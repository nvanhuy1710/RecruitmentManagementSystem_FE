import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Typography, Layout, DatePicker, Select, Upload } from 'antd';
import { UserOutlined, UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { UploadFile } from 'antd/es/upload/interface';
import dayjs from 'dayjs';
import Header from '../components/layout/Header';
import { authService } from '../services/apiService';

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

interface UserProfile {
  email: string;
  fullName: string;
  username: string;
  gender: boolean;
  birth: string;
  avatarUrl?: string;
}

const ProfilePage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [avatarFile, setAvatarFile] = useState<UploadFile | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const userInfo = await authService.getUserInfo();
      setUserProfile(userInfo);
      form.setFieldsValue({
        ...userInfo,
        birth: userInfo.birth ? dayjs(userInfo.birth) : null,
        gender: userInfo.gender ? 'true' : 'false'
      });
    } catch (error) {
      message.error('Failed to fetch user profile');
      navigate('/login');
    }
  };

  const handleUpdateAvatar = async (file: File) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('avatar', file);
      await authService.updateAvatar(formData);
      message.success('Avatar updated successfully');
      fetchUserProfile();
    } catch (error) {
      message.error('Failed to update avatar');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const updateData = {
        ...values,
        gender: values.gender === 'true',
        birth: values.birth.format('YYYY-MM-DDTHH:mm:ss[Z]')
      };
      await authService.updateUserInfo(updateData);
      message.success('Profile updated successfully');
      fetchUserProfile(); // Refresh profile data
    } catch (error) {
      message.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    beforeUpload: (file: File) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('Image must be smaller than 2MB!');
        return false;
      }
      handleUpdateAvatar(file);
      return false;
    },
    maxCount: 1,
    showUploadList: false,
  };

  return (
    <Layout>
      <Header />
      <Content style={{ 
        minHeight: '100vh',
        padding: '24px',
        background: '#f0f2f5'
      }}>
        <Card style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '24px' }}>Profile</Title>
          
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ marginBottom: '16px' }}>
              {userProfile?.avatarUrl ? (
                <img
                  src={userProfile.avatarUrl}
                  alt="Avatar"
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <UserOutlined
                  style={{
                    fontSize: '64px',
                    padding: '18px',
                    borderRadius: '50%',
                    backgroundColor: '#f0f0f0'
                  }}
                />
              )}
            </div>
            
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />} loading={loading}>
                Update Avatar
              </Button>
            </Upload>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              gender: 'true'
            }}
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="username"
              label="Username"
              rules={[{ required: true, message: 'Please input your username!' }]}
            >
              <Input disabled />
            </Form.Item>

            <Form.Item
              name="fullName"
              label="Full Name"
              rules={[{ required: true, message: 'Please input your full name!' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="gender"
              label="Gender"
              rules={[{ required: true, message: 'Please select your gender!' }]}
            >
              <Select>
                <Option value="true">Male</Option>
                <Option value="false">Female</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="birth"
              label="Birth Date"
              rules={[{ required: true, message: 'Please select your birth date!' }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                Update Profile
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Content>
    </Layout>
  );
};

export default ProfilePage; 