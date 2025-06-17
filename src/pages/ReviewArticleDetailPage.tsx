import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Typography, message, Card, Space, Image, Tag, Tooltip } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { jobService } from '../services/apiService';
import dayjs from 'dayjs';

const { Title } = Typography;

interface Article {
  id: number;
  title: string;
  content: string;
  requirement: string;
  company: {
    name: string;
    address: string;
    location: string;
  };
  fromSalary: number;
  toSalary: number;
  dueDate: number;
  mainImageUrl?: string;
  status: string;
  createdAt: string;
  industries: {
    id: number;
    name: string;
  }[];
  jobLevels: {
    id: number;
    name: string;
  }[];
  workingModels: {
    id: number;
    name: string;
  }[];
  skills: {
    id: number;
    name: string;
  }[];
}

const ReviewArticleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState<Article | null>(null);
  const [approveLoading, setApproveLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchArticle();
    }
  }, [id]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await jobService.getArticleById(parseInt(id!));
      setArticle(response.data);
    } catch (error) {
      message.error('Failed to fetch article details');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setApproveLoading(true);
      await jobService.approveArticle(parseInt(id!));
      message.success('Article approved successfully');
      navigate('/review-articles');
    } catch (error) {
      message.error('Failed to approve article');
    } finally {
      setApproveLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setRejectLoading(true);
      await jobService.rejectArticle(parseInt(id!));
      message.success('Article rejected successfully');
      navigate('/review-articles');
    } catch (error) {
      message.error('Failed to reject article');
    } finally {
      setRejectLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!article) {
    return <div>Article not found</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Review Article</Title>
      </div>

      <Card>
        <div style={{ marginBottom: '24px' }}>
          {article.mainImageUrl && (
            <Image
              src={article.mainImageUrl}
              alt="Article"
              style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }}
            />
          )}
        </div>

        <Form layout="vertical">
          <Form.Item label="Title">
            <Input value={article.title} disabled />
          </Form.Item>

          <Form.Item label="Company">
            <Input value={article.company.name} disabled />
          </Form.Item>

          <Form.Item label="Address">
            <Input value={article.company.address} disabled />
          </Form.Item>

          <Form.Item label="Location">
            <Input value={article.company.location} disabled />
          </Form.Item>

          <Form.Item label="Salary">
            <Input 
              value={
                article.fromSalary === null && article.toSalary === null 
                  ? 'Negotiation'
                  : article.fromSalary === null 
                    ? article.toSalary ? `$${article.toSalary}` : ''
                    : `$${article.fromSalary} - $${article.toSalary}`
              } 
              disabled 
            />
          </Form.Item>

          <Form.Item label="Due Date">
            <Input 
              value={article.dueDate ? dayjs.unix(article.dueDate).format('DD/MM/YYYY') : ''} 
              disabled 
            />
          </Form.Item>

          <Form.Item label="Industries">
            <Input 
              value={article.industries?.map(industry => industry.name).join(', ')} 
              disabled 
            />
          </Form.Item>

          <Form.Item label="Job Levels">
            <Input 
              value={article.jobLevels?.map(level => level.name).join(', ')} 
              disabled 
            />
          </Form.Item>

          <Form.Item label="Working Models">
            <Input 
              value={article.workingModels?.map(model => model.name).join(', ')} 
              disabled 
            />
          </Form.Item>

          <Form.Item label="Job Description">
            <Input.TextArea 
              value={article.content} 
              disabled 
              autoSize={{ minRows: 4, maxRows: 8 }}
            />
          </Form.Item>

          <Form.Item label="Requirements">
            <Input.TextArea 
              value={article.requirement} 
              disabled 
              autoSize={{ minRows: 4, maxRows: 8 }}
            />
          </Form.Item>

          <Form.Item label="Status">
            <Tag color={
              article.status === 'PENDING' ? 'gold' : 
              article.status === 'APPROVED' ? 'green' : 
              'red'
            }>
              {article.status}
            </Tag>
          </Form.Item>

          <Form.Item style={{ textAlign: 'center', marginTop: '24px' }}>
            <Space size="large">
              <Tooltip title="Approve">
                <Button 
                  type="primary" 
                  icon={<CheckOutlined />} 
                  onClick={handleApprove}
                  loading={approveLoading}
                  size="large"
                />
              </Tooltip>
              <Tooltip title="Reject">
                <Button 
                  danger 
                  icon={<CloseOutlined />} 
                  onClick={handleReject}
                  loading={rejectLoading}
                  size="large"
                />
              </Tooltip>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ReviewArticleDetailPage; 