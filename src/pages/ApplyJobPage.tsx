import React, { useEffect } from 'react';
import { Form, Input, Button, Upload, Typography, Layout, Card, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { authService, applicantService } from '../services/apiService';
import { useParams } from 'react-router-dom';

const { Content } = Layout;
const { Title } = Typography;

const ApplyJobPage: React.FC = () => {
  const [form] = Form.useForm();
  const { id: articleId } = useParams<{ id: string }>();

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
      message.success('Application submitted successfully');
    } catch (error) {
      console.error('Error submitting application:', error);
      message.error('Failed to submit application');
    }
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
          <Form.Item name="cv" label="Upload CV" valuePropName="fileList" getValueFromEvent={(e) => e.fileList} rules={[{ required: true, message: 'Please upload your CV' }]}> 
            <Upload multiple={true} beforeUpload={() => false}>
              <Button icon={<UploadOutlined />}>Select File</Button>
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

export default ApplyJobPage; 