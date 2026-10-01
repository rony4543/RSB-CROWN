import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, AlertTriangle, ChevronRight, ChevronLeft, Save, Check, WifiOff, RefreshCw, Loader2 } from 'lucide-react';
import { useSurvey, SAVE_STATES } from '../context/SurveyContext';
import { SECTIONS } from '../utils/constants';
import { api } from '../services/api';
import { GradientBackground } from '../components/ui/favorites';

// Components
import SchoolProfile from '../components/survey/SchoolProfile';
import AcademicSection from '../components/survey/AcademicSection';
import SpecialStatusSection from '../components/survey/SpecialStatusSection';
import StaffSection from '../components/survey/StaffSection';
import BuildingSection from '../components/survey/BuildingSection';
import ElectricitySection from '../components/survey/ElectricitySection';
import LabsSection from '../components/survey/LabsSection';
import BoundarySection from '../components/survey/BoundarySection';
import RoadSection from '../components/survey/RoadSection';
import ToiletWaterSection from '../components/survey/ToiletWaterSection';
import EnrollmentSection from '../components/survey/EnrollmentSection';
import StudentsSection from '../components/survey/StudentsSection';
import SmartLandSection from '../components/survey/SmartLandSection';
import CommitteesSection from '../components/survey/CommitteesSection';
import ExamsSection from '../components/survey/ExamsSection';
import RequirementsSection from '../components/survey/RequirementsSection';
import ReviewSection from '../components/survey/ReviewSection';
import Header from '../components/common/Header';

import { validateSection } from '../utils/validation';

// ============================================
// SAVE STATUS INDICATOR COMPONENT
// Shows current save state clearly to the user
// ============================================
function SaveStatusIndicator({ saveState, lastSaved, lastSaveError, lastSaveErrorRef, onRetry }) {
  const configs = {
    [SAVE_STATES.IDLE]: { text: '', icon: null, color: 'transparent', bg: 'transparent' },
    [SAVE_STATES.UNSAVED]: { text: 'बदलाव सेव नहीं हुए', icon: <AlertTriangle size={14} />, color: '#d97706', bg: '#fffbeb' },
    [SAVE_STATES.SAVING]: { text: 'सेव हो रहा है...', icon: <Loader2 size={14} className="spin-animation" />, color: '#2563eb', bg: '#eff6ff' },
    [SAVE_STATES.SAVED]: { text: lastSaved ? `सेव हो गया — ${formatTime(lastSaved)}` : 'सेव हो गया', icon: <Check size={14} />, color: '#16a34a', bg: '#f0fdf4' },
    [SAVE_STATES.SAVE_FAILED]: { text: 'सेव नहीं हुआ — पुनः प्रयास करें', icon: <AlertTriangle size={14} />, color: '#dc2626', bg: '#fef2f2' },
    [SAVE_STATES.OFFLINE]: { text: 'ऑफलाइन — स्थानीय रूप से सुरक्षित', icon: <WifiOff size={14} />, color: '#9333ea', bg: '#faf5ff' },
    [SAVE_STATES.SUBMITTING]: { text: 'जमा हो रहा है...', icon: <Loader2 size={14} className="spin-animation" />, color: '#2563eb', bg: '#eff6ff' },
    [SAVE_STATES.SUBMITTED]: { text: 'सर्वे जमा हो चुका है', icon: <CheckCircle size={14} />, color: '#16a34a', bg: '#f0fdf4' },
  };

  const config = configs[saveState] || configs[SAVE_STATES.IDLE];
  if (!config.text) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '6px 14px',
      borderRadius: '20px',
      background: config.bg,
      color: config.color,
      fontSize: '13px',
      fontWeight: '600',
      border: `1px solid ${config.color}22`,
      transition: 'all 0.3s ease',
      flexShrink: 0,
    }}>
      {config.icon}
      <span>{config.text}</span>
      {(saveState === SAVE_STATES.SAVE_FAILED || saveState === SAVE_STATES.OFFLINE) && onRetry && (
        <button 
          onClick={onRetry}
          style={{
            background: 'none',
            border: 'none',
            color: config.color,
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
          }}
          title="पुनः प्रयास करें"
        >
          <RefreshCw size={14} />
        </button>
      )}
      {lastSaveErrorRef && (saveState === SAVE_STATES.SAVE_FAILED) && (
        <span style={{ fontSize: '10px', opacity: 0.7, fontFamily: 'monospace' }}>
          {lastSaveErrorRef}
        </span>
      )}
    </div>
  );
}

function formatTime(date) {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  if (diffMs < 60000) return 'अभी';
  if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)} मिनट पहले`;
  return d.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' });
}

export default function SurveyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch, saveToServer, setField, isOnline } = useSurvey();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        if (id) {
          // Edit existing survey
          const data = await api.getSurvey(id);
          dispatch({ type: 'LOAD_SURVEY', data });
        } else {
          // Check for draft in localStorage
          const savedDraft = localStorage.getItem('jankali_survey_draft');
          if (savedDraft) {
            const parsed = JSON.parse(savedDraft);
            if (parsed.status !== 'submitted') {
              dispatch({ type: 'RESTORE_DRAFT', payload: parsed });
            }
          }
        }
      } catch (err) {
        console.error('Failed to load survey', err);
      }
      setLoading(false);
    }
    loadData();
  }, [id, dispatch]);

  if (loading) {
    return <div className="p-8">लोड हो रहा है...</div>;
  }

  const handleNext = async () => {
    const currentSectionKey = SECTIONS[state.currentSection].key;
    const errors = validateSection(currentSectionKey, state);

    if (Object.keys(errors).length > 0) {
      dispatch({ type: 'SET_ERRORS', errors });
      // Scroll to the first error or top
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return; // Block navigation
    } else {
      // Clear errors if valid
      dispatch({ type: 'SET_ERRORS', errors: {} });
    }

    if (state.currentSection === 0 && !state.surveyId) {
      try {
        const { surveyId, schoolId } = await api.createSurvey(state.school);
        dispatch({ type: 'SET_SURVEY_META', surveyId, schoolId, status: 'draft' });
      } catch (err) {
        if (err.message && err.message.includes('एक अकाउंट से केवल एक ही')) {
          alert(err.message);
          return; // Block progression
        }
        console.warn('Server unavailable or offline, continuing in local mode:', err);
        const localSurveyId = 'local_' + Date.now();
        const localSchoolId = 'school_' + Date.now();
        dispatch({ type: 'SET_SURVEY_META', surveyId: localSurveyId, schoolId: localSchoolId, status: 'draft' });
      }
    }

    // Save data when navigating to next section
    if (state.surveyId && state.status === 'draft') {
      saveToServer();
    }

    if (state.currentSection < SECTIONS.length - 1) {
      dispatch({ type: 'SET_SECTION', section: state.currentSection + 1 });
      window.scrollTo(0, 0);
    }
  };

  const handlePrev = () => {
    if (state.currentSection > 0) {
      dispatch({ type: 'SET_SECTION', section: state.currentSection - 1 });
      window.scrollTo(0, 0);
    }
  };

  const renderSection = () => {
    switch (SECTIONS[state.currentSection].key) {
      case 'school_profile': return <SchoolProfile />;
      case 'academic': return <AcademicSection />;
      case 'special_status': return <SpecialStatusSection />;
      case 'staff': return <StaffSection />;
      case 'building': return <BuildingSection />;
      case 'electricity': return <ElectricitySection />;
      case 'labs': return <LabsSection />;
      case 'boundary': return <BoundarySection />;
      case 'road': return <RoadSection />;
      case 'toilet_water': return <ToiletWaterSection />;
      case 'enrollment': return <EnrollmentSection />;
      case 'students': return <StudentsSection />;
      case 'smart_land': return <SmartLandSection />;
      case 'committees': return <CommitteesSection />;
      case 'exams': return <ExamsSection />;
      case 'requirements': return <RequirementsSection />;
      case 'review': return <ReviewSection />;
      default: return <div>Unknown Section</div>;
    }
  };

  return (
    <div className="survey-container">
      {/* 21st.dev Gradient Background */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none' }}>
        <GradientBackground />
      </div>

      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header />

        <div className="survey-layout">
        {/* Main Content Area (Full Page) */}
        <div className="survey-content-area">
          {/* Gaming Style Progress Bar */}
          <div className="gaming-stepper-container">
            {/* Header info bar */}
            <div className="gaming-meta-bar">
              <div className="gaming-level-badge">
                STAGE {state.currentSection + 1}
              </div>
              <div className="gaming-mission-title">
                {SECTIONS[state.currentSection].title}
              </div>
              <div className="gaming-completion-stats">
                {Math.round(((state.currentSection + 1) / SECTIONS.length) * 100)}%
              </div>
            </div>

            {/* Segmented Energy Track */}
            <div className="energy-track">
              {SECTIONS.map((section, idx) => {
                const isActive = state.currentSection === idx;
                const isCompleted = state.currentSection > idx;
                const isClickable = idx < state.currentSection; // Only allow clicking backward

                return (
                  <div
                    key={section.id}
                    className={`energy-segment ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isClickable ? 'clickable' : ''}`}
                    onClick={() => {
                      if (isClickable) {
                        dispatch({ type: 'SET_SECTION', section: idx });
                        window.scrollTo(0, 0);
                      }
                    }}
                    title={`${idx + 1}. ${section.shortTitle}`}
                  >
                    {isActive && <div className="energy-glow-pulse" />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="survey-content-inner">
            {renderSection()}
          </div>

          {/* Bottom Navigation with Save Status */}
          {state.status !== 'submitted' && (
            <div className="survey-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <button 
                className="btn btn-outline" 
                onClick={handlePrev} 
                disabled={state.currentSection === 0}
              >
                <ChevronLeft size={20} /> पिछला
              </button>

              {/* Save Status Indicator */}
              <SaveStatusIndicator 
                saveState={state.saveState}
                lastSaved={state.lastSaved}
                lastSaveError={state.lastSaveError}
                lastSaveErrorRef={state.lastSaveErrorRef}
                onRetry={saveToServer}
              />
              
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {/* Manual Save Button */}
                {state.surveyId && state.saveState !== SAVE_STATES.SAVING && state.currentSection < SECTIONS.length - 1 && (
                  <button 
                    className="btn btn-outline"
                    onClick={saveToServer}
                    disabled={state.saveState === SAVE_STATES.SAVING || state.saveState === SAVE_STATES.SAVED}
                    style={{ fontSize: '14px', padding: '8px 14px' }}
                  >
                    <Save size={16} /> सेव
                  </button>
                )}

                {state.currentSection < SECTIONS.length - 1 ? (
                  <button className="btn btn-primary" onClick={handleNext}>
                    अगला <ChevronRight size={20} />
                  </button>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
