import React, { useState, useEffect } from 'react';
import { Table, Button, Typography, Space, message, Tag, Tooltip } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { jobService } from '../services/apiService';
import dayjs from 'dayjs';

const { Title } = Typography;

interface Article {
  id: number;
  title: string;
  content: string;
  requirement: string;
  companyWebsiteUrl: string;
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
  educationRequired?: string;
}

const ReviewArticlesPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<Article[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loadingActions, setLoadingActions] = useState<{[key: number]: {approve: boolean, reject: boolean}}>({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchArticles();
  }, [currentPage, pageSize]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await jobService.getPendingArticles(currentPage - 1, pageSize);
      setArticles(response.data);
      setTotal(response.total);
    } catch (error: any) {
      console.error('Error fetching articles:', error);
      message.error('Failed to fetch articles');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      setLoadingActions(prev => ({...prev, [id]: {...prev[id], approve: true}}));
      await jobService.approveArticle(id);
      message.success('Article approved successfully');
      fetchArticles();
    } catch (error) {
      message.error('Failed to approve article');
    } finally {
      setLoadingActions(prev => ({...prev, [id]: {...prev[id], approve: false}}));
    }
  };

  const handleReject = async (id: number) => {
    try {
      setLoadingActions(prev => ({...prev, [id]: {...prev[id], reject: true}}));
      await jobService.rejectArticle(id);
      message.success('Article rejected successfully');
      fetchArticles();
    } catch (error) {
      message.error('Failed to reject article');
    } finally {
      setLoadingActions(prev => ({...prev, [id]: {...prev[id], reject: false}}));
    }
  };

  const handleRowClick = (record: Article) => {
    navigate(`/review-article/${record.id}`);
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
      width: '15%',
      align: 'center' as const,
      render: (_: any, record: Article) => (
        <Space size="middle">
          <Tooltip title="Approve">
            <Button 
              type="primary" 
              icon={<CheckOutlined />} 
              onClick={(e) => {
                e.stopPropagation();
                handleApprove(record.id);
              }}
              loading={loadingActions[record.id]?.approve}
            />
          </Tooltip>
          <Tooltip title="Reject">
            <Button 
              danger 
              icon={<CloseOutlined />} 
              onClick={(e) => {
                e.stopPropagation();
                handleReject(record.id);
              }}
              loading={loadingActions[record.id]?.reject}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={2}>Review Articles</Title>
      </div>
      <Table
        columns={columns}
        dataSource={articles}
        rowKey="id"
        loading={loading}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          style: { cursor: 'pointer' }
        })}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: total,
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          },
          showSizeChanger: true,
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

export default ReviewArticlesPage; 