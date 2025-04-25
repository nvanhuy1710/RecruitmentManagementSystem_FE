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
import ReviewArticlesPage from './pages/ReviewArticlesPage';
import ReviewArticleDetailPage from './pages/ReviewArticleDetailPage';
import { AuthProvider } from './contexts/AuthContext';

import './App.css';
import ProfilePage from './pages/ProfilePage';
import ViewArticlePage from './pages/ViewArticlePage';
import ApplyJobPage from './pages/ApplyJobPage';
import MyApplicationsPage from './pages/MyApplicationsPage';
import ApplicationDetailPage from './pages/ApplicationDetailPage';
import ApplicantsPage from './pages/ApplicantsPage';
import UsersManagementPage from './pages/UsersManagementPage';

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
              <Route path="profile" element={<ProfilePage />} />
              <Route path="post-job" element={<JobPostPage />} />
              <Route path="my-job-posts" element={<MyJobPostsPage />} />
              <Route path="job-post/:id" element={<ArticleDetailPage />} />
              <Route path="review-articles" element={<ReviewArticlesPage />} />
              <Route path="review-article/:id" element={<ReviewArticleDetailPage />} />
              <Route path="view-article/:id" element={<ViewArticlePage />} />
              <Route path="/apply-job/:id" element={<ApplyJobPage />} />
              <Route path="my-applications" element={<MyApplicationsPage />} />
              <Route path="/application/:id" element={<ApplicationDetailPage />} />
              <Route path="applicants" element={<ApplicantsPage />} />
              <Route path="users" element={<UsersManagementPage />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
