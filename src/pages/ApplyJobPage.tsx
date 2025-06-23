import React, { useEffect } from 'react';
import { Form, Input, Button, Upload, Typography, Layout, Card, App } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { authService, applicantService } from '../services/apiService';
import { useParams, useNavigate } from 'react-router-dom';

const { Content } = Layout;
const { Title } = Typography;

const ApplyJobPage: React.FC = () => {
  const [form] = Form.useForm();
  const { id: articleId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { message } = App.useApp();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userInfo = await authService.getUserInfo();
        form.setFieldsValue({ fullName: userInfo.fullName });
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserInfo();
  }, [form]);

  const handleFinish = async (values: any) => {
    const formData = new FormData();
    formData.append('applicant', new Blob([JSON.stringify({
      fullName: values.fullName,
      phone: values.phone,
      coverLetter: values.coverLetter,
      articleId: parseInt(articleId!),
    })], { type: 'application/json' }));

    values.cv.forEach((file: any) => {
      formData.append('files', file.originFileObj);
    });

    try {
      await applicantService.createApplicant(formData);
      localStorage.setItem('successMessage', 'Application submitted successfully');
      navigate('/my-applications');
    } catch (error) {
      console.error('Error submitting application:', error);
      message.error('Failed to submit application');
    }
  };

  const beforeUpload = (file: File) => {
    const isPDF = file.type === 'application/pdf';
    if (!isPDF) {
      message.error('You can only upload PDF files!');
    }
    const isLt5M = file.size / 1024 / 1024 < 10;
    if (!isLt5M) {
      message.error('File must be smaller than 10MB!');
    }
    return isPDF && isLt5M ? false : Upload.LIST_IGNORE;
  };

  return (
    <Card style={{ maxWidth: 600, margin: '0 auto', padding: '24px' }}>
      <div style={{ maxWidth: '600px', margin: '24px auto', padding: '0 24px' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '24px' }}>Apply Job</Title>
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item name="fullName" label="Full name" rules={[{ required: true, message: 'Please enter your full name' }]}> 
            <Input placeholder="Enter your full name" />
          </Form.Item>
          <Form.Item name="phone" label="Phone" rules={[{ required: true, message: 'Please enter your phone number' }]}> 
            <Input placeholder="Enter your phone number" />
          </Form.Item>
          <Form.Item name="coverLetter" label="Cover Letter"> 
            <Input.TextArea placeholder="Enter your cover letter" autoSize={{ minRows: 4, maxRows: 8 }} />
          </Form.Item>
          <Form.Item name="cv" label="Upload CV (PDF only)" valuePropName="fileList" getValueFromEvent={(e) => e.fileList} rules={[{ required: true, message: 'Please upload your CV' }]}> 
            <Upload 
              maxCount={1}
              accept=".pdf"
              beforeUpload={beforeUpload}
            >
              <Button icon={<UploadOutlined />}>Select PDF File</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>Submit Application</Button>
          </Form.Item>
        </Form>
      </div>
    </Card>
  );
};

const AppApplyJobPage: React.FC = () => {
  return (
    <App>
      <ApplyJobPage />
    </App>
  );
};

export default AppApplyJobPage; 