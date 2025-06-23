import React, { useEffect, useState } from 'react';
import { Card, Typography, Space, Tag, Button, message, List, Tooltip, Descriptions } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { getApplicationById, ApplicationStatus, applicantService, authService } from '../services/apiService';
import { CheckCircleOutlined, CloseCircleOutlined, FileOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface UserInfo {
  roleName: string;
}

interface Document {
  name: string;
  fileUrl: string;
}

interface ApplicantScore {
  id: number;
  overall: number;
  structure: number;
  skill: number;
  experience: number;
  education: number;
  applicantId: number;
}

const ApplicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [scores, setScores] = useState<ApplicantScore | null>(null);
  const [scoresLoading, setScoresLoading] = useState(false);

  useEffect(() => {
    fetchApplication();
    fetchUserInfo();
  }, [id]);

  useEffect(() => {
    if (userInfo?.roleName === 'EMPLOYER' && application?.id) {
      fetchScores();
    }
  }, [userInfo, application]);

  const fetchUserInfo = async () => {
    try {
      const data = await authService.getUserInfo();
      setUserInfo(data);
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const fetchScores = async () => {
    try {
      setScoresLoading(true);
      const data = await applicantService.getApplicantScores(id!);
      setScores(data);
    } catch (error) {
      console.error('Error fetching scores:', error);
    } finally {
      setScoresLoading(false);
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
              <Tooltip title="Accept">
                <Button 
                  type="primary" 
                  icon={<CheckCircleOutlined />} 
                  onClick={handleApprove}
                />
              </Tooltip>
              <Tooltip title="Decline">
                <Button 
                  danger 
                  icon={<CloseCircleOutlined />} 
                  onClick={handleDecline}
                />
              </Tooltip>
            </Space>
          )}
        </Space>
      </Card>

      {/* Scores Card - Only for EMPLOYER */}
      {userInfo?.roleName === 'EMPLOYER' && (
        <Card 
          title="Applicant Scores" 
          style={{ marginTop: '24px' }}
          loading={scoresLoading}
        >
          {scores ? (
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Overall Score" span={2}>
                <Tag color={scores.overall >= 70 ? 'green' : scores.overall >= 30 ? 'orange' : 'red'}>
                  {scores.overall?.toFixed(2) || 'N/A'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Structure Score">
              <Tag color={scores.structure >= 70 ? 'green' : scores.structure >= 30 ? 'orange' : 'red'}>
              {scores.structure?.toFixed(2) || 'N/A'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Skill Score">
              <Tag color={scores.skill >= 70 ? 'green' : scores.skill >= 30 ? 'orange' : 'red'}>
              {scores.skill?.toFixed(2) || 'N/A'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Experience Score">
              <Tag color={scores.experience >= 70 ? 'green' : scores.experience >= 30 ? 'orange' : 'red'}>
              {scores.experience?.toFixed(2) || 'N/A'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Education Score">
              <Tag color={scores.education >= 70 ? 'green' : scores.education >= 30 ? 'orange' : 'red'}>
              {scores.education?.toFixed(2) || 'N/A'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          ) : (
            <Text type="secondary">No scores available for this applicant.</Text>
          )}
        </Card>
      )}
    </div>
  );
};

export default ApplicationDetailPage; 