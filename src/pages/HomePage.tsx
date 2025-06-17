import React, { useState, useEffect } from 'react';
import { Layout, Card, Row, Col, Button, Input, Select, Typography, Space, Image, Tag, message, Checkbox, Collapse, Modal } from 'antd';
import { BuildOutlined, SearchOutlined, EnvironmentOutlined, ClockCircleOutlined, DollarOutlined, DownOutlined, UpOutlined, FilterOutlined } from '@ant-design/icons';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { jobService, userService } from '../services/apiService';
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

interface Skill {
  id: number;
  name: string;
}

interface Company {
  id: number;
  name: string;
  description: string;
  address: string;
}

interface WorkingModel {
  id: number;
  name: string;
}

interface Article {
  id: number;
  title: string;
  location: string;
  workingModels: {
    id: number;
    name: string;
  }[];
  company: {
    name: string;
    address: string;
    location: string;
  };
  fromSalary: number;
  toSalary: number;
  mainImageUrl?: string;
}

const HomePage: React.FC = () => {
  const [jobLevels, setJobLevels] = useState<JobLevel[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [workingModels, setWorkingModels] = useState<WorkingModel[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchParams, setSearchParams] = useState({
    title: '',
    skillIds: [] as number[],
    industryIds: [] as number[],
    companyIds: [] as number[],
    sortByRelated: false,
    jobLevelIds: [] as number[],
    workingModelIds: [] as number[],
    fromSalary: undefined as number | undefined,
    toSalary: undefined as number | undefined
  });
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFilters();
    fetchArticles();
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const userInfo = localStorage.getItem('userInfo');
      setIsLoggedIn(!!userInfo);
    } catch (error) {
      setIsLoggedIn(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const [skillsResponse, industriesResponse, companiesResponse, jobLevelsResponse, workingModelsResponse] = await Promise.all([
        jobService.getSkills(),
        jobService.getIndustries(),
        jobService.getCompanies(),
        jobService.getJobLevels(),
        jobService.getWorkingModels()
      ]);
      setSkills(skillsResponse || []);
      setIndustries(industriesResponse || []);
      setCompanies(companiesResponse || []);
      setJobLevels(jobLevelsResponse || []);
      setWorkingModels(workingModelsResponse || []);
    } catch (error) {
      message.error('Failed to fetch filters');
      setSkills([]);
      setIndustries([]);
      setCompanies([]);
      setJobLevels([]);
      setWorkingModels([]);
    }
  };

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (searchParams.title) {
        params['title.contains'] = searchParams.title;
      }
      if (searchParams.skillIds.length > 0) {
        params['skillId.in'] = searchParams.skillIds.join(',');
      }
      if (searchParams.industryIds.length > 0) {
        params['industryId.in'] = searchParams.industryIds.join(',');
      }
      if (searchParams.companyIds.length > 0) {
        params['companyId.in'] = searchParams.companyIds.join(',');
      }
      if (searchParams.jobLevelIds.length > 0) {
        params['jobLevelId.in'] = searchParams.jobLevelIds.join(',');
      }
      if (searchParams.workingModelIds.length > 0) {
        params['workingModelId.in'] = searchParams.workingModelIds.join(',');
      }
      if (searchParams.fromSalary) {
        params['salary.greaterThanOrEqual'] = searchParams.fromSalary;
      }
      if (searchParams.toSalary) {
        params['salary.lessThanOrEqual'] = searchParams.toSalary;
      }
      if (searchParams.sortByRelated) {
        params['sortByRelated'] = true;
      }

      const response = await jobService.getPublicArticles(params);
      setArticles(response.data || []);
    } catch (error) {
      message.error('Failed to fetch articles');
      setArticles([]);
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
          <div style={{ maxWidth: '1000px', margin: '40px auto' }}>
            <Card>
              <Row gutter={[16, 16]} align="middle">
                <Col flex="280px">
                  <Input
                    placeholder="Search by title"
                    value={searchParams.title}
                    onChange={(e) => setSearchParams({ ...searchParams, title: e.target.value })}
                    allowClear
                  />
                </Col>
                <Col flex="160px">
                  <Select
                    style={{ width: '100%' }}
                    placeholder="Select Skill"
                    allowClear
                    value={searchParams.skillIds}
                    onChange={(value) => setSearchParams({ ...searchParams, skillIds: value })}
                  >
                    {skills.map(skill => (
                      <Select.Option key={skill.id} value={skill.id}>
                        {skill.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Col>
                <Col flex="160px">
                  <Select
                    style={{ width: '100%' }}
                    placeholder="Select Industry"
                    allowClear
                    value={searchParams.industryIds}
                    onChange={(value) => setSearchParams({ ...searchParams, industryIds: value })}
                  >
                    {industries.map(industry => (
                      <Select.Option key={industry.id} value={industry.id}>
                        {industry.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Col>
                <Col flex="160px">
                  <Select
                    style={{ width: '100%' }}
                    placeholder="Select Company"
                    allowClear
                    value={searchParams.companyIds}
                    onChange={(value) => setSearchParams({ ...searchParams, companyIds: value })}
                  >
                    {companies.map(company => (
                      <Select.Option key={company.id} value={company.id}>
                        {company.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Col>
                <Col flex="100px">
                  <Space>
                  <Button 
                    type="primary" 
                    icon={<SearchOutlined />} 
                    onClick={handleSearch}
                    loading={loading}
                  >
                    Search
                  </Button>
                    <Button 
                      icon={<FilterOutlined />}
                      onClick={() => setIsFilterModalVisible(true)}
                    >
                      Filter
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>
          </div>
        </div>

        <Modal
          title="Filter Options"
          open={isFilterModalVisible}
          onOk={() => {
            setIsFilterModalVisible(false);
            handleSearch();
          }}
          onCancel={() => setIsFilterModalVisible(false)}
          width={600}
          footer={[
            <Button 
              key="clear" 
              onClick={() => {
                setSearchParams({
                  title: '',
                  skillIds: [],
                  industryIds: [],
                  companyIds: [],
                  sortByRelated: false,
                  jobLevelIds: [],
                  workingModelIds: [],
                  fromSalary: undefined,
                  toSalary: undefined
                });
              }}
            >
              Clear Filters
            </Button>,
            <Button key="cancel" onClick={() => setIsFilterModalVisible(false)}>
              Cancel
            </Button>,
            <Button 
              key="submit" 
              type="primary" 
              onClick={() => {
                setIsFilterModalVisible(false);
                handleSearch();
              }}
            >
              Apply Filters
            </Button>
          ]}
        >
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Input
                placeholder="Search by title"
                value={searchParams.title}
                onChange={(e) => setSearchParams({ ...searchParams, title: e.target.value })}
                allowClear
              />
            </Col>
            <Col span={24}>
              <Select
                mode="multiple"
                style={{ width: '100%' }}
                placeholder="Select Skills"
                allowClear
                value={searchParams.skillIds}
                onChange={(value) => setSearchParams({ ...searchParams, skillIds: value })}
              >
                {skills.map(skill => (
                  <Select.Option key={skill.id} value={skill.id}>
                    {skill.name}
                  </Select.Option>
                ))}
              </Select>
            </Col>
            <Col span={24}>
              <Select
                mode="multiple"
                style={{ width: '100%' }}
                placeholder="Select Industries"
                allowClear
                value={searchParams.industryIds}
                onChange={(value) => setSearchParams({ ...searchParams, industryIds: value })}
              >
                {industries.map(industry => (
                  <Select.Option key={industry.id} value={industry.id}>
                    {industry.name}
                  </Select.Option>
                ))}
              </Select>
            </Col>
            <Col span={24}>
              <Select
                mode="multiple"
                style={{ width: '100%' }}
                placeholder="Select Companies"
                allowClear
                value={searchParams.companyIds}
                onChange={(value) => setSearchParams({ ...searchParams, companyIds: value })}
              >
                {companies.map(company => (
                  <Select.Option key={company.id} value={company.id}>
                    {company.name}
                  </Select.Option>
                ))}
              </Select>
            </Col>
            <Col span={24}>
              <Select
                mode="multiple"
                style={{ width: '100%' }}
                placeholder="Select Job Levels"
                allowClear
                value={searchParams.jobLevelIds}
                onChange={(value) => setSearchParams({ ...searchParams, jobLevelIds: value })}
              >
                {jobLevels.map(level => (
                  <Select.Option key={level.id} value={level.id}>
                    {level.name}
                  </Select.Option>
                ))}
              </Select>
            </Col>
            <Col span={24}>
              <Select
                mode="multiple"
                style={{ width: '100%' }}
                placeholder="Select Working Models"
                allowClear
                value={searchParams.workingModelIds}
                onChange={(value) => setSearchParams({ ...searchParams, workingModelIds: value })}
              >
                {workingModels.map(model => (
                  <Select.Option key={model.id} value={model.id}>
                    {model.name}
                  </Select.Option>
                ))}
              </Select>
            </Col>
            <Col span={24}>
              <Space style={{ width: '100%' }}>
                <Input
                  type="number"
                  placeholder="Min Salary"
                  value={searchParams.fromSalary}
                  onChange={(e) => setSearchParams({ ...searchParams, fromSalary: e.target.value ? Number(e.target.value) : undefined })}
                  style={{ width: '60%' }}
                />
                <span>-</span>
                <Input
                  type="number"
                  placeholder="Max Salary"
                  value={searchParams.toSalary}
                  onChange={(e) => setSearchParams({ ...searchParams, toSalary: e.target.value ? Number(e.target.value) : undefined })}
                  style={{ width: '60%' }}
                />
              </Space>
            </Col>
            {isLoggedIn && (
              <Col span={24}>
                <Checkbox
                  checked={searchParams.sortByRelated}
                  onChange={(e) => setSearchParams({ ...searchParams, sortByRelated: e.target.checked })}
                >
                  Sort by related
                </Checkbox>
              </Col>
            )}
          </Row>
        </Modal>

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
                        <Text strong >{article.company.name}</Text>
                        <br />
                        <Space>
                          <EnvironmentOutlined />
                          <Text type="secondary">{article.company.address}</Text>
                        </Space>
                        <br />
                        <Space>
                          <ClockCircleOutlined />
                          <Text>
                            {article.workingModels?.map((model, index) => (
                              <span key={model.id}>
                                {model.name}
                                {index < (article.workingModels?.length || 0) - 1 ? ', ' : ''}
                              </span>
                            )) || 'Not specified'}
                          </Text>
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