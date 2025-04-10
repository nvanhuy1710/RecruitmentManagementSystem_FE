import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Image, Space, Divider, Tag, Button } from 'antd';
import { BuildOutlined, EnvironmentOutlined, ClockCircleOutlined, DollarOutlined, CalendarOutlined, TeamOutlined, AppstoreOutlined } from '@ant-design/icons';
import { jobService } from '../services/apiService';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

interface Article {
  id: number;
  title: string;
  content: string;
  requirement: string;
  address: string;
  location: string;
  company: string;
  fromSalary: number;
  toSalary: number;
  dueDate: number;
  mainImageUrl?: string;
  workingModel: {
    name: string;
  };
  jobLevel: {
    name: string;
  };
  industry: {
    name: string;
  };
}

const ViewArticlePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await jobService.getArticleById(parseInt(id!));
      setArticle(response.data);
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
          {article.title}
        </Title>

        {/* Company Info Section */}
        <div style={{ marginBottom: '24px' }}>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Space>
              <BuildOutlined />
              <Text strong>{article.company}</Text>
            </Space>
            <Space>
              <EnvironmentOutlined />
              <Text>{article.address}</Text>
            </Space>
            <Text>{article.location}</Text>
            <Space>
              <ClockCircleOutlined />
              <Text>{article.workingModel.name}</Text>
            </Space>
            <Space>
              <TeamOutlined />
              <Text>{article.jobLevel.name}</Text>
            </Space>
            <Space>
              <AppstoreOutlined />
              <Text>{article.industry.name}</Text>
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
              <Text>Due date: {article.dueDate ? dayjs.unix(article.dueDate).format('DD/MM/YYYY') : 'Not specified'}</Text>
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

        <Button type="primary" block onClick={handleApply}>
          Apply Now
        </Button>
      </Card>
    </div>
  );
};

export default ViewArticlePage; 