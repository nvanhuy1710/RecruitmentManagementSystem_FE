import React, { useState, useEffect } from 'react';
import { Layout, Card, Row, Col, Button, Input, Select, Typography, Space, Image, Tag } from 'antd';
import { BuildOutlined, SearchOutlined, EnvironmentOutlined, ClockCircleOutlined, DollarOutlined } from '@ant-design/icons';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { jobService } from '../services/apiService';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const { Content } = Layout;
const { Option } = Select;
const { Title, Text } = Typography;

interface Article {
  id: number;
  title: string;
  location: string;
  workingModel: {
    name: string;
  };
  fromSalary: number;
  toSalary: number;
  mainImageUrl?: string;
  company: string;
}

const HomePage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await jobService.getPublicArticles();
      setArticles(response.data);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (id: number) => {
    navigate(`/view-article/${id}`);
  };

  return (
    <Layout>
      {/* <Header /> */}
      <Content>
        {/* Hero Section */}
        <div style={{ 
          background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
          padding: '60px 50px',
          color: 'white',
          textAlign: 'center'
        }}>
          <Title level={1} style={{ color: 'white', marginBottom: '20px' }}>
            Find Your Dream Job Today
          </Title>
          <Text style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)' }}>
            Discover thousands of job opportunities with all the information you need
          </Text>
          <div style={{ maxWidth: '800px', margin: '40px auto' }}>
            <Card>
              <Row gutter={[16, 16]}>
                <Col span={10}>
                  <Input
                    size="large"
                    placeholder="Job title, keywords, or company"
                    prefix={<SearchOutlined />}
                  />
                </Col>
                <Col span={6}>
                  <Select
                    size="large"
                    placeholder="Location"
                    style={{ width: '100%' }}
                    suffixIcon={<EnvironmentOutlined />}
                  >
                    <Option value="all">All Locations</Option>
                    <Option value="hanoi">Hanoi</Option>
                    <Option value="hcm">Ho Chi Minh City</Option>
                    <Option value="danang">Da Nang</Option>
                  </Select>
                </Col>
                <Col span={6}>
                  <Select
                    size="large"
                    placeholder="Job Type"
                    style={{ width: '100%' }}
                    suffixIcon={<ClockCircleOutlined />}
                  >
                    <Option value="all">All Types</Option>
                    <Option value="full-time">Full-time</Option>
                    <Option value="part-time">Part-time</Option>
                    <Option value="contract">Contract</Option>
                    <Option value="internship">Internship</Option>
                  </Select>
                </Col>
                <Col span={2}>
                  <Button type="primary" size="large" block>
                    Search
                  </Button>
                </Col>
              </Row>
            </Card>
          </div>
        </div>

        {/* Featured Jobs Section */}
        <div style={{ padding: '40px 50px' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '40px' }}>
            Featured Jobs
          </Title>
          <Row gutter={[24, 24]}>
            {articles.map((article) => (
              <Col xs={24} sm={12} md={10} lg={8} key={article.id}>
                <Card
                  hoverable
                  onClick={() => handleCardClick(article.id)}
                  cover={
                    <Image
                      alt={article.title}
                      src={article.mainImageUrl || 'https://via.placeholder.com/300x200?text=Company'}
                      style={{ height: '200px', objectFit: 'cover' }}
                      preview={false}
                    />
                  }
                >
                  <Card.Meta
                    title={
                      <div style={{ textAlign: 'center' }}>
                        {article.title}
                      </div>
                    }
                    description={
                      <div>
                        <BuildOutlined />
                        <Text strong >{article.company}</Text>
                        <br />
                        <Space>
                          <EnvironmentOutlined />
                          <Text type="secondary">{article.location}</Text>
                        </Space>
                        <br />
                        <Space>
                          <ClockCircleOutlined />
                          <Text >{article.workingModel.name}</Text>
                        </Space>
                        <br />
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
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Why Choose Us Section */}
        <div style={{ padding: '40px 50px', background: '#f5f5f5' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '40px' }}>
            Why Choose Us
          </Title>
          <Row gutter={[24, 24]}>
            <Col span={8}>
              <Card hoverable>
                <Title level={4}>Verified Companies</Title>
                <Text>
                  We verify all companies to ensure you get legitimate job opportunities
                </Text>
              </Card>
            </Col>
            <Col span={8}>
              <Card hoverable>
                <Title level={4}>Easy Application</Title>
                <Text>
                  Apply to jobs with just one click and track your applications
                </Text>
              </Card>
            </Col>
            <Col span={8}>
              <Card hoverable>
                <Title level={4}>Career Support</Title>
                <Text>
                  Get career advice and support from our team of experts
                </Text>
              </Card>
            </Col>
          </Row>
        </div>
      </Content>
      <Footer />
    </Layout>
  );
};

export default HomePage; 