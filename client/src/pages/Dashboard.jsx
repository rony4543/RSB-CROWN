import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Briefcase, School, AlertTriangle, Plus, ChevronRight, CheckCircle, Clock } from 'lucide-react';
import { api } from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [surveys, setSurveys] = useState([]);
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [statsData, surveysData, worksData] = await Promise.all([
          api.getStats(),
          api.getSurveys({ limit: 5 }),
          api.getWorks({ limit: 5 })
        ]);
        setStats(statsData);
        setSurveys(surveysData.surveys);
        setWorks(worksData.works);
      } catch (err) {
        console.error('Error loading dashboard:', err);
      }
      setLoading(false);
    }
    loadDashboard();
  }, []);

  if (loading) return <div className="p-8">लोड हो रहा है...</div>;

  const StatCard = ({ title, value, icon, color }) => (
    <div className="stat-card" style={{ borderTop: `4px solid ${color}` }}>
      <div className="stat-card-icon" style={{ color }}>{icon}</div>
      <div className="stat-card-info">
        <div className="stat-card-value">{value}</div>
        <div className="stat-card-title">{title}</div>
      </div>
    </div>
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-header flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{color: 'var(--primary-900)'}}>डैशबोर्ड</h2>
          <p className="text-gray-600">विद्यालय सर्वेक्षण एवं कार्य प्रबंधन प्रणाली</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/survey/new')}>
          <Plus size={20} /> नया सर्वे शुरू करें
        </button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard title="कुल विद्यालय" value={stats?.totalSchools || 0} icon={<School size={32} />} color="var(--primary-600)" />
        <StatCard title="कुल सर्वे" value={stats?.totalSurveys || 0} icon={<FileText size={32} />} color="var(--accent-600)" />
        <StatCard title="जमा किए गए सर्वे" value={stats?.completedSurveys || 0} icon={<CheckCircle size={32} />} color="var(--success-600)" />
        <StatCard title="लंबित कार्य" value={stats?.pendingWorks || 0} icon={<AlertTriangle size={32} />} color="var(--warning-600)" />
      </div>

      <div className="dashboard-columns">
        {/* Recent Surveys */}
        <div className="dashboard-col">
          <div className="card">
            <div className="card-header flex justify-between items-center">
              <h3 className="card-title m-0">हाल ही के सर्वे</h3>
              <button className="btn-icon text-sm" style={{color:'var(--primary-600)'}}>सभी देखें</button>
            </div>
            <div className="list-group">
              {surveys.length === 0 ? (
                <div className="text-center p-4 text-gray-500">कोई सर्वे नहीं है।</div>
              ) : surveys.map(s => (
                <div key={s.id} className="list-item flex justify-between items-center p-4 border-b">
                  <div>
                    <div className="font-bold text-gray-800">{s.school_name}</div>
                    <div className="text-sm text-gray-500">{s.village} • UDISE: {s.udise_code}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`status-badge ${s.status === 'submitted' ? 'success' : 'draft'}`}>
                      {s.status === 'submitted' ? 'जमा' : 'ड्राफ्ट'}
                    </span>
                    <button className="btn btn-sm btn-outline" onClick={() => navigate(`/survey/edit/${s.id}`)}>
                      खोलें
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Works */}
        <div className="dashboard-col">
          <div className="card">
            <div className="card-header flex justify-between items-center">
              <h3 className="card-title m-0">हाल ही के कार्य (Works)</h3>
              <button className="btn-icon text-sm" style={{color:'var(--primary-600)'}}>सभी देखें</button>
            </div>
            <div className="list-group">
              {works.length === 0 ? (
                <div className="text-center p-4 text-gray-500">कोई कार्य नहीं है।</div>
              ) : works.map(w => (
                <div key={w.id} className="list-item p-4 border-b">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold text-gray-800" style={{maxWidth: '70%'}}>{w.title}</div>
                    <span className={`status-badge ${w.priority}`}>{w.priority === 'high' ? 'उच्च' : w.priority === 'low' ? 'निम्न' : 'मध्यम'}</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">{w.school_name} ({w.village})</div>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Clock size={12}/> {new Date(w.created_at).toLocaleDateString('hi-IN')}</span>
                    <span style={{color: 'var(--accent-600)', fontWeight: 600}}>{w.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
