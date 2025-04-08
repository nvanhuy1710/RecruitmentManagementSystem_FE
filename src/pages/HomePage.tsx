import React from 'react';
import { Layout, Card, Row, Col, Button, Input, Select, Typography, Space } from 'antd';
import { SearchOutlined, EnvironmentOutlined, ClockCircleOutlined, DollarOutlined } from '@ant-design/icons';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const { Content } = Layout;
const { Option } = Select;
const { Title, Text } = Typography;

const HomePage: React.FC = () => {
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
            <Col span={8}>
              <Card
                hoverable
                cover={
                  <div style={{ 
                    height: '200px', 
                    background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Text style={{ fontSize: '24px', color: 'white' }}>Tech Corp</Text>
                  </div>
                }
              >
                <Title level={4}>Frontend Developer</Title>
                <Space direction="vertical" size="small">
                  <Text><EnvironmentOutlined /> Hanoi</Text>
                  <Text><ClockCircleOutlined /> Full-time</Text>
                  <Text><DollarOutlined /> $1000 - $2000</Text>
                </Space>
                <Button type="primary" block style={{ marginTop: '20px' }}>
                  Apply Now
                </Button>
              </Card>
            </Col>
            <Col span={8}>
              <Card
                hoverable
                cover={
                  <div style={{ 
                    height: '200px', 
                    background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Text style={{ fontSize: '24px', color: 'white' }}>Software Inc</Text>
                  </div>
                }
              >
                <Title level={4}>Backend Developer</Title>
                <Space direction="vertical" size="small">
                  <Text><EnvironmentOutlined /> Ho Chi Minh City</Text>
                  <Text><ClockCircleOutlined /> Full-time</Text>
                  <Text><DollarOutlined /> $1200 - $2500</Text>
                </Space>
                <Button type="primary" block style={{ marginTop: '20px' }}>
                  Apply Now
                </Button>
              </Card>
            </Col>
            <Col span={8}>
              <Card
                hoverable
                cover={
                  <div style={{ 
                    height: '200px', 
                    background: 'linear-gradient(135deg, #722ed1 0%, #531dab 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Text style={{ fontSize: '24px', color: 'white' }}>Design Studio</Text>
                  </div>
                }
              >
                <Title level={4}>UI/UX Designer</Title>
                <Space direction="vertical" size="small">
                  <Text><EnvironmentOutlined /> Da Nang</Text>
                  <Text><ClockCircleOutlined /> Part-time</Text>
                  <Text><DollarOutlined /> $800 - $1500</Text>
                </Space>
                <Button type="primary" block style={{ marginTop: '20px' }}>
                  Apply Now
                </Button>
              </Card>
            </Col>
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