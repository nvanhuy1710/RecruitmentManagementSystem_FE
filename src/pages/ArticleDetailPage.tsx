import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Select, InputNumber, DatePicker, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { jobService } from '../services/apiService';
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
  description: string | null;
}

interface Article {
  id: number;
  title: string;
  mainImagePath: string;
  content: string;
  requirement: string | null;
  address: string | null;
  location: string | null;
  company: string | null;
  fromSalary: number | null;
  toSalary: number | null;
  dueDate: number;
  status: string;
  industryId: number;
  industry: Industry;
  jobLevelId: number;
  jobLevel: JobLevel;
  workingModelId: number;
  workingModel: WorkingModel;
  userId: number;
  user: any | null;
  mainImageUrl: string;
}

const ArticleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [jobLevels, setJobLevels] = useState<JobLevel[]>([]);
  const [workingModels, setWorkingModels] = useState<WorkingModel[]>([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [articleRes, industriesRes, jobLevelsRes, workingModelsRes] = await Promise.all([
          jobService.getArticleById(Number(id)),
          jobService.getIndustries(),
          jobService.getJobLevels(),
          jobService.getWorkingModels()
        ]);

        const article: Article = articleRes.data;
        setIndustries(industriesRes || []);
        setJobLevels(jobLevelsRes || []);
        setWorkingModels(workingModelsRes || []);

        console.log('industry ' + industriesRes.data);
        console.log(jobLevelsRes.data);
        console.log(workingModelsRes.data);
        
        // Set form values
        form.setFieldsValue({
          title: article.title,
          content: article.content,
          requirement: article.requirement || '',
          address: article.address || '',
          location: article.location || '',
          company: article.company || '',
          fromSalary: article.fromSalary,
          toSalary: article.toSalary,
          dueDate: article.dueDate ? dayjs.unix(article.dueDate) : null,
          industryId: article.industryId,
          jobLevelId: article.jobLevelId,
          workingModelId: article.workingModelId
        });
        
        if (article.mainImageUrl) {
          setImageUrl(article.mainImageUrl);
        }
      } catch (error) {
        message.error('Failed to load article data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, form]);

  const handleImageChange = async (file: File) => {
    try {
      setLoading(true);
      await jobService.updateArticleImage(Number(id), file);
      const response = await jobService.getArticleById(Number(id));
      setImageUrl(response.data.mainImageUrl);
      message.success('Image updated successfully');
    } catch (error) {
      message.error('Failed to update image');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const article = {
        title: values.title,
        content: values.content,
        requirement: values.requirement || null,
        address: values.address || null,
        location: values.location || null,
        company: values.company || null,
        fromSalary: values.fromSalary || null,
        toSalary: values.toSalary || null,
        dueDate: values.dueDate ? values.dueDate.unix() : null,
        industryId: values.industryId,
        jobLevelId: values.jobLevelId,
        workingModelId: values.workingModelId
      };

      await jobService.updateArticle(Number(id), article);
      message.success('Article updated successfully');
      navigate(`/job-post/${id}`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update article. Please try again.';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
      <Card title="Edit Job Post">
        <Form
          form={form}
          name="editJobPost"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item label="Current Image">
            {imageUrl && (
              <div style={{ marginBottom: '16px' }}>
                <img 
                  src={imageUrl} 
                  alt="Current article" 
                  style={{ maxWidth: '200px', borderRadius: '8px' }}
                />
              </div>
            )}
            <Upload
              beforeUpload={(file) => {
                handleImageChange(file);
                return false;
              }}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>Change Image</Button>
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
            label="Requirements"
            rules={[{ required: true, message: 'Please input the requirements!' }]}
          >
            <TextArea rows={6} placeholder="Enter job requirements" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Update Job Post
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ArticleDetailPage; 