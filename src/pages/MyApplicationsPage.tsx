import React, { useEffect, useState } from 'react';
import { Table, Typography, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getApplicants } from '../services/apiService';

const MyApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const data = await getApplicants(currentPage - 1, pageSize);
        setApplications(data);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [currentPage, pageSize]);

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
      dataIndex: 'createDate',
      key: 'createDate',
      align: 'center' as const,
      render: (text: any) => text || '',
    },
  ];

  return (
    <div>
      <Typography.Title level={2}>My Applications</Typography.Title>
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

export default MyApplicationsPage; 