import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Select, InputNumber, DatePicker, Upload, Modal, Space, Checkbox } from 'antd';
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

interface Company {
  id: number;
  name: string;
  description: string;
  address: string;
}

interface JobArticle {
  title: string;
  content: string;
  requirement: string;
  location: string;
  fromSalary: number;
  toSalary: number;
  dueDate: string;
  industryIds: number[];
  jobLevelIds: number[];
  workingModelIds: number[];
  companyId: number;
  skillIds: number[];
  autoCaculate: boolean;
}

interface Skill {
  id: number;
  name: string;
}

interface JobPostProps {
  onSuccess?: () => void;
}

const JobPost: React.FC<JobPostProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [jobLevels, setJobLevels] = useState<JobLevel[]>([]);
  const [workingModels, setWorkingModels] = useState<WorkingModel[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [industriesData, jobLevelsData, workingModelsData, companiesData, skillsData] = await Promise.all([
          jobService.getIndustries(),
          jobService.getJobLevels(),
          jobService.getWorkingModels(),
          jobService.getCompanies(),
          jobService.getSkills()
        ]);

        setIndustries(industriesData);
        setJobLevels(jobLevelsData);
        setWorkingModels(workingModelsData);
        setCompanies(companiesData);
        setSkills(skillsData);
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
        location: values.location,
        fromSalary: values.fromSalary,
        toSalary: values.toSalary,
        dueDate: values.dueDate.startOf('day').toISOString(),
        industryIds: values.industryIds,
        jobLevelIds: values.jobLevelIds,
        workingModelIds: values.workingModelIds,
        companyId: values.companyId,
        skillIds: values.skillIds,
        autoCaculate: values.autoCaculate || false
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
            rules={[{ required: true, message: 'Please upload an image!' }]}
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
            name="companyId"
            label="Company"
            rules={[{ required: true, message: 'Please select a company!' }]}
          >
            <Select placeholder="Select company">
              {companies.map(company => (
                <Select.Option key={company.id} value={company.id}>
                  {company.name}
                </Select.Option>
              ))}
            </Select>
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
            name="industryIds"
            label="Industries"
            rules={[{ required: true, message: 'Please select at least one industry!' }]}
          >
            <Select 
              mode="multiple" 
              placeholder="Select industries"
              style={{ width: '100%' }}
            >
              {industries.map(industry => (
                <Select.Option key={industry.id} value={industry.id}>
                  {industry.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="jobLevelIds"
            label="Job Levels"
            rules={[{ required: true, message: 'Please select at least one job level!' }]}
          >
            <Select 
              mode="multiple" 
              placeholder="Select job levels"
              style={{ width: '100%' }}
            >
              {jobLevels.map(level => (
                <Select.Option key={level.id} value={level.id}>
                  {level.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="workingModelIds"
            label="Working Models"
            rules={[{ required: true, message: 'Please select at least one working model!' }]}
          >
            <Select 
              mode="multiple" 
              placeholder="Select working models"
              style={{ width: '100%' }}
            >
              {workingModels.map(model => (
                <Select.Option key={model.id} value={model.id}>
                  {model.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="skillIds"
            label="Skills"
            rules={[{ required: true, message: 'Please select at least one skill!' }]}
          >
            <Select 
              mode="multiple" 
              placeholder="Select skills"
              style={{ width: '100%' }}
            >
              {skills.map(skill => (
                <Select.Option key={skill.id} value={skill.id}>
                  {skill.name}
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

          <Form.Item
            name="autoCaculate"
            valuePropName="checked"
            initialValue={false}
          >
            <Checkbox>Auto Calculate</Checkbox>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Post Job
              </Button>
              <Button onClick={() => navigate('/my-job-posts')}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default JobPost; 