import React, { useEffect, useState } from 'react';
import { Table, Typography, Button, Space, message, Avatar, Input, Tooltip } from 'antd';
import { UserSwitchOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { userService } from '../services/apiService';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Search } = Input;

interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  gender: boolean;
  birth: string;
  avatarUrl?: string;
  roleName: string;
  locked: boolean | null;
}

const UsersManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchUsername, setSearchUsername] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, [searchUsername, currentPage, pageSize]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: (currentPage - 1).toString(),
        size: pageSize.toString(),
        ...(searchUsername ? { 'username.contains': searchUsername } : {})
      };
      const response = await userService.getAllUsers(params);
      setUsers(response.data);
      setTotal(response.total);
    } catch (error) {
      message.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchUsername(value);
    setCurrentPage(1);
  };

  const handleUpdateRole = async (userId: number) => {
    try {
      await userService.updateUserRole(userId, 'EMPLOYER');
      message.success('User role updated successfully');
      fetchUsers();
    } catch (error) {
      message.error('Failed to update user role');
    }
  };

  const handleLockUser = async (userId: number) => {
    try {
      await userService.lockUser(userId);
      message.success('User locked successfully');
      fetchUsers();
    } catch (error) {
      message.error('Failed to lock user');
    }
  };

  const handleUnlockUser = async (userId: number) => {
    try {
      await userService.unlockUser(userId);
      message.success('User unlocked successfully');
      fetchUsers();
    } catch (error) {
      message.error('Failed to unlock user');
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
          {record.roleName !== 'ADMIN' && (
            record.locked ? (
              <Tooltip title="Unlock account">
                <Button 
                  type="primary"
                  style={{ backgroundColor: '#52c41a' }}
                  icon={<UnlockOutlined />}
                  onClick={() => handleUnlockUser(record.id)}
                />
              </Tooltip>
            ) : (
              <Tooltip title="Lock account">
                <Button 
                  type="primary"
                  danger
                  icon={<LockOutlined />}
                  onClick={() => handleLockUser(record.id)}
                />
              </Tooltip>
            )
          )}
          {record.roleName !== 'EMPLOYER' && record.roleName !== 'ADMIN' && (
            <Tooltip title="Change to Employer">
              <Button 
                type="primary"
                icon={<UserSwitchOutlined />}
                onClick={() => handleUpdateRole(record.id)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Users Management</Title>
      <div style={{ marginBottom: '16px' }}>
        <Search
          placeholder="Search by username"
          allowClear
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 300 }}
        />
      </div>
      <Table 
        columns={columns}
        dataSource={users}
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
      />
    </div>
  );
};

export default UsersManagementPage; 