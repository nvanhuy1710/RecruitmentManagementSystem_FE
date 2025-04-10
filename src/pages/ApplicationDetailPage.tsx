import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Typography, List, Tag, Spin, Card } from 'antd';
import { getApplicationById } from '../services/apiService';

const ApplicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplication = async () => {
      if (!id) return; // Check if id is undefined
      try {
        const data = await getApplicationById(id);
        setApplication(data);
      } catch (error) {
        console.error('Error fetching application details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id]);

  if (loading) return <Spin size="large" />;

  return (
    <Card style={{ margin: '20px' }}>
      <Typography.Title level={2}>Application Details</Typography.Title>
      {application && (
        <div>
          <Typography.Paragraph>
            <span style={{ fontSize: '18px' }}><strong >Article:</strong></span><br /> <Link to={`/view-article/${application.article?.id}`} style={{ fontSize: '18px' }}>{application.article?.title}</Link>
          </Typography.Paragraph>
          <Typography.Paragraph>
            <span style={{ fontSize: '18px' }}><strong>Full Name:</strong></span><br /> <span style={{ fontSize: '18px' }}>{application.fullName}</span>
          </Typography.Paragraph>
          <Typography.Paragraph>
            <span style={{ fontSize: '18px' }}><strong>Phone:</strong></span><br /> <span style={{ fontSize: '18px' }}>{application.phone}</span>
          </Typography.Paragraph>
          <Typography.Paragraph>
            <span style={{ fontSize: '18px' }}><strong>Cover Letter:</strong></span><br /> <span style={{ fontSize: '18px' }}>{application.coverLetter}</span>
          </Typography.Paragraph>
          <Typography.Paragraph>
            <span style={{ fontSize: '18px' }}><strong>Status:</strong></span><br /> <Tag color={
              application.status === 'DECLINED' ? 'red' : 
              application.status === 'ACCEPTED' ? 'green' : 
              'gold'
            } style={{ fontSize: '18px' }}>{application.status}</Tag>
          </Typography.Paragraph>
          <Typography.Paragraph>
            <span style={{ fontSize: '18px' }}><strong>Upload Date:</strong></span><br /> <span style={{ fontSize: '18px' }}>{application.createDate}</span>
          </Typography.Paragraph>
          <Typography.Title level={4}>Documents</Typography.Title>
          {application.documents.map((document: any) => (
            <Typography.Paragraph key={document.fileUrl}>
              <a href={document.fileUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '18px' }}>{document.name}</a>
            </Typography.Paragraph>
          ))}
        </div>
      )}
    </Card>
  );
};

export default ApplicationDetailPage; 