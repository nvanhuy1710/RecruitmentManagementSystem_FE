import React, { useState, useEffect } from 'react';
import { Table, Button, Typography, Space, message, Modal, Form, Input, Card, Upload, Image } from 'antd';
import { PlusOutlined, EditOutlined, StopOutlined, UploadOutlined, PlayCircleOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { companyService, authService } from '../services/apiService';

const { Title } = Typography;
const { TextArea } = Input;

interface Company {
  id: number;
  name: string;
  address: string;
  location: string;
  description: string;
  imageUrl?: string;
  status: string;
}

const CompanyManagementPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [form] = Form.useForm();
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    checkRole();
    fetchCompanies();
  }, [currentPage, pageSize]);

  const checkRole = async () => {
    try {
      const user = await authService.getUserInfo();
      setIsAdmin(user.roleName === 'ADMIN');
    } catch {
      setIsAdmin(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await companyService.getCompanies({
        page: (currentPage - 1).toString(),
        size: pageSize.toString()
      });
      setCompanies(response.data || []);
      setTotal(response.total);
    } catch (error) {
      message.error('Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  const showModal = (company?: Company) => {
    if (company) {
      setEditingCompany(company);
      form.setFieldsValue(company);
    } else {
      setEditingCompany(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingCompany(null);
    setSelectedImage(null);
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      let companyId: number;

      if (editingCompany) {
        await companyService.updateCompany(editingCompany.id, values);
        companyId = editingCompany.id;
        message.success('Company updated successfully');
      } else {
        const response = await companyService.createCompany(values);
        companyId = response.id;
        message.success('Company created successfully');
      }

      // Upload image if selected
      if (selectedImage) {
        await companyService.updateCompanyImage(companyId, selectedImage);
        message.success('Image uploaded successfully');
      }

      fetchCompanies();
      handleCancel();
    } catch (error) {
      message.error('Failed to save company');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async (id: number) => {
    try {
      await companyService.disableCompany(id);
      message.success('Company disabled successfully');
      fetchCompanies();
    } catch (error) {
      message.error('Failed to disable company');
    }
  };

  const handleEnable = async (id: number) => {
    try {
      await companyService.enableCompany(id);
      message.success('Company enabled successfully');
      fetchCompanies();
    } catch (error) {
      message.error('Failed to enable company');
    }
  };

  const handleImageUpload = async (file: File, companyId: number) => {
    try {
      setLoading(true);
      await companyService.updateCompanyImage(companyId, file);
      message.success('Image updated successfully');
      fetchCompanies();
    } catch (error) {
      message.error('Failed to update image');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Image',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 100,
      render: (imageUrl: string) => (
        imageUrl ? (
          <Image
            src={imageUrl}
            alt="Company"
            style={{ width: 50, height: 50, objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: 50, height: 50, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            No Image
          </div>
        )
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: Company) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
            title="Edit"
          />
          {record.status === 'DISABLED' ? (
            <Button 
              type="primary"
              icon={<UnlockOutlined />}
              onClick={() => handleEnable(record.id)}
              title="Enable"
            />
          ) : (
            <Button 
              danger 
              icon={<LockOutlined />}
              onClick={() => handleDisable(record.id)}
              title="Disable"
            />
          )}
        </Space>
      ),
    },
  ];

  if (!isAdmin) {
    return <div style={{ textAlign: 'center', marginTop: 100 }}><Title level={2}>Access Denied</Title></div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Title level={2}>Company Management</Title>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            Add Company
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={companies}
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
            showTotal: (total) => `Total ${total} items`,
          }}
        />

        <Modal
          title={editingCompany ? 'Edit Company' : 'Add Company'}
          open={isModalVisible}
          onCancel={handleCancel}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: 'Please input company name!' }]}
            >
              <Input placeholder="Enter company name" />
            </Form.Item>

            <Form.Item
              name="address"
              label="Address"
              rules={[{ required: true, message: 'Please input company address!' }]}
            >
              <Input placeholder="Enter company address" />
            </Form.Item>

            <Form.Item
              name="location"
              label="Location"
              rules={[{ required: true, message: 'Please input company location!' }]}
            >
              <Input placeholder="Enter company location" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
            >
              <TextArea rows={4} placeholder="Enter company description (optional)" />
            </Form.Item>

            <Form.Item label="Company Image">
              <Upload
                showUploadList={false}
                beforeUpload={(file) => {
                  setSelectedImage(file);
                  return false;
                }}
              >
                <Button icon={<UploadOutlined />}>
                  {selectedImage ? 'Change Image' : 'Upload Image'}
                </Button>
              </Upload>
              {selectedImage && (
                <div style={{ marginTop: 8 }}>
                  Selected: {selectedImage.name}
                </div>
              )}
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {editingCompany ? 'Update' : 'Create'}
                </Button>
                <Button onClick={handleCancel}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default CompanyManagementPage; 