import React from 'react';
import { Layout, Typography } from 'antd';

const { Footer: AntFooter } = Layout;
const { Text } = Typography;

const Footer: React.FC = () => {
  return (
    <AntFooter style={{ 
      textAlign: 'center',
      padding: '24px',
      backgroundColor: '#f0f2f5'
    }}>
      <Text>© 2024 Job Portal. All rights reserved.</Text>
    </AntFooter>
  );
};

export default Footer; 