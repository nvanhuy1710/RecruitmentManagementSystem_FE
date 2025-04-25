import React, { useState, useEffect } from 'react';
import { Layout, Card, Row, Col, Button, Input, Select, Typography, Space, Image, Tag, message } from 'antd';
import { BuildOutlined, SearchOutlined, EnvironmentOutlined, ClockCircleOutlined, DollarOutlined } from '@ant-design/icons';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { jobService } from '../services/apiService';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const { Content } = Layout;
const { Option } = Select;
const { Title, Text } = Typography;

interface JobLevel {
  id: number;
  name: string;
}

interface Industry {
  id: number;
  name: string;
}

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
  address: string;
}

const HomePage: React.FC = () => {
  const [jobLevels, setJobLevels] = useState<JobLevel[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    title: '',
    jobLevelId: undefined as number | undefined,
    industryId: undefined as number | undefined
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchFilters();
    fetchArticles();
  }, []);

  const fetchFilters = async () => {
    try {
      const [jobLevelsResponse, industriesResponse] = await Promise.all([
        jobService.getJobLevels(),
        jobService.getIndustries()
      ]);
      setJobLevels(jobLevelsResponse);
      setIndustries(industriesResponse);
    } catch (error) {
      message.error('Failed to fetch filters');
    }
  };

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (searchParams.title) {
        params['title.contains'] = searchParams.title;
      }
      if (searchParams.jobLevelId) {
        params['jobLevelId.equals'] = searchParams.jobLevelId;
      }
      if (searchParams.industryId) {
        params['industryId.equals'] = searchParams.industryId;
      }

      const response = await jobService.getPublicArticles(params);
      setArticles(response.data);
    } catch (error) {
      message.error('Failed to fetch articles');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchArticles();
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
                <Col xs={24} sm={24} md={8}>
                  <Input
                    placeholder="Search by title"
                    value={searchParams.title}
                    onChange={(e) => setSearchParams({ ...searchParams, title: e.target.value })}
                    allowClear
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="Select Job Level"
                    allowClear
                    value={searchParams.jobLevelId}
                    onChange={(value) => setSearchParams({ ...searchParams, jobLevelId: value })}
                  >
                    {jobLevels.map(level => (
                      <Select.Option key={level.id} value={level.id}>
                        {level.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="Select Industry"
                    allowClear
                    value={searchParams.industryId}
                    onChange={(value) => setSearchParams({ ...searchParams, industryId: value })}
                  >
                    {industries.map(industry => (
                      <Select.Option key={industry.id} value={industry.id}>
                        {industry.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Col>
                <Col xs={24} sm={24} md={4}>
                  <Button 
                    type="primary" 
                    icon={<SearchOutlined />} 
                    onClick={handleSearch}
                    loading={loading}
                    style={{ width: '100%' }}
                  >
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