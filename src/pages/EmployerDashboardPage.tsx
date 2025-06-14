import React, { useEffect, useState } from 'react';
import { Card, Typography, Select, message, Row, Col } from 'antd';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { authService, jobService } from '../services/apiService';

Chart.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend);

const { Title } = Typography;

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

const getMonthName = (month: string) => {
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Novr', 'Dec'
  ];
  return monthNames[parseInt(month) - 1];
};

const EmployerDashboardPage: React.FC = () => {
  const [year, setYear] = useState<number>(currentYear);
  const [applicantData, setApplicantData] = useState<{ month: string; count: number }[]>([]);
  const [articleData, setArticleData] = useState<{ month: string; count: number }[]>([]);
  const [companyData, setCompanyData] = useState<{ companyName: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEmployer, setIsEmployer] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const user = await authService.getUserInfo();
        setIsEmployer(user.roleName === 'EMPLOYER');
      } catch {
        setIsEmployer(false);
      }
    };
    checkRole();
  }, []);

  useEffect(() => {
    if (isEmployer) {
      fetchAllData(year);
    }
    // eslint-disable-next-line
  }, [year, isEmployer]);

  const fetchAllData = async (selectedYear: number) => {
    setLoading(true);
    try {
      const [applicantRes, articleRes, companyRes] = await Promise.all([
        jobService.getApplicantCountByDate(selectedYear),
        jobService.getArticleCountByDate(selectedYear),
        jobService.getArticleCountByCompany(selectedYear),
      ]);
      setApplicantData(applicantRes || []);
      setArticleData(articleRes || []);
      setCompanyData(companyRes || []);
    } catch (error) {
      message.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (!isEmployer) {
    return <div style={{ textAlign: 'center', marginTop: 100 }}><Title level={2}>Access Denied</Title></div>;
  }

  // Chuẩn hóa dữ liệu 12 tháng
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));

  console.log('API applicantData:', applicantData);
  console.log('API articleData:', articleData);
  console.log('API companyData:', companyData);

  const normalizedApplicantData = months.map(month => {
    const found = applicantData.find(d => String(d.month).padStart(2, '0') === month);
    return { month, count: found ? found.count : 0 };
  });
  console.log('Normalized applicantData:', normalizedApplicantData);

  const normalizedArticleData = months.map(month => {
    const found = articleData.find(d => String(d.month).padStart(2, '0') === month);
    return { month, count: found ? found.count : 0 };
  });
  console.log('Normalized articleData:', normalizedArticleData);

  console.log('Company chart data:', companyData);

  // Chart data
  const applicantChartData = {
    labels: normalizedApplicantData.map(d => getMonthName(d.month)),
    datasets: [
      {
        label: 'Applicants',
        data: normalizedApplicantData.map(d => d.count),
        backgroundColor: '#1890ff',
        borderRadius: { topLeft: 10, topRight: 10, bottomLeft: 0, bottomRight: 0 },
        borderSkipped: false,
        maxBarThickness: 28,
      },
    ],
  };

  const articleChartData = {
    labels: normalizedArticleData.map(d => getMonthName(d.month)),
    datasets: [
      {
        label: 'Articles',
        data: normalizedArticleData.map(d => d.count),
        fill: false,
        borderColor: '#52c41a',
        backgroundColor: '#b7eb8f',
        tension: 0.3,
      },
    ],
  };

  const companyChartData = {
    labels: companyData.map(d => d.companyName),
    datasets: [
      {
        label: 'Articles by Company',
        data: companyData.map(d => d.count),
        backgroundColor: [
          '#1890ff', '#52c41a', '#faad14', '#eb2f96', '#722ed1', '#13c2c2', '#f5222d', '#a0d911', '#fa8c16', '#b37feb'
        ],
      },
    ],
  };

  return (
    <div style={{ padding: 32 }}>
      <Title level={1} style={{ textAlign: 'center' }}>Dashboard</Title>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
        <Select value={year} onChange={setYear} style={{ width: 120 }}>
          {yearOptions.map(y => (
            <Select.Option key={y} value={y}>{y}</Select.Option>
          ))}
        </Select>
      </div>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card title="Applicant statistic" loading={loading}>
            <Bar
              data={applicantChartData}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: { color: '#595959', font: { size: 13 } }
                  },
                  y: {
                    min: 0,
                    grid: { color: '#f0f0f0' },
                    ticks: { color: '#595959', font: { size: 13 } }
                  }
                }
              }}
              height={140}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Article statistic" loading={loading}>
            <Line
              data={articleChartData}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                  y: {
                    min: 0
                  }
                }
              }}
              height={140}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Article statistic by company" loading={loading}>
            <Pie data={companyChartData} options={{ responsive: true, maintainAspectRatio: false }} height={230} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EmployerDashboardPage; 