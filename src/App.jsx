import React from 'react';
import { Routes, Route, Navigate, useLocation, matchPath } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StudentProfilePage from './pages/StudentProfilePage';
import AssessmentPage from './pages/AssessmentPage';
import ProgressPage from './pages/ProgressPage';
import InterventionPage from './pages/InterventionPage';
import ReportPage from './pages/ReportPage';
import GoalLibraryPage from './pages/GoalLibraryPage';
import SurveyPage from './pages/SurveyPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminRoute from './components/AdminRoute';

const APP_NAME = 'Cognify Care';

const getPageTitle = (pathname) => {
  const routeTitles = [
    { pattern: '/login', title: 'Login' },
    { pattern: '/dashboard', title: 'Dashboard' },
    { pattern: '/student/new', title: 'New Student' },
    { pattern: '/student/:id', title: 'Student Profile' },
    { pattern: '/assessment/:id', title: 'Assessment' },
    { pattern: '/progress/:id', title: 'Progress' },
    { pattern: '/intervention/:id', title: 'Intervention' },
    { pattern: '/report/:id', title: 'Report' },
    { pattern: '/survey', title: 'Survey' },
    { pattern: '/admin', title: 'Admin Dashboard' },
    { pattern: '/admin/goals', title: 'Goal Library' },
  ];

  const matchedRoute = routeTitles.find(({ pattern }) =>
    Boolean(matchPath({ path: pattern, end: true }, pathname))
  );

  return matchedRoute ? `${matchedRoute.title} | ${APP_NAME}` : APP_NAME;
};

const App = () => {
  const location = useLocation();

  React.useEffect(() => {
    document.title = getPageTitle(location.pathname);
  }, [location.pathname]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route path="/" element={<ProtectedRoute />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="student/new" element={<StudentProfilePage />} />
        <Route path="student/:id" element={<StudentProfilePage />} />
        <Route path="assessment/:id" element={<AssessmentPage />} />
        <Route path="progress/:id" element={<ProgressPage />} />
        <Route path="intervention/:id" element={<InterventionPage />} />
        <Route path="report/:id" element={<ReportPage />} />
        <Route path="survey" element={<SurveyPage />} />
      </Route>

      <Route path="/admin" element={<AdminRoute />}>
        <Route index element={<AdminDashboard />} />
        <Route path="goals" element={<GoalLibraryPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
