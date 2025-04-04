import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import JobPostPage from './pages/JobPostPage';

import './App.css';

const App: React.FC = () => {
  return (
    <ConfigProvider locale={enUS}>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/job-post" element={<JobPostPage />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
};

export default App;
