import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Select, InputNumber } from 'antd';
import { useNavigate } from 'react-router-dom';

const { TextArea } = Input;
const { Option } = Select;

const JobPost: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // TODO: Implement job posting logic
      console.log('Job posting values:', values);
      message.success('Job posted successfully!');
      navigate('/');
    } catch (error) {
      message.error('Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
      <Card title="Post a Job" bordered={false}>
        <Form
          name="jobPost"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="title"
            label="Job Title"
            rules={[{ required: true, message: 'Please input the job title!' }]}
          >
            <Input placeholder="Enter job title" />
          </Form.Item>

          <Form.Item
            name="company"
            label="Company Name"
            rules={[{ required: true, message: 'Please input the company name!' }]}
          >
            <Input placeholder="Enter company name" />
          </Form.Item>

          <Form.Item
            name="location"
            label="Location"
            rules={[{ required: true, message: 'Please input the job location!' }]}
          >
            <Input placeholder="Enter job location" />
          </Form.Item>

          <Form.Item
            name="salary"
            label="Salary Range"
            rules={[{ required: true, message: 'Please input the salary range!' }]}
          >
            <Input placeholder="Enter salary range (e.g., $50,000 - $70,000)" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Job Type"
            rules={[{ required: true, message: 'Please select the job type!' }]}
          >
            <Select placeholder="Select job type">
              <Option value="full-time">Full-time</Option>
              <Option value="part-time">Part-time</Option>
              <Option value="contract">Contract</Option>
              <Option value="internship">Internship</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="experience"
            label="Experience Level"
            rules={[{ required: true, message: 'Please select the experience level!' }]}
          >
            <Select placeholder="Select experience level">
              <Option value="entry">Entry Level</Option>
              <Option value="mid">Mid Level</Option>
              <Option value="senior">Senior Level</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Job Description"
            rules={[{ required: true, message: 'Please input the job description!' }]}
          >
            <TextArea rows={6} placeholder="Enter job description" />
          </Form.Item>

          <Form.Item
            name="requirements"
            label="Requirements"
            rules={[{ required: true, message: 'Please input the job requirements!' }]}
          >
            <TextArea rows={6} placeholder="Enter job requirements" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Post Job
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default JobPost; 