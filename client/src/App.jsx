import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import SurveyForm from './pages/SurveyForm';
import Login from './pages/Login';
import { SurveyProvider } from './context/SurveyContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

import './index.css';

function Layout({ children }) {
  return (
    <div className="app-layout">
      <main className="app-main">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/survey/new" element={
              <ProtectedRoute>
                <SurveyProvider>
                  <SurveyForm />
                </SurveyProvider>
              </ProtectedRoute>
            } />
            <Route path="/survey/edit/:id" element={
              <ProtectedRoute>
                <SurveyProvider>
                  <SurveyForm />
                </SurveyProvider>
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}
