import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Briefcase, School, AlertTriangle, Plus, ChevronRight, CheckCircle, Clock, Download, Sparkles, Database } from 'lucide-react';
import { api } from '../services/api';
import { downloadSurveysAsJson, downloadSurveysAsCsv } from '../utils/aiExporter';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [surveys, setSurveys] = useState([]);
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportingJson, setExportingJson] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [showAiGuide, setShowAiGuide] = useState(false);
  const [schoolTypeFilter, setSchoolTypeFilter] = useState('All');

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

  const handleExportJson = async () => {
    try {
      setExportingJson(true);
      await downloadSurveysAsJson();
    } catch (err) {
      alert('JSON निर्यात में त्रुटि: ' + err.message);
    } finally {
      setExportingJson(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      setExportingCsv(true);
      await downloadSurveysAsCsv();
    } catch (err) {
      alert('CSV निर्यात में त्रुटि: ' + err.message);
    } finally {
      setExportingCsv(false);
    }
  };

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

  const filteredSurveys = schoolTypeFilter === 'All' 
    ? surveys 
    : surveys.filter(s => {
        const data = s.survey_data ? (typeof s.survey_data === 'string' ? JSON.parse(s.survey_data) : s.survey_data) : {};
        return data.q1 === schoolTypeFilter;
      });

  return (
    <div className="dashboard-container">
      <div className="dashboard-header flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{color: 'var(--primary-900)'}}>डैशबोर्ड</h2>
          <p className="text-gray-600">विद्यालय सर्वेक्षण एवं कार्य प्रबंधन प्रणाली</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-primary" onClick={() => navigate('/survey/new')}>
            <Plus size={20} /> नया सर्वे शुरू करें
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard title="कुल विद्यालय" value={stats?.totalSchools || 0} icon={<School size={32} />} color="var(--primary-600)" />
        <StatCard title="कुल सर्वे" value={stats?.totalSurveys || 0} icon={<FileText size={32} />} color="var(--accent-600)" />
        <StatCard title="जमा किए गए सर्वे" value={stats?.completedSurveys || 0} icon={<CheckCircle size={32} />} color="var(--success-600)" />
        <StatCard title="लंबित कार्य" value={stats?.pendingWorks || 0} icon={<AlertTriangle size={32} />} color="var(--warning-600)" />
      </div>

      {/* AI Export & Analysis Card */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)',
        border: '1.5px solid var(--primary-300, #b0cbe8)',
        borderRadius: '12px',
        padding: '20px 24px',
        marginBottom: '24px',
        boxShadow: '0 4px 12px rgba(37, 99, 168, 0.08)'
      }}>
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px'}}>
              <span style={{
                background: 'linear-gradient(135deg, #1e4d8a, #2563a8)',
                color: '#fff',
                padding: '4px 8px',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                fontWeight: 700
              }}>
                <Sparkles size={14} /> AI Analysis Ready
              </span>
              <h3 style={{fontSize: '17px', fontWeight: 700, margin: 0, color: 'var(--primary-900)'}}>
                AI हेतु संपूर्ण सर्वे डेटा निर्यात करें (Export for AI)
              </h3>
            </div>
            <p style={{fontSize: '13px', color: 'var(--gray-600)', margin: 0}}>
              कक्षा-कक्ष (2023 तक, नए, कुल), छात्रानुपात आवश्यकता (30 छात्र/कक्ष), मरम्मत योग्य भवन व सभी विवरण सीधे AI-रेडी फॉर्मेट में डाउनलोड करें।
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleExportJson}
              disabled={exportingJson}
              className="btn btn-outline"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#fff',
                fontWeight: 600,
                fontSize: '13px'
              }}
            >
              <Download size={16} />
              {exportingJson ? 'डाउनलोड हो रहा है...' : 'JSON (ChatGPT / Claude)'}
            </button>

            <button
              onClick={handleExportCsv}
              disabled={exportingCsv}
              className="btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--primary-700)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '13px'
              }}
            >
              <Download size={16} />
              {exportingCsv ? 'डाउनलोड हो रहा है...' : 'CSV (Excel / Data Analysis)'}
            </button>

            <button
              onClick={() => setShowAiGuide(!showAiGuide)}
              className="btn btn-sm btn-ghost"
              style={{fontSize: '13px', color: 'var(--primary-700)', textDecoration: 'underline'}}
            >
              {showAiGuide ? 'गाइड छिपाएँ' : 'AI प्रॉम्प्ट गाइड देखें'}
            </button>
          </div>
        </div>

        {/* Expandable AI Prompt Guide */}
        {showAiGuide && (
          <div style={{
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid var(--gray-200)',
            fontSize: '13px',
            color: 'var(--gray-700)'
          }}>
            <strong style={{color: 'var(--primary-900)'}}>💡 ChatGPT / Gemini / Claude में डेटा अपलोड करके ये सवाल पूछें:</strong>
            <ul style={{marginTop: '8px', paddingLeft: '20px', lineHeight: 1.6}}>
              <li><em>"इस JSON/CSV फाइल का विश्लेषण करो और 30 छात्र प्रति कक्ष के नियम के अनुसार सबसे अधिक कमरों की कमी वाले टॉप 10 स्कूलों की सूची बनाओ।"</em></li>
              <li><em>"मरम्मत योग्य भवनों की कुल संख्या और बजट का अनुमानित आकलन तैयार करो।"</em></li>
              <li><em>"गाँव/ग्राम पंचायत वार इंफ्रास्ट्रक्चर की प्राथमिकता रैंकिंग (Priority Ranking) रिपोर्ट तैयार करो।"</em></li>
            </ul>
          </div>
        )}
      </div>

      <div className="dashboard-columns">
        {/* Recent Surveys */}
        <div className="dashboard-col">
          <div className="card">
            <div className="card-header flex justify-between items-center flex-wrap gap-2">
              <h3 className="card-title m-0">सर्वे सूची</h3>
              <div className="flex items-center gap-2">
                <select 
                  className="form-input" 
                  style={{ padding: '4px 8px', fontSize: '13px', width: 'auto' }}
                  value={schoolTypeFilter}
                  onChange={e => setSchoolTypeFilter(e.target.value)}
                >
                  <option value="All">सभी विद्यालय</option>
                  <option value="प्राथमिक विद्यालय">प्राथमिक</option>
                  <option value="उच्च प्राथमिक विद्यालय">उच्च प्राथमिक</option>
                  <option value="माध्यमिक विद्यालय">माध्यमिक</option>
                  <option value="उच्च माध्यमिक विद्यालय">उच्च माध्यमिक</option>
                </select>
                <button className="btn-icon text-sm" style={{color:'var(--primary-600)'}}>सभी देखें</button>
              </div>
            </div>
            <div className="list-group">
              {filteredSurveys.length === 0 ? (
                <div className="text-center p-4 text-gray-500">कोई सर्वे नहीं है।</div>
              ) : filteredSurveys.map(s => (
                <div key={s.id} className="list-item flex justify-between items-center p-4 border-b">
                  <div>
                    <div className="font-bold text-gray-800">{s.school_name}</div>
                    <div className="text-sm text-gray-500">{s.village} • UDISE: {s.udise_code}{s.school_code ? ` • कोड: ${s.school_code}` : ''}</div>
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
