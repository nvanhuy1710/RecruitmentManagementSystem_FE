import React from 'react';
import { Card, Button, Tag, Descriptions, Typography, Divider, message } from 'antd';
import { EnvironmentOutlined, DollarOutlined, ClockCircleOutlined, TeamOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';

const { Title, Paragraph } = Typography;

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  experience: string;
  education: string;
  description: string;
  requirements: string[];
  benefits: string[];
  tags: string[];
  postedDate: string;
}

const mockJob: Job = {
  id: '1',
  title: 'Frontend Developer',
  company: 'Tech Corp',
  location: 'Hà Nội',
  salary: '15-20 triệu',
  type: 'Full-time',
  experience: '2-3 năm',
  education: 'Đại học',
  description: 'Chúng tôi đang tìm kiếm một Frontend Developer có kinh nghiệm để tham gia vào đội ngũ phát triển sản phẩm...',
  requirements: [
    'Có kinh nghiệm với React và TypeScript',
    'Hiểu biết về RESTful APIs',
    'Có kinh nghiệm với các thư viện UI như Ant Design',
    'Kỹ năng làm việc nhóm tốt'
  ],
  benefits: [
    'Lương cạnh tranh',
    'Bảo hiểm đầy đủ',
    'Thưởng dự án',
    'Môi trường làm việc năng động'
  ],
  tags: ['React', 'TypeScript', 'Ant Design'],
  postedDate: '2024-03-20'
};

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [job] = React.useState<Job>(mockJob);

  const handleApply = () => {
    // TODO: Implement job application logic
    message.success('Ứng tuyển thành công!');
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Title level={2}>{job.title}</Title>
            <Title level={4} style={{ color: '#1890ff' }}>{job.company}</Title>
          </div>
          <Button type="primary" size="large" onClick={handleApply}>
            Ứng tuyển ngay
          </Button>
        </div>

        <Divider />

        <Descriptions column={2}>
          <Descriptions.Item label={<><EnvironmentOutlined /> Địa điểm</>}>
            {job.location}
          </Descriptions.Item>
          <Descriptions.Item label={<><DollarOutlined /> Mức lương</>}>
            {job.salary}
          </Descriptions.Item>
          <Descriptions.Item label={<><ClockCircleOutlined /> Kinh nghiệm</>}>
            {job.experience}
          </Descriptions.Item>
          <Descriptions.Item label={<><TeamOutlined /> Học vấn</>}>
            {job.education}
          </Descriptions.Item>
        </Descriptions>

        <div style={{ marginTop: '16px' }}>
          <Tag color="blue">{job.type}</Tag>
          {job.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>

        <Divider />

        <div>
          <Title level={4}>Mô tả công việc</Title>
          <Paragraph>{job.description}</Paragraph>
        </div>

        <div style={{ marginTop: '24px' }}>
          <Title level={4}>Yêu cầu</Title>
          <ul>
            {job.requirements.map((req, index) => (
              <li key={index}>{req}</li>
            ))}
          </ul>
        </div>

        <div style={{ marginTop: '24px' }}>
          <Title level={4}>Quyền lợi</Title>
          <ul>
            {job.benefits.map((benefit, index) => (
              <li key={index}>{benefit}</li>
            ))}
          </ul>
        </div>

        <Divider />

        <div style={{ textAlign: 'center' }}>
          <Button type="primary" size="large" onClick={handleApply}>
            Ứng tuyển ngay
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default JobDetail; 