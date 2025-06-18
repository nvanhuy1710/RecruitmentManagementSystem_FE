import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Select, InputNumber, DatePicker, Upload, App, Space, Checkbox } from 'antd';
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

interface Skill {
  id: number;
  name: string | null;
}

interface WorkingModel {
  id: number;
  name: string;
  description: string | null;
}

interface Company {
  id: number;
  name: string;
  description: string | null;
  address: string | null;
  location: string | null;
}

interface Article {
  id: number;
  title: string;
  mainImagePath: string;
  content: string;
  requirement: string | null;
  address: string | null;
  location: string | null;
  company: Company;
  fromSalary: number | null;
  toSalary: number | null;
  dueDate: number;
  status: string;
  industryIds: number[];
  industry: Industry[];
  jobLevelIds: number[];
  jobLevel: JobLevel[];
  workingModelIds: number[];
  workingModels: WorkingModel[];
  skillIds: number[];
  skills: Skill[];
  userId: number;
  user: any | null;
  mainImageUrl: string;
  autoCaculate: boolean;
}

const ArticleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [jobLevels, setJobLevels] = useState<JobLevel[]>([]);
  const [workingModels, setWorkingModels] = useState<WorkingModel[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState<string>('');
  const { message } = App.useApp();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [articleRes, industriesRes, jobLevelsRes, workingModelsRes, skillsRes, companiesRes] = await Promise.all([
          jobService.getArticleById(Number(id)),
          jobService.getIndustries(),
          jobService.getJobLevels(),
          jobService.getWorkingModels(),
          jobService.getSkills(),
          jobService.getCompanies()
        ]);

        const article: Article = articleRes.data;
        
        // Log để kiểm tra dữ liệu
        console.log('Article Response:', articleRes);
        console.log('Industries Response:', industriesRes);
        console.log('Job Levels Response:', jobLevelsRes);
        console.log('Working Models Response:', workingModelsRes);
        console.log('Skills Response:', skillsRes);
        console.log('Companies Response:', companiesRes);

        setIndustries(industriesRes || []);
        setJobLevels(jobLevelsRes || []);
        setWorkingModels(workingModelsRes || []);
        setSkills(skillsRes || []);
        setCompanies(companiesRes || []);

        // Set form values
        form.setFieldsValue({
          title: article.title,
          content: article.content,
          requirement: article.requirement || '',
          companyId: article.company?.id,
          company: article.company?.name || '',
          companyDescription: article.company?.description || '',
          companyAddress: article.company?.address || '',
          companyLocation: article.company?.location || '',
          fromSalary: article.fromSalary,
          toSalary: article.toSalary,
          dueDate: article.dueDate ? dayjs.unix(article.dueDate) : null,
          industryIds: article.industryIds || [],
          jobLevelIds: article.jobLevelIds || [],
          workingModelIds: article.workingModelIds || [],
          skillIds: article.skillIds || [],
          autoCaculate: article.autoCaculate || false
        });
        
        if (article.mainImageUrl) {
          setImageUrl(article.mainImageUrl);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
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

  const handleCompanyChange = (companyId: number) => {
    const selectedCompany = companies.find(company => company.id === companyId);
    if (selectedCompany) {
      form.setFieldsValue({
        company: selectedCompany.name,
        companyDescription: selectedCompany.description,
        companyAddress: selectedCompany.address,
        companyLocation: selectedCompany.location
      });
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const articleData = {
        title: values.title,
        content: values.content,
        requirement: values.requirement || null,
        address: values.address || null,
        location: values.location || null,
        companyId: values.companyId,
        company: {
          name: values.company,
          description: values.companyDescription || null,
          address: values.companyAddress || null,
          location: values.companyLocation || null
        },
        fromSalary: values.fromSalary || null,
        toSalary: values.toSalary || null,
        dueDate: values.dueDate ? values.dueDate.unix() : null,
        industryIds: values.industryIds,
        jobLevelIds: values.jobLevelIds,
        workingModelIds: values.workingModelIds,
        skillIds: values.skillIds,
        autoCaculate: values.autoCaculate || false
      };

      await jobService.updateArticle(Number(id), articleData);
      
      // Fetch lại dữ liệu mới
      const articleRes = await jobService.getArticleById(Number(id));
      const updatedArticle: Article = articleRes.data;
      
      // Reset form với dữ liệu mới
      form.setFieldsValue({
        title: updatedArticle.title,
        content: updatedArticle.content,
        requirement: updatedArticle.requirement || '',
        companyId: updatedArticle.company?.id,
        company: updatedArticle.company?.name || '',
        companyDescription: updatedArticle.company?.description || '',
        companyAddress: updatedArticle.company?.address || '',
        companyLocation: updatedArticle.company?.location || '',
        fromSalary: updatedArticle.fromSalary,
        toSalary: updatedArticle.toSalary,
        dueDate: updatedArticle.dueDate ? dayjs.unix(updatedArticle.dueDate) : null,
        industryIds: updatedArticle.industryIds || [],
        jobLevelIds: updatedArticle.jobLevelIds || [],
        workingModelIds: updatedArticle.workingModelIds || [],
        skillIds: updatedArticle.skillIds || [],
        autoCaculate: updatedArticle.autoCaculate || false
      });

      if (updatedArticle.mainImageUrl) {
        setImageUrl(updatedArticle.mainImageUrl);
      }

      message.success('Update article successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update article. Please try again.';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  console.log('Industries:', industries);
  console.log('Job Levels:', jobLevels);
  console.log('Working Models:', workingModels);
  console.log('Skills:', skills);
  console.log('Companies:', companies);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
      <Card title="Edit Article">
        <Form
          form={form}
          name="editArticle"
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
            name="companyId"
            label="Company"
            rules={[{ required: true, message: 'Please select a company!' }]}
          >
            <Select 
              placeholder="Select company"
              style={{ width: '100%' }}
              onChange={handleCompanyChange}
            >
              {companies && companies.map(company => (
                <Select.Option key={company.id} value={company.id}>
                  {company.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="company"
            label="Company Name"
          >
            <Input placeholder="" disabled />
          </Form.Item>

          <Form.Item
            name="companyDescription"
            label="Company Description"
          >
            <TextArea rows={4} placeholder="Enter company description" />
          </Form.Item>

          <Form.Item
            name="companyAddress"
            label="Company Address"
          >
            <Input placeholder="" disabled />
          </Form.Item>

          <Form.Item
            name="companyLocation"
            label="Company Location"
          >
            <Input placeholder="" disabled />
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
              {industries && industries.map(industry => {
                console.log('Rendering industry:', industry);
                return (
                  <Select.Option key={industry.id} value={industry.id}>
                    {industry.name || 'Unnamed Industry'}
                  </Select.Option>
                );
              })}
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
              {jobLevels && jobLevels.map(level => {
                console.log('Rendering job level:', level);
                return (
                  <Select.Option key={level.id} value={level.id}>
                    {level.name || 'Unnamed Level'}
                  </Select.Option>
                );
              })}
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
              {workingModels && workingModels.map(model => {
                console.log('Rendering working model:', model);
                return (
                  <Select.Option key={model.id} value={model.id}>
                    {model.name || 'Unnamed Model'}
                  </Select.Option>
                );
              })}
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
              {skills && skills.map(skill => {
                console.log('Rendering skill:', skill);
                return (
                  <Select.Option key={skill.id} value={skill.id}>
                    {skill.name || 'Unnamed Skill'}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>

          <Form.Item
            name="autoCaculate"
            valuePropName="checked"
            initialValue={false}
          >
            <Checkbox>Auto Calculate</Checkbox>
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
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Update Article
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

const AppArticleDetailPage: React.FC = () => {
  return (
    <App>
      <ArticleDetailPage />
    </App>
  );
};

export default AppArticleDetailPage; 