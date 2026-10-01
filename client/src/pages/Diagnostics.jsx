import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Activity, AlertTriangle, ShieldCheck, Database, RefreshCw, ChevronLeft, Search } from 'lucide-react';
import Header from '../components/common/Header';

export default function Diagnostics() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getDiagnosticLogs({ 
        limit: 100, 
        type: filter === 'all' ? null : filter 
      });
      setLogs(data);
    } catch (err) {
      console.error('Failed to load diagnostic logs:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadLogs();
  }, [filter]);

  const filteredLogs = logs.filter(log => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    const details = typeof log.details === 'string' ? log.details : JSON.stringify(log.details);
    return details.toLowerCase().includes(searchLower) || 
           log.survey_id?.toLowerCase().includes(searchLower) ||
           log.survey_responses?.schools?.name?.toLowerCase().includes(searchLower);
  });

  const getActionColor = (action) => {
    if (action.includes('error') || action.includes('fail')) return '#dc2626';
    if (action.includes('submit')) return '#16a34a';
    if (action.includes('update')) return '#2563eb';
    return '#4b5563';
  };

  const getActionIcon = (action) => {
    if (action.includes('error') || action.includes('fail')) return <AlertTriangle size={16} />;
    if (action.includes('submit')) return <ShieldCheck size={16} />;
    return <Database size={16} />;
  };

  return (
    <div className="dashboard-container" style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Header />
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <button 
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>System Diagnostics</h1>
            <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '14px' }}>Monitor system health, survey saves, and data integrity</p>
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '16px',
          marginBottom: '24px',
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '300px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search reference IDs, schools, errors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                }}
              />
            </div>
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                background: 'white'
              }}
            >
              <option value="all">All Events</option>
              <option value="save_error">Errors Only</option>
              <option value="updated">Saves</option>
              <option value="submitted">Submissions</option>
            </select>
            
            <button
              onClick={loadLogs}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              <RefreshCw size={24} className="spin-animation" style={{ margin: '0 auto 12px auto' }} />
              <p>Loading diagnostics data...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              <Activity size={32} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
              <p>No diagnostic logs found matching your criteria.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '12px 16px', fontWeight: '600', color: '#475569' }}>Time</th>
                    <th style={{ padding: '12px 16px', fontWeight: '600', color: '#475569' }}>Action</th>
                    <th style={{ padding: '12px 16px', fontWeight: '600', color: '#475569' }}>School</th>
                    <th style={{ padding: '12px 16px', fontWeight: '600', color: '#475569' }}>Details</th>
                    <th style={{ padding: '12px 16px', fontWeight: '600', color: '#475569' }}>Ref ID</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => {
                    let detailsObj = log.details;
                    if (typeof detailsObj === 'string') {
                      try { detailsObj = JSON.parse(detailsObj); } catch(e) { /* ignore */ }
                    }
                    
                    const color = getActionColor(log.action);
                    
                    return (
                      <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', color: '#64748b' }}>
                          {new Date(log.created_at).toLocaleString('hi-IN', {
                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit'
                          })}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: `${color}15`,
                            color: color,
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontWeight: '600',
                            fontSize: '12px'
                          }}>
                            {getActionIcon(log.action)}
                            {log.action.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: '500' }}>
                          {log.survey_responses?.schools?.name || 'Unknown'}
                          <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>
                            {log.survey_id?.substring(0, 8)}...
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', maxWidth: '300px' }}>
                          <div style={{ 
                            background: '#f8fafc', 
                            padding: '8px', 
                            borderRadius: '4px',
                            border: '1px solid #e2e8f0',
                            maxHeight: '100px',
                            overflowY: 'auto',
                            fontFamily: 'monospace',
                            fontSize: '11px',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word'
                          }}>
                            {typeof detailsObj === 'object' 
                              ? JSON.stringify(detailsObj, null, 2)
                              : String(log.details)}
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#64748b' }}>
                          {detailsObj?.errorRef || detailsObj?.referenceId || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
