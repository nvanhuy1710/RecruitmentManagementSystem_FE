import React, { useEffect, useState } from 'react';
import { Table, Typography, Tag, message, App, Select } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getMyApplicants } from '../services/apiService';
import dayjs from 'dayjs';

const { Option } = Select;

const MyApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const navigate = useNavigate();
  const { message: appMessage } = App.useApp();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const data = await getMyApplicants(currentPage - 1, pageSize, statusFilter);
        setApplications(data);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [currentPage, pageSize, statusFilter]);

  useEffect(() => {
    const successMessage = localStorage.getItem('successMessage');
    if (successMessage) {
      appMessage.success(successMessage);
      localStorage.removeItem('successMessage');
    }
  }, [appMessage]);

  const formatDate = (dateString: string) => {
    return dateString ? dayjs(parseInt(dateString) * 1000).format('DD/MM/YYYY') : '';
  };

  const columns = [
    {
      title: 'Article',
      dataIndex: 'article',
      key: 'article',
      align: 'center' as const,
      render: (text: any, record: any) => record.article?.title || '',
    },
    {
      title: 'Full name',
      dataIndex: 'fullName',
      key: 'fullName',
      align: 'center' as const,
      render: (text: any) => text || '',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      align: 'center' as const,
      render: (text: any) => text || '',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center' as const,
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
      align: 'center' as const,
      render: (text: string) => formatDate(text),
    },
  ];

  return (
    <div>
      <Typography.Title level={2}>My Applications</Typography.Title>
      
      <div style={{ marginBottom: 16 }}>
        <Select
          style={{ width: 200 }}
          placeholder="Filter by status"
          allowClear
          onChange={(value) => setStatusFilter(value)}
        >
          <Option value="SUBMITTED">Submitted</Option>
          <Option value="DECLINED">Declined</Option>
          <Option value="ACCEPTED">Accepted</Option>
        </Select>
      </div>

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
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Total ${total} items`,
        }}
        onRow={(record) => ({
          onClick: () => navigate(`/application/${record.id}`),
        })}
        style={{          
          background: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          textAlign: 'center' 
        }}
      />
    </div>
  );
};

const AppMyApplicationsPage: React.FC = () => {
  return (
    <App>
      <MyApplicationsPage />
    </App>
  );
};

export default AppMyApplicationsPage; 