import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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

const App = () => {
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

      <Route path="/admin" element={<ProtectedRoute requiredRole="admin" />}>
        <Route index element={<AdminDashboard />} />
        <Route path="goals" element={<GoalLibraryPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
