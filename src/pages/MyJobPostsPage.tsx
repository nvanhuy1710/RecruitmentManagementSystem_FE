import React, { useState, useEffect } from 'react';
import { Table, Button, Typography, Space, message, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { jobService } from '../services/apiService';
import MainLayout from '../components/layout/MainLayout';

const { Title } = Typography;

interface Article {
  id: number;
  title: string;
  content: string;
  requirement: string;
  address: string;
  location: string;
  companyWebsiteUrl: string;
  company: string;
  fromSalary: number;
  toSalary: number;
  dueDate: string;
  mainImageUrl?: string;
  status: string;
  createdAt: string;
}

const MyJobPostsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<Article[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchArticles();
  }, [currentPage, pageSize]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await jobService.getMyArticles(currentPage - 1, pageSize);
      setArticles(response.data);
      setTotal(parseInt(response.headers['x-total-count'] || '0'));
    } catch (error: any) {
      console.error('Error fetching articles:', error);
      message.error('Failed to fetch articles');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: '20%',
      align: 'center' as const,
      render: (text: string, record: Article) => (
        <Link to={`/job-post/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: 'Company',
      dataIndex: 'company',
      key: 'company',
      width: '15%',
      align: 'center' as const,
    },
    {
      title: 'Salary',
      key: 'salary',
      width: '15%',
      align: 'center' as const,
      render: (_: any, record: Article) => (
        record.fromSalary === null && record.toSalary === null 
          ? 'Negotiation'
          : record.fromSalary === null 
            ? record.toSalary ? `$${record.toSalary}` : ''
            : `$${record.fromSalary} - $${record.toSalary}`
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: '10%',
      align: 'center' as const,
      render: (status: string) => (
        <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: '15%',
      align: 'center' as const,
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '',
    },
    {
      title: 'Action',
      key: 'action',
      width: '10%',
      align: 'center' as const,
      render: (_: any, record: Article) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleEdit(record.id)}>Edit</Button>
          {/* <Button type="link" danger onClick={() => handleDelete(record.id)}>Delete</Button> */}
        </Space>
      ),
    },
  ];

  const handleEdit = (id: number) => {
    // TODO: Implement edit functionality
    console.log('Edit article:', id);
  };

  const handleDelete = (id: number) => {
    // TODO: Implement delete functionality
    console.log('Delete article:', id);
  };

  return (
    <div >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={2}>My Job Posts</Title>
        <Button type="primary" icon={<PlusOutlined />}>
          <Link to="/job-post">Create Article</Link>
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={articles}
        rowKey="id"
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: total,
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          },
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Total ${total} items`,
        }}
        style={{
          background: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}
      />
    </div>
  );
};

export default MyJobPostsPage;