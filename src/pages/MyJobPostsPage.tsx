import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Typography, Space, message, Tag, Modal, Input, Select, Row, Col, Card } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { jobService } from '../services/apiService';
import MainLayout from '../components/layout/MainLayout';
import dayjs from 'dayjs';
import debounce from 'lodash/debounce';

const { Title } = Typography;
const { Option } = Select;

interface Article {
  id: number;
  title: string;
  content: string;
  requirement: string;
  companyWebsiteUrl: string;
  company: {
    id: number;
    name: string;
    address: string;
    location: string;
  };
  fromSalary: number;
  toSalary: number;
  dueDate: string;
  mainImageUrl?: string;
  status: string;
  createdAt: string;
}

interface Company {
  id: number;
  name: string;
}

const MyJobPostsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<Article[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [isCloseModalVisible, setIsCloseModalVisible] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filters, setFilters] = useState({
    title: '',
    companyId: undefined as number | undefined,
    status: undefined as string | undefined
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchArticles();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [filters, currentPage, pageSize]);

  const fetchCompanies = async () => {
    try {
      const response = await jobService.getCompanies();
      setCompanies(response || []);
    } catch (error) {
      message.error('Failed to fetch companies');
    }
  };

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage - 1,
        size: pageSize,
        sort: 'id,desc'
      };

      if (filters.title) {
        params['title.contains'] = filters.title;
      }
      if (filters.companyId) {
        params['companyId.equals'] = filters.companyId;
      }
      if (filters.status) {
        params['status.equals'] = filters.status;
      }

      const response = await jobService.getMyArticles(currentPage - 1, pageSize, params);
      setArticles(response.data);
      setTotal(parseInt(response.headers['x-total-count'] || '0'));
    } catch (error: any) {
      console.error('Error fetching articles:', error);
      message.error('Failed to fetch articles');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchArticles();
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleEdit = (id: number) => {
    navigate(`/job-post/${id}`);
  };

  const handleClose = async (id: number) => {
    setSelectedArticleId(id);
    setIsCloseModalVisible(true);
  };

  const handleConfirmClose = async () => {
    if (!selectedArticleId) return;
    
    try {
      await jobService.closeArticle(selectedArticleId);
      message.success('Article closed successfully');
      fetchArticles();
    } catch (error) {
      message.error('Failed to close article');
    } finally {
      setIsCloseModalVisible(false);
      setSelectedArticleId(null);
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: '20%',
      align: 'center' as const,
    },
    {
      title: 'Company',
      dataIndex: ['company', 'name'],
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
        <Tag color={
          status === 'PENDING' ? 'gold' : 
          status === 'APPROVED' ? 'green' : 
          'red'
        }>
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
      render: (date: number) => date ? dayjs.unix(date).format('DD/MM/YYYY') : '',
    },
    {
      title: 'Action',
      key: 'action',
      width: '10%',
      align: 'center' as const,
      render: (_: any, record: Article) => (
        <Space size="middle">
          {record.status !== 'APPROVED' && (
            <Button type="link" onClick={() => handleEdit(record.id)}>Edit</Button>
          )}
          {record.status === 'APPROVED' && (
            <Button type="link" onClick={() => handleClose(record.id)}>Close</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={2}>My Articles</Title>
        <Button type="primary" icon={<PlusOutlined />}>
          <Link to="/post-job">Create Article</Link>
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={8}>
          <Input
            placeholder="Search by title"
            value={filters.title}
            onChange={(e) => handleFilterChange('title', e.target.value)}
            allowClear
          />
        </Col>
        <Col span={8}>
          <Select
            style={{ width: '100%' }}
            placeholder="Select Company"
            value={filters.companyId}
            onChange={(value) => handleFilterChange('companyId', value)}
            allowClear
          >
            {companies.map(company => (
              <Option key={company.id} value={company.id}>
                {company.name}
              </Option>
            ))}
          </Select>
        </Col>
        <Col span={8}>
          <Select
            style={{ width: '100%' }}
            placeholder="Select Status"
            value={filters.status}
            onChange={(value) => handleFilterChange('status', value)}
            allowClear
          >
            <Option value="PENDING">Pending</Option>
            <Option value="APPROVED">Approved</Option>
            <Option value="REJECTED">Rejected</Option>
            <Option value="CLOSED">Closed</Option>
          </Select>
        </Col>
      </Row>

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

      <Modal
        title="Confirm Close Article"
        open={isCloseModalVisible}
        onOk={handleConfirmClose}
        onCancel={() => {
          setIsCloseModalVisible(false);
          setSelectedArticleId(null);
        }}
        okText="Yes, Close it"
        cancelText="Cancel"
      >
        <p>Are you sure you want to close this article? This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default MyJobPostsPage;