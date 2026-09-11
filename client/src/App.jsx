import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Home, FileText, Settings, BarChart2 } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import SurveyForm from './pages/SurveyForm';
import Login from './pages/Login';
import { SurveyProvider } from './context/SurveyContext';

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
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/survey/new" element={
            <SurveyProvider>
              <SurveyForm />
            </SurveyProvider>
          } />
          <Route path="/survey/edit/:id" element={
            <SurveyProvider>
              <SurveyForm />
            </SurveyProvider>
          } />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
