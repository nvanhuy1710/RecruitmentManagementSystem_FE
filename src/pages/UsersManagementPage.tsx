import React, { useEffect, useState } from 'react';
import { Table, Typography, Button, Space, message, Avatar } from 'antd';
import { userService } from '../services/apiService';
import dayjs from 'dayjs';

const { Title } = Typography;

interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  gender: boolean;
  birth: string;
  avatarUrl?: string;
  roleName: string;
}

const UsersManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (error) {
      message.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: number) => {
    try {
      await userService.updateUserRole(userId, 'EMPLOYER');
      message.success('User role updated successfully');
      fetchUsers(); // Refresh danh sách
    } catch (error) {
      message.error('Failed to update user role');
    }
  };

  const columns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      render: (_: string, record: User) => (
        <Space>
          <Avatar src={record.avatarUrl} />
          <span>{record.username}</span>
        </Space>
      ),
    },
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender: boolean) => gender ? 'Male' : 'Female',
    },
    {
      title: 'Birth',
      dataIndex: 'birth',
      key: 'birth',
      render: (birth: string) => birth ? dayjs(birth).format('DD/MM/YYYY') : '',
    },
    {
      title: 'Role',
      dataIndex: 'roleName',
      key: 'roleName',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: User) => (
        <Space>
          {record.roleName !== 'EMPLOYER' && record.roleName !== 'ADMIN' && (
            <Button 
              type="primary"
              onClick={() => handleUpdateRole(record.id)}
            >
              To Employer
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Users Management</Title>
      <Table 
        columns={columns}
        dataSource={users}
        loading={loading}
        rowKey="id"
      />
    </div>
  );
};

export default UsersManagementPage; 