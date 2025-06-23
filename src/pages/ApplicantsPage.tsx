import React, { useEffect, useState } from 'react';
import { Table, Typography, Select, Space, Tag, Button, Modal, Tooltip, App } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getApplicants, jobService, ApplicationStatus, applicantService } from '../services/apiService';
import { CheckCircleOutlined, CloseCircleOutlined, CalculatorOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

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
  const [total, setTotal] = useState(0);
  const [selectedArticle, setSelectedArticle] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | 'ALL'>(ApplicationStatus.SUBMITTED);
  const [sortField, setSortField] = useState<string>('id');
  const [sortOrder, setSortOrder] = useState<string>('desc');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedArticleForScore, setSelectedArticleForScore] = useState<number | null>(null);
  const [calculating, setCalculating] = useState(false);
  const navigate = useNavigate();
  const { message } = App.useApp();

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [currentPage, pageSize, selectedArticle, selectedStatus, sortField, sortOrder]);

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
        sort: `${sortField},${sortOrder}`,
        ...(selectedArticle && { 'articleId.equals': selectedArticle })
      };
      const response = await getApplicants(
        params, 
        selectedStatus === 'ALL' ? undefined : selectedStatus
      );
      setApplications(response.data);
      setTotal(parseInt(response.headers['x-total-count'] || '0', 10));
    } catch (error) {
      console.error('Error fetching applications:', error);
      message.error('Failed to fetch applications');
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

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    if (sorter.field) {
      setSortField(sorter.field);
      setSortOrder(sorter.order === 'ascend' ? 'asc' : 'desc');
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await applicantService.approveApplication(id);
      message.success('Application accepted successfully');
      fetchApplications();
    } catch (error) {
      message.error('Failed to accept application');
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

  const handleCalculateScore = async () => {
    if (!selectedArticleForScore) {
      message.error('Please select an article');
      return;
    }

    try {
      setCalculating(true);
      await applicantService.calculateMatchScore(selectedArticleForScore);
      message.success('Match scores calculated successfully');
      setIsModalVisible(false);
      fetchApplications();
    } catch (error) {
      message.error('Failed to calculate match scores');
    } finally {
      setCalculating(false);
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
      dataIndex: 'createdDate',
      key: 'createdDate',
      render: (createdDate: any) =>
        createdDate ? dayjs.unix(Number(createdDate)).format('DD/MM/YYYY') : '',
    },
    {
      title: 'Score',
      dataIndex: 'matchScore',
      key: 'matchScore',
      render: (score: number) => score !== null && score !== undefined ? `${score}` : '',
      sorter: true,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          {record.status === ApplicationStatus.SUBMITTED && (
            <>
              <Tooltip title="Accept">
                <Button 
                  type="primary" 
                  icon={<CheckCircleOutlined />} 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApprove(record.id);
                  }}
                />
              </Tooltip>
              <Tooltip title="Decline">
                <Button 
                  danger 
                  icon={<CloseCircleOutlined />} 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDecline(record.id);
                  }}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title level={2}>Applicants</Typography.Title>
        <Button 
          type="primary" 
          icon={<CalculatorOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          Calculate Match Score
        </Button>
      </div>
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
          total: total,
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          },
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
        }}
        onChange={handleTableChange}
        onRow={(record) => ({
          onClick: () => navigate(`/application/${record.id}`),
        })}
        style={{ textAlign: 'center' }}
      />
      <Modal
        title="Calculate Match Score"
        open={isModalVisible}
        onOk={handleCalculateScore}
        onCancel={() => setIsModalVisible(false)}
        confirmLoading={calculating}
      >
        <Select
          style={{ width: '100%' }}
          placeholder="Select article to calculate match score"
          onChange={(value) => setSelectedArticleForScore(value)}
          value={selectedArticleForScore}
        >
          {articles.map((article) => (
            <Option key={article.id} value={article.id}>
              {article.title}
            </Option>
          ))}
        </Select>
      </Modal>
    </div>
  );
};

const AppApplicantsPage: React.FC = () => {
  return (
    <App>
      <ApplicantsPage />
    </App>
  );
};

export default AppApplicantsPage; 