import React from 'react';
import { Layout } from 'antd';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import JobPost from '../components/job/JobPost';

const { Content } = Layout;

const JobPostPage: React.FC = () => {
  return (
    <Layout>
      <Header />
      <Content style={{ minHeight: 'calc(100vh - 64px - 70px)', background: '#f0f2f5' }}>
        <JobPost />
      </Content>
      <Footer />
    </Layout>
  );
};

export default JobPostPage; 