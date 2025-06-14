import React, { useEffect, useState } from 'react';
import { Card, Typography, Space, Tag, Button, message, List } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { getApplicationById, ApplicationStatus, applicantService, authService } from '../services/apiService';
import { CheckOutlined, CloseOutlined, FileOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface UserInfo {
  roleName: string;
}

interface Document {
  name: string;
  fileUrl: string;
}

const ApplicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    fetchApplication();
    fetchUserInfo();
  }, [id]);

  const fetchUserInfo = async () => {
    try {
      const data = await authService.getUserInfo();
      setUserInfo(data);
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const data = await getApplicationById(id!);
      setApplication(data);
    } catch (error) {
      console.error('Error fetching application:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      await applicantService.approveApplication(application.id);
      message.success('Application approved successfully');
      fetchApplication();
    } catch (error) {
      message.error('Failed to approve application');
    }
  };

  const handleDecline = async () => {
    try {
      await applicantService.declineApplication(application.id);
      message.success('Application declined successfully');
      fetchApplication();
    } catch (error) {
      message.error('Failed to decline application');
    }
  };

  const handleViewArticle = () => {
    if (application?.article?.id) {
      navigate(`/view-article/${application.article.id}`);
    }
  };

  const canShowActions = () => {
    return userInfo && 
           (userInfo.roleName === 'EMPLOYER' || userInfo.roleName === 'ADMIN') &&
           application?.status === ApplicationStatus.SUBMITTED;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!application) {
    return <div>Application not found</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={2}>Application Details</Title>
        
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Text strong>Article: </Text>
            <Button type="link" onClick={handleViewArticle}>
              {application.article?.title || 'N/A'}
            </Button>
          </div>

          <div>
            <Text strong>Status: </Text>
            <Tag color={
              application.status === ApplicationStatus.DECLINED ? 'red' : 
              application.status === ApplicationStatus.ACCEPTED ? 'green' : 
              'gold'
            }>
              {application.status}
            </Tag>
          </div>

          <div>
            <Text strong>Full Name: </Text>
            <Text>{application.fullName}</Text>
          </div>

          <div>
            <Text strong>Phone: </Text>
            <Text>{application.phone}</Text>
          </div>

          <div>
            <Text strong>Email: </Text>
            <Text>{application.email || `${application.fullName.toLowerCase().replace(/\s+/g, '')}@gmail.com`}</Text>
          </div>

          <div>
            <Text strong>Documents: </Text>
            <List
              dataSource={application.documents}
              renderItem={(document: Document) => (
                <List.Item>
                  <Button 
                    type="link" 
                    icon={<FileOutlined />}
                    onClick={() => window.open(document.fileUrl, '_blank')}
                  >
                    {document.name}
                  </Button>
                </List.Item>
              )}
            />
          </div>

          {canShowActions() && (
            <Space>
              <Button 
                type="primary" 
                icon={<CheckOutlined />} 
                onClick={handleApprove}
              >
                Accept
              </Button>
              <Button 
                danger 
                icon={<CloseOutlined />} 
                onClick={handleDecline}
              >
                Decline
              </Button>
            </Space>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default ApplicationDetailPage; 