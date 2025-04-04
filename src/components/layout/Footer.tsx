import React from 'react';
import { Layout, Typography } from 'antd';

const { Footer: AntFooter } = Layout;
const { Text } = Typography;

const Footer: React.FC = () => {
  return (
    <AntFooter className="footer">
      <Text>© 2024 Job Portal. All rights reserved.</Text>
    </AntFooter>
  );
};

export default Footer; 