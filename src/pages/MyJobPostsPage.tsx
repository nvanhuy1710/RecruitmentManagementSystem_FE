import React, { useState, useEffect } from 'react';
import { Layout, List, Card, Tag, Spin, message } from 'antd';
import { jobService } from '../services/apiService';
import Header from '../components/layout/Header';

const { Content } = Layout;

interface Article {
  id: number;
  title: string;
  content: string;
  requirement: string;
  address: string;
  location: string;
  companyWebsiteUrl: string;
  fromSalary: number;
  toSalary: number;
  dueDate: string;
  imageUrl?: string;
  status: string;
  createdAt: string;
}

const MyJobPostsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const data = await jobService.getMyArticles();
      setArticles(data);
    } catch (error: any) {
      message.error('Failed to fetch articles');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Header />
      <Content style={{ padding: '24px', minHeight: 'calc(100vh - 64px)' }}>
        <Card title="My Job Posts">
          <Spin spinning={loading}>
            <List
              itemLayout="vertical"
              dataSource={articles}
              renderItem={(article) => (
                <List.Item
                  key={article.id}
                  extra={
                    article.imageUrl && (
                      <img
                        width={272}
                        alt="logo"
                        src={article.imageUrl}
                      />
                    )
                  }
                >
                  <List.Item.Meta
                    title={article.title}
                    description={
                      <>
                        <Tag color="blue">{article.location}</Tag>
                        <Tag color="green">{`$${article.fromSalary} - $${article.toSalary}`}</Tag>
                        <Tag color="orange">{article.status}</Tag>
                      </>
                    }
                  />
                  <div style={{ marginBottom: 16 }}>
                    <strong>Description:</strong>
                    <p>{article.content}</p>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <strong>Requirements:</strong>
                    <p>{article.requirement}</p>
                  </div>
                  <div>
                    <strong>Due Date:</strong> {new Date(article.dueDate).toLocaleDateString()}
                  </div>
                </List.Item>
              )}
            />
          </Spin>
        </Card>
      </Content>
    </Layout>
  );
};

export default MyJobPostsPage;