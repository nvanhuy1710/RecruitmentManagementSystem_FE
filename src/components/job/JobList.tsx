import React from 'react';
import { List, Card, Tag, Button, Input, Select, Row, Col } from 'antd';
import { SearchOutlined, EnvironmentOutlined, DollarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Search } = Input;
const { Option } = Select;

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  tags: string[];
  postedDate: string;
}

const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Frontend Developer',
    company: 'Tech Corp',
    location: 'Hà Nội',
    salary: '15-20 triệu',
    type: 'Full-time',
    tags: ['React', 'TypeScript', 'Ant Design'],
    postedDate: '2024-03-20'
  },
  // Add more mock jobs here
];

const JobList: React.FC = () => {
  const navigate = useNavigate();
  const [jobs] = React.useState<Job[]>(mockJobs);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Tìm kiếm việc làm..."
              size="large"
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Địa điểm"
              style={{ width: '100%' }}
              size="large"
            >
              <Option value="hanoi">Hà Nội</Option>
              <Option value="hcm">TP. Hồ Chí Minh</Option>
              <Option value="danang">Đà Nẵng</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Loại công việc"
              style={{ width: '100%' }}
              size="large"
            >
              <Option value="fulltime">Full-time</Option>
              <Option value="parttime">Part-time</Option>
              <Option value="remote">Remote</Option>
            </Select>
          </Col>
        </Row>
      </div>

      <List
        grid={{
          gutter: 16,
          xs: 1,
          sm: 1,
          md: 2,
          lg: 2,
          xl: 3,
          xxl: 3,
        }}
        dataSource={jobs}
        renderItem={(job) => (
          <List.Item>
            <Card
              hoverable
              onClick={() => navigate(`/jobs/${job.id}`)}
            >
              <h3>{job.title}</h3>
              <p style={{ fontSize: '16px', color: '#1890ff' }}>{job.company}</p>
              
              <p>
                <EnvironmentOutlined /> {job.location}
                <span style={{ margin: '0 8px' }}>•</span>
                <DollarOutlined /> {job.salary}
              </p>

              <div style={{ marginTop: '12px' }}>
                <Tag color="blue">{job.type}</Tag>
                {job.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>

              <div style={{ marginTop: '12px', textAlign: 'right' }}>
                <Button type="primary">Xem chi tiết</Button>
              </div>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default JobList; 