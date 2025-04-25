import React, { useEffect, useState } from 'react';
import { Table, Typography, Select, Space, Tag, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getApplicants, jobService, ApplicationStatus, applicantService } from '../services/apiService';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';

const { Option } = Select;

interface Article {
  id: number;
  title: string;
}

const ApplicantsPage: React.FC = () => {
  const [applications, setApplications] = useState([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedArticle, setSelectedArticle] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | 'ALL'>(ApplicationStatus.SUBMITTED);
  const navigate = useNavigate();

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [currentPage, pageSize, selectedArticle, selectedStatus]);

  const fetchArticles = async () => {
    try {
      const response = await jobService.getAllMyArticles('APPROVED');
      setArticles(response.data);
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage - 1,
        size: pageSize,
        sort: 'id,desc',
        ...(selectedArticle && { 'articleId.equals': selectedArticle })
      };
      const data = await getApplicants(
        params, 
        selectedStatus === 'ALL' ? undefined : selectedStatus
      );
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArticleChange = (value: number | null) => {
    setSelectedArticle(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: ApplicationStatus | 'ALL') => {
    setSelectedStatus(value);
    setCurrentPage(1);
  };

  const handleApprove = async (id: number) => {
    try {
      await applicantService.approveApplication(id);
      message.success('Application approved successfully');
      fetchApplications();
    } catch (error) {
      message.error('Failed to approve application');
    }
  };

  const handleDecline = async (id: number) => {
    try {
      await applicantService.declineApplication(id);
      message.success('Application declined successfully');
      fetchApplications();
    } catch (error) {
      message.error('Failed to decline application');
    }
  };

  const columns = [
    {
      title: 'Article',
      dataIndex: 'article',
      key: 'article',
      render: (text: any, record: any) => record.article?.title || '',
    },
    {
      title: 'Full name',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text: any) => text || '',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (text: any) => text || '',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={
          status === 'DECLINED' ? 'red' : 
          status === 'ACCEPTED' ? 'green' : 
          'gold'
        }>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Upload date',
      dataIndex: 'createDate',
      key: 'createDate',
      render: (text: any) => text || '',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          {record.status === ApplicationStatus.SUBMITTED && (
            <>
              <Button 
                type="primary" 
                icon={<CheckOutlined />} 
                onClick={(e) => {
                  e.stopPropagation();
                  handleApprove(record.id);
                }}
              >
                Accept
              </Button>
              <Button 
                danger 
                icon={<CloseOutlined />} 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDecline(record.id);
                }}
              >
                Decline
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Typography.Title level={2}>Applicants</Typography.Title>
      <Space style={{ marginBottom: 16 }}>
        <Select
          style={{ width: 300 }}
          placeholder="Filter by article"
          allowClear
          onChange={handleArticleChange}
          value={selectedArticle}
        >
          <Option key="all" value={null}>All Articles</Option>
          {articles.map((article) => (
            <Option key={article.id} value={article.id}>
              {article.title}
            </Option>
          ))}
        </Select>
        <Select
          style={{ width: 200 }}
          value={selectedStatus}
          onChange={handleStatusChange}
          defaultValue={ApplicationStatus.SUBMITTED}
        >
          <Option key="all" value="ALL">All Status</Option>
          {Object.values(ApplicationStatus).map((status) => (
            <Option key={status} value={status}>
              {status}
            </Option>
          ))}
        </Select>
      </Space>
      <Table 
        columns={columns} 
        dataSource={applications} 
        loading={loading} 
        rowKey="id" 
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          },
        }}
        onRow={(record) => ({
          onClick: () => navigate(`/application/${record.id}`),
        })}
        style={{ textAlign: 'center' }}
      />
    </div>
  );
};

export default ApplicantsPage; 