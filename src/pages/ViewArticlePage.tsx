import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Image, Space, Divider, Tag, Button } from 'antd';
import { BuildOutlined, EnvironmentOutlined, ClockCircleOutlined, DollarOutlined, CalendarOutlined, TeamOutlined, AppstoreOutlined } from '@ant-design/icons';
import { jobService, authService } from '../services/apiService';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

interface Article {
  id: number;
  title: string;
  content: string;
  requirement: string;
  address: string;
  location: string;
  company: {
    name: string;
    address: string;
    location: string;
    description: string;
  };
  fromSalary: number;
  toSalary: number;
  dueDate: number;
  mainImageUrl?: string;
  workingModels: {
    name: string;
  }[];
  jobLevels: {
    name: string;
  }[];
  industries: {
    name: string;
  }[];
  skills: {
    name: string;
  }[];
}

interface UserInfo {
  roleName: string;
}

const ViewArticlePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchArticle();
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

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await jobService.getArticleById(parseInt(id!));
      const articleData = response.data;
      setArticle({
        ...articleData,
        workingModels: articleData.workingModels || [],
        jobLevels: articleData.jobLevels || [],
        industries: articleData.industries || []
      });
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!article) {
    return <div>Article not found</div>;
  }

  const handleApply = () => {
    navigate(`/apply-job/${id}`);
  };

  const isOverDue = article && dayjs.unix(article.dueDate).isBefore(dayjs().startOf('day'), 'second');
  const canApply = userInfo?.roleName === 'USER';

  return (
    <div style={{ maxWidth: '800px', margin: '24px auto', padding: '0 24px' }}>
      <Card>
        {/* Image Section */}
        <div style={{ 
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '300px',
          overflow: 'hidden'
        }}>
          <Image
            src={article.mainImageUrl || 'https://via.placeholder.com/800x300?text=Company'}
            alt={article.title}
            style={{ 
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
            preview={false}
          />
        </div>

        {/* Title Section */}
        <Title level={2} style={{ textAlign: 'center', marginBottom: '24px' }}>
          {article.title}<br></br>
          {isOverDue && <Typography.Text type="danger" style={{ fontSize: '20px' }}>Over due</Typography.Text>}
        </Title>

        {/* Company Info Section */}
        <div style={{ marginBottom: '24px' }}>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Space>
              <BuildOutlined />
              <Text strong>{article.company.name}</Text>
            </Space>
            <Space>
              <EnvironmentOutlined />
              <Text>{article.company.address}</Text>
            </Space>
            <Text>{article.company.location}</Text>
            <Space>
              <ClockCircleOutlined />
              <Text>
                {article.workingModels.map((model, index) => (
                  <span key={index}>
                    {model.name}
                    {index < article.workingModels.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </Text>
            </Space>
            <Space>
              <TeamOutlined />
              <Text>
                {article.jobLevels.map((level, index) => (
                  <span key={index}>
                    {level.name}
                    {index < article.jobLevels.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </Text>
            </Space>
            <Space>
              <AppstoreOutlined />
              <Text>
                {article.industries.map((industry, index) => (
                  <span key={index}>
                    {industry.name}
                    {index < article.industries.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </Text>
            </Space>
            <Space>
              <DollarOutlined />
              <Text>
                {article.fromSalary === null && article.toSalary === null 
                  ? 'Negotiation'
                  : article.fromSalary === null 
                    ? article.toSalary ? `$${article.toSalary}` : ''
                    : `$${article.fromSalary} - $${article.toSalary}`}
              </Text>
            </Space>
            <Space>
              <CalendarOutlined />
              <Text style={{ color: isOverDue ? 'red' : 'inherit' }}>
                Due date: {article.dueDate ? dayjs.unix(article.dueDate).format('DD/MM/YYYY') : 'Not specified'}
              </Text>
            </Space>
          </Space>
        </div>

        <Divider />

        {/* Content Section */}
        <div style={{ marginBottom: '24px' }}>
          <Title level={4}>Job Description</Title>
          <Paragraph>{article.content}</Paragraph>
        </div>

        <Divider />

        {/* Requirements Section */}
        <div style={{ marginBottom: '24px' }}>
          <Title level={4}>Requirements</Title>
          <Paragraph>{article.requirement}</Paragraph>
        </div>

        {canApply && !isOverDue && (
          <Button type="primary" block onClick={handleApply}>
            Apply Now
          </Button>
        )}
      </Card>
    </div>
  );
};

export default ViewArticlePage; 