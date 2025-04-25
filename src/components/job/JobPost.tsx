import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Select, InputNumber, DatePicker, Upload,Modal } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { jobService } from '../../services/apiService';
import type { UploadFile } from 'antd/es/upload/interface';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface Industry {
  id: number;
  name: string;
}

interface JobLevel {
  id: number;
  name: string;
}

interface WorkingModel {
  id: number;
  name: string;
}

interface JobArticle {
  title: string;
  content: string;
  requirement: string;
  address: string;
  location: string;
  company: string;
  fromSalary: number;
  toSalary: number;
  dueDate: string;
  industryId: number;
  jobLevelId: number;
  workingModelId: number;
}

interface JobPostProps {
  onSuccess?: () => void;
}

const JobPost: React.FC<JobPostProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [jobLevels, setJobLevels] = useState<JobLevel[]>([]);
  const [workingModels, setWorkingModels] = useState<WorkingModel[]>([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [industriesData, jobLevelsData, workingModelsData] = await Promise.all([
          jobService.getIndustries(),
          jobService.getJobLevels(),
          jobService.getWorkingModels()
        ]);

        setIndustries(industriesData);
        setJobLevels(jobLevelsData);
        setWorkingModels(workingModelsData);
      } catch (error) {
        message.error('Failed to load form data');
      }
    };

    fetchData();
  }, []);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const article: JobArticle = {
        title: values.title,
        content: values.content,
        requirement: values.requirement,
        address: values.address,
        location: values.location,
        company: values.company,
        fromSalary: values.fromSalary,
        toSalary: values.toSalary,
        dueDate: values.dueDate.startOf('day').toISOString(),
        industryId: values.industryId,
        jobLevelId: values.jobLevelId,
        workingModelId: values.workingModelId
      };

      const imageFile = values.image?.[0]?.originFileObj;

      const result = await jobService.createJob(article, imageFile);
      
      if (result.success) {
        message.success('Post Article Successful');
        if (onSuccess) {
          onSuccess();
        }
        navigate('/my-job-posts');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to post job. Please try again.';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
      <Card title="Post a New Job">
        <Form
          form={form}
          name="jobPost"
          onFinish={onFinish}
          layout="vertical"
        >

          <Form.Item
            name="image"
            label="Image"
            valuePropName="fileList"
            getValueFromEvent={e => {
              if (Array.isArray(e)) {
                return e;
              }
              return e?.fileList;
            }}
          >
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              listType="picture"
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>Click to upload</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please input the title!' }]}
          >
            <Input placeholder="Enter title" />
          </Form.Item>

          <Form.Item
            name="company"
            label="Company"
            rules={[
              { required: true, message: 'Please input the company name!' }
            ]}
          >
            <Input placeholder="Enter company name" />
          </Form.Item>

          <Form.Item
            name="address"
            label="Address"
            rules={[{ message: 'Please input the address!' }]}
          >
            <Input placeholder="Enter work address" />
          </Form.Item>

          <Form.Item
            name="location"
            label="Location"
            rules={[{ message: 'Please input the location!' }]}
          >
            <Input placeholder="Enter location (e.g., Ho Chi Minh City)" />
          </Form.Item>

          <Form.Item label="Salary Range" style={{ marginBottom: 0 }}>
            <Form.Item
              name="fromSalary"
              style={{ display: 'inline-block', width: 'calc(50% - 12px)' }}
            >
              <InputNumber
                placeholder="From"
                style={{ width: '100%' }}
                formatter={value => `$${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value!.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>
            <span style={{ display: 'inline-block', width: '24px', textAlign: 'center' }}>-</span>
            <Form.Item
              name="toSalary"
              style={{ display: 'inline-block', width: 'calc(50% - 12px)' }}
            >
              <InputNumber
                placeholder="To"
                style={{ width: '100%' }}
                formatter={value => `$${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value!.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>
          </Form.Item>

          <Form.Item
            name="dueDate"
            label="Due Date"
            rules={[{ required: true, message: 'Please select the due date!' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="industryId"
            label="Industry"
            rules={[{ required: true, message: 'Please select the industry!' }]}
          >
            <Select placeholder="Select industry">
              {industries.map(industry => (
                <Select.Option key={industry.id} value={industry.id}>
                  {industry.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="jobLevelId"
            label="Job Level"
            rules={[{ required: true, message: 'Please select the job level!' }]}
          >
            <Select placeholder="Select job level">
              {jobLevels.map(level => (
                <Select.Option key={level.id} value={level.id}>
                  {level.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="workingModelId"
            label="Working Model"
            rules={[{ required: true, message: 'Please select the working model!' }]}
          >
            <Select placeholder="Select working model">
              {workingModels.map(model => (
                <Select.Option key={model.id} value={model.id}>
                  {model.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="content"
            label="Job Description"
            rules={[{ required: true, message: 'Please input the job description!' }]}
          >
            <TextArea rows={6} placeholder="Enter detailed job description" />
          </Form.Item>

          <Form.Item
            name="requirement"
            label="Job Requirements"
            rules={[{ required: true, message: 'Please input the job requirements!' }]}
          >
            <TextArea rows={6} placeholder="Enter job requirements (e.g., skills, experience, qualifications)" />
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