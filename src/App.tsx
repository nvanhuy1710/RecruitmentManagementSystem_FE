import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import JobPostPage from './pages/JobPostPage';
import MyJobPostsPage from './pages/MyJobPostsPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import { AuthProvider } from './contexts/AuthContext';

import './App.css';

function App() {
  return (
    <ConfigProvider locale={enUS}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={<MainLayout children={<Outlet />} />}>
              <Route index element={<HomePage />} />
              <Route path="job-post" element={<JobPostPage />} />
              <Route path="my-job-posts" element={<MyJobPostsPage />} />
              <Route path="job-post/:id" element={<ArticleDetailPage />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
