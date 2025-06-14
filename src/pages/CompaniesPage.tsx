import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Button, message, Image, Space } from 'antd';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';
import { companyService, authService } from '../services/apiService';

const { Title, Text } = Typography;

interface Company {
  id: number;
  name: string;
  address: string;
  location: string;
  description: string;
  imageUrl?: string;
}

const CompaniesPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUser, setIsUser] = useState(false);
  const [followedCompanies, setFollowedCompanies] = useState<number[]>([]);

  useEffect(() => {
    fetchCompanies();
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const user = await authService.getUserInfo();
      setIsUser(user.roleName === 'USER');
      if (user.roleName === 'USER') {
        const followedCompanies = await companyService.getFollowedCompanies();
        setFollowedCompanies(followedCompanies.map((company: Company) => company.id));
      }
    } catch {
      setIsUser(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await companyService.getCompanies();
      setCompanies(response || []);
    } catch (error) {
      message.error('Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (companyId: number) => {
    try {
      if (followedCompanies.includes(companyId)) {
        await companyService.unfollowCompany(companyId);
        setFollowedCompanies(prev => prev.filter(id => id !== companyId));
        message.success('Unfollowed company successfully');
      } else {
        await companyService.followCompany(companyId);
        setFollowedCompanies(prev => [...prev, companyId]);
        message.success('Followed company successfully');
      }
    } catch (error) {
      message.error('Failed to follow/unfollow company');
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>Companies</Title>
      <Row gutter={[24, 24]}>
        {companies.map((company) => (
          <Col xs={24} sm={12} md={8} lg={6} key={company.id}>
            <Card
              hoverable
              cover={
                <div style={{ height: 200, overflow: 'hidden' }}>
                  {company.imageUrl ? (
                    <Image
                      alt={company.name}
                      src={company.imageUrl}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ 
                      width: '100%', 
                      height: '100%', 
                      background: '#f0f0f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      No Image
                    </div>
                  )}
                </div>
              }
              actions={isUser ? [
                <Button
                  type="text"
                  icon={followedCompanies.includes(company.id) ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                  onClick={() => handleFollow(company.id)}
                >
                  {followedCompanies.includes(company.id) ? 'Unfollow' : 'Follow'}
                </Button>
              ] : []}
            >
              <Card.Meta
                title={company.name}
                description={
                  <Space direction="vertical" size="small">
                    <Text type="secondary">{company.address}</Text>
                    <Text type="secondary">{company.location}</Text>
                    <Text ellipsis>{company.description}</Text>
                  </Space>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default CompaniesPage; 