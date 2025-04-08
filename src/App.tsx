import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import JobPostPage from './pages/JobPostPage';
import ProfilePage from './pages/ProfilePage';
import MyJobPostsPage from './pages/MyJobPostsPage';
import MainLayout from './components/layout/MainLayout';

import './App.css';

const App: React.FC = () => {
  return (
    <ConfigProvider locale={enUS}>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={
            <MainLayout>
              <HomePage />
            </MainLayout>
          } />
          <Route path="/job-post" element={
            <MainLayout>
              <JobPostPage />
            </MainLayout>
          } />
          <Route path="/profile" element={
            <MainLayout>
              <ProfilePage />
            </MainLayout>
          } />
          <Route path="/my-job-posts" element={
            <MainLayout>
              <MyJobPostsPage />
            </MainLayout>
          } />
        </Routes>
      </Router>
    </ConfigProvider>
  );
};

export default App;
