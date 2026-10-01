import { createContext, useContext, useReducer, useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import { STAFF_POSTS, CLASSES } from '../utils/constants';

const SurveyContext = createContext(null);

// ============================================
// SAVE STATE CONSTANTS
// ============================================
export const SAVE_STATES = {
  IDLE: 'idle',             // No changes since last save
  UNSAVED: 'unsaved',       // Changes exist, not yet saved
  SAVING: 'saving',         // Save in progress
  SAVED: 'saved',           // Successfully saved to server
  SAVE_FAILED: 'save_failed', // Save failed, data in localStorage
  OFFLINE: 'offline',       // Network unavailable, data in localStorage
  SUBMITTING: 'submitting', // Submit in progress
  SUBMITTED: 'submitted',   // Successfully submitted
};

const initialSchool = {
  name: '', village: '', gram_panchayat: '', panchayat_samiti: '',
  udise_code: '', school_code: '', principal_name: '', principal_mobile: '', principal_email: ''
};

const initialState = {
  surveyId: null,
  schoolId: null,
  school: { ...initialSchool },
  surveyData: {},
  currentSection: 0,
  status: 'new', // new, draft, submitted
  lastSaved: null,
  // Save state tracking
  saveState: SAVE_STATES.IDLE,
  lastSaveError: null,
  lastSaveErrorRef: null,
  saving: false, // backward compat
  errors: {},
  // Related tables
  staffPositions: STAFF_POSTS.map(p => ({ post_name: p, sanctioned: '', working: '', vacant: '', remarks: '' })),
  staffMembers: Array.from({ length: 10 }, () => ({ name: '', staff_id: '', post: '', subject: '', mobile: '', email: '' })),
  studentEnrollment: CLASSES.map(c => ({ class_name: `कक्षा ${c}`, boys: '', girls: '', total: '' })),
  palanharStudents: Array.from({ length: 10 }, () => ({ student_name:'', class_name:'', palanhar_number:'', palanhar_category:'' })),
  disabledStudents: Array.from({ length: 10 }, () => ({ student_name:'', class_name:'', disability_type:'', percentage:'', certificate_number:'' })),
  playerStudents: Array.from({ length: 10 }, () => ({ student_name:'', class_name:'', sport:'', level:'' })),
  scoutNccStudents: Array.from({ length: 10 }, () => ({ student_name:'', class_name:'', level:'', details:'' })),
  labs: [],
  labRequirements: [],
  committeeMembers: [],
  panchayatMembers: [],
  examResults: [],
  requirements: [],
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_SCHOOL':
      return { ...state, school: { ...state.school, ...action.payload }, saveState: SAVE_STATES.UNSAVED };
    case 'SET_FIELD':
      return { ...state, surveyData: { ...state.surveyData, [action.key]: action.value }, saveState: SAVE_STATES.UNSAVED };
    case 'SET_SURVEY_DATA':
      return { ...state, surveyData: { ...state.surveyData, ...action.payload }, saveState: SAVE_STATES.UNSAVED };
    case 'SET_SECTION':
      return { ...state, currentSection: action.section };
    case 'SET_ERRORS':
      return { ...state, errors: action.errors };
    case 'CLEAR_ERRORS':
      return { ...state, errors: {} };
    case 'SET_STAFF_POSITIONS':
      return { ...state, staffPositions: action.payload, saveState: SAVE_STATES.UNSAVED };
    case 'SET_STAFF_MEMBERS':
      return { ...state, staffMembers: action.payload, saveState: SAVE_STATES.UNSAVED };
    case 'SET_STUDENT_ENROLLMENT':
      return { ...state, studentEnrollment: action.payload, saveState: SAVE_STATES.UNSAVED };
    case 'SET_PALANHAR':
      return { ...state, palanharStudents: action.payload, saveState: SAVE_STATES.UNSAVED };
    case 'SET_DISABLED':
      return { ...state, disabledStudents: action.payload, saveState: SAVE_STATES.UNSAVED };
    case 'SET_PLAYERS':
      return { ...state, playerStudents: action.payload, saveState: SAVE_STATES.UNSAVED };
    case 'SET_SCOUT_NCC':
      return { ...state, scoutNccStudents: action.payload, saveState: SAVE_STATES.UNSAVED };
    case 'SET_LABS':
      return { ...state, labs: action.payload, saveState: SAVE_STATES.UNSAVED };
    case 'SET_LAB_REQS':
      return { ...state, labRequirements: action.payload, saveState: SAVE_STATES.UNSAVED };
    case 'SET_COMMITTEE':
      return { ...state, committeeMembers: action.payload, saveState: SAVE_STATES.UNSAVED };
    case 'SET_PANCHAYAT':
      return { ...state, panchayatMembers: action.payload, saveState: SAVE_STATES.UNSAVED };
    case 'SET_EXAMS':
      return { ...state, examResults: action.payload, saveState: SAVE_STATES.UNSAVED };
    case 'SET_REQUIREMENTS':
      return { ...state, requirements: action.payload, saveState: SAVE_STATES.UNSAVED };

    // === SAVE STATE MANAGEMENT ===
    case 'SET_SAVE_STATE':
      return { 
        ...state, 
        saveState: action.saveState, 
        saving: action.saveState === SAVE_STATES.SAVING || action.saveState === SAVE_STATES.SUBMITTING,
        lastSaveError: action.saveState === SAVE_STATES.SAVED ? null : state.lastSaveError,
        lastSaveErrorRef: action.saveState === SAVE_STATES.SAVED ? null : state.lastSaveErrorRef,
      };
    case 'SET_SAVE_SUCCESS':
      return { 
        ...state, 
        lastSaved: new Date(), 
        saving: false, 
        saveState: SAVE_STATES.SAVED,
        lastSaveError: null,
        lastSaveErrorRef: null,
        status: state.status === 'new' ? 'draft' : state.status,
      };
    case 'SET_SAVE_ERROR':
      return { 
        ...state, 
        saving: false, 
        saveState: action.offline ? SAVE_STATES.OFFLINE : SAVE_STATES.SAVE_FAILED,
        lastSaveError: action.error,
        lastSaveErrorRef: action.referenceId || null,
      };

    // Legacy compat
    case 'SET_SAVING':
      return { ...state, saving: action.value, saveState: action.value ? SAVE_STATES.SAVING : state.saveState };
    case 'SET_SAVED':
      return { ...state, lastSaved: new Date(), saving: false, saveState: SAVE_STATES.SAVED, status: state.status === 'new' ? 'draft' : state.status };

    case 'SET_SURVEY_META':
      return { ...state, surveyId: action.surveyId, schoolId: action.schoolId, status: action.status || 'draft' };
    case 'LOAD_SURVEY':
      return {
        ...state,
        surveyId: action.data.id,
        schoolId: action.data.school_id,
        school: {
          name: action.data.school_name || '', village: action.data.village || '',
          gram_panchayat: action.data.gram_panchayat || '', panchayat_samiti: action.data.panchayat_samiti || '',
          udise_code: action.data.udise_code || '', school_code: action.data.school_code || '',
          principal_name: action.data.principal_name || '',
          principal_mobile: action.data.principal_mobile || '', principal_email: action.data.principal_email || ''
        },
        surveyData: action.data.survey_data || {},
        currentSection: action.data.current_section || 0,
        status: action.data.status || 'draft',
        saveState: action.data.status === 'submitted' ? SAVE_STATES.SUBMITTED : SAVE_STATES.IDLE,
        staffPositions: action.data.staff_positions?.length > 0
          ? action.data.staff_positions
          : STAFF_POSTS.map(p => ({ post_name: p, sanctioned: '', working: '', vacant: '', remarks: '' })),
        staffMembers: action.data.staff_members?.length > 0 
          ? action.data.staff_members 
          : Array.from({ length: 10 }, () => ({ name: '', staff_id: '', post: '', subject: '', mobile: '', email: '' })),
        studentEnrollment: action.data.student_enrollment?.length > 0
          ? action.data.student_enrollment
          : CLASSES.map(c => ({ class_name: `कक्षा ${c}`, boys: '', girls: '', total: '' })),
        palanharStudents: action.data.palanhar_students?.length > 0
          ? action.data.palanhar_students
          : Array.from({ length: 10 }, () => ({ student_name:'', class_name:'', palanhar_number:'', palanhar_category:'' })),
        disabledStudents: action.data.disabled_students?.length > 0
          ? action.data.disabled_students
          : Array.from({ length: 10 }, () => ({ student_name:'', class_name:'', disability_type:'', percentage:'', certificate_number:'' })),
        playerStudents: action.data.player_students?.length > 0
          ? action.data.player_students
          : Array.from({ length: 10 }, () => ({ student_name:'', class_name:'', sport:'', level:'' })),
        scoutNccStudents: action.data.scout_ncc_students?.length > 0
          ? action.data.scout_ncc_students
          : Array.from({ length: 10 }, () => ({ student_name:'', class_name:'', level:'', details:'' })),
        labs: action.data.labs || [],
        labRequirements: action.data.lab_requirements || [],
        committeeMembers: action.data.committee_members || [],
        panchayatMembers: action.data.panchayat_members || [],
        examResults: action.data.exam_results || [],
        requirements: action.data.requirements || [],
        lastSaved: action.data.updated_at ? new Date(action.data.updated_at) : null,
      };
    case 'RESTORE_DRAFT':
      return {
        ...state,
        ...action.payload,
        lastSaved: action.payload.lastSaved ? new Date(action.payload.lastSaved) : null,
        saveState: SAVE_STATES.UNSAVED,
      };
    case 'SET_SUBMITTED':
      return { ...state, status: 'submitted', saveState: SAVE_STATES.SUBMITTED };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

export function SurveyProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const autoSaveTimer = useRef(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // ============================================
  // ONLINE/OFFLINE DETECTION
  // ============================================
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // If we were offline and have unsaved data, update state
      if (state.saveState === SAVE_STATES.OFFLINE) {
        dispatch({ type: 'SET_SAVE_STATE', saveState: SAVE_STATES.UNSAVED });
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
      if (state.saveState === SAVE_STATES.SAVING) {
        dispatch({ type: 'SET_SAVE_ERROR', error: 'नेटवर्क कनेक्शन नहीं है', offline: true });
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [state.saveState]);

  // ============================================
  // BEFOREUNLOAD — Warn about unsaved changes
  // ============================================
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (
        state.saveState === SAVE_STATES.UNSAVED ||
        state.saveState === SAVE_STATES.SAVING ||
        state.saveState === SAVE_STATES.SAVE_FAILED
      ) {
        e.preventDefault();
        e.returnValue = 'आपके बदलाव सेव नहीं हुए हैं। क्या आप सच में पेज छोड़ना चाहते हैं?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state.saveState]);

  // ============================================
  // AUTO-SAVE TO LOCALSTORAGE (always works)
  // ============================================
  useEffect(() => {
    if (state.status === 'new' || state.status === 'submitted') return;
    const data = {
      school: state.school, surveyData: state.surveyData, currentSection: state.currentSection,
      surveyId: state.surveyId, schoolId: state.schoolId, status: state.status,
      staffPositions: state.staffPositions, staffMembers: state.staffMembers,
      studentEnrollment: state.studentEnrollment, palanharStudents: state.palanharStudents,
      disabledStudents: state.disabledStudents, playerStudents: state.playerStudents,
      scoutNccStudents: state.scoutNccStudents, labs: state.labs, labRequirements: state.labRequirements,
      committeeMembers: state.committeeMembers, panchayatMembers: state.panchayatMembers,
      examResults: state.examResults, requirements: state.requirements,
      _localSaveTime: new Date().toISOString(),
      _syncedToServer: state.saveState === SAVE_STATES.SAVED,
    };
    try {
      localStorage.setItem('jankali_survey_draft', JSON.stringify(data));
    } catch (e) {
      console.warn('localStorage save failed:', e);
    }
  }, [state.school, state.surveyData, state.currentSection, state.staffPositions, state.staffMembers,
      state.studentEnrollment, state.palanharStudents, state.disabledStudents, state.playerStudents,
      state.scoutNccStudents, state.labs, state.labRequirements, state.committeeMembers,
      state.panchayatMembers, state.examResults, state.requirements, state.status, state.surveyId, state.saveState]);

  // ============================================
  // SAVE TO SERVER (with proper error handling)
  // ============================================
  const saveToServer = useCallback(async () => {
    if (!state.surveyId || state.status === 'submitted') return;
    
    // Don't start a new save if one is already in progress
    if (state.saveState === SAVE_STATES.SAVING) return;

    // Check network first
    if (!navigator.onLine) {
      dispatch({ type: 'SET_SAVE_ERROR', error: 'नेटवर्क कनेक्शन नहीं है। आपका डेटा स्थानीय रूप से सुरक्षित है।', offline: true });
      return;
    }

    // Handle local-only surveys: try to promote to server
    if (String(state.surveyId).startsWith('local_')) {
      dispatch({ type: 'SET_SAVE_STATE', saveState: SAVE_STATES.SAVING });
      try {
        const { surveyId: newSurveyId, schoolId: newSchoolId } = await api.createSurvey(state.school);
        await api.updateSurvey(newSurveyId, {
          school: state.school,
          survey_data: state.surveyData,
          current_section: state.currentSection,
          staff_positions: state.staffPositions.filter(sp => sp.sanctioned || sp.working || sp.remarks),
          staff_members: state.staffMembers.filter(sm => sm.name),
          student_enrollment: state.studentEnrollment,
          palanhar_students: state.palanharStudents.filter(p => p.student_name),
          disabled_students: state.disabledStudents.filter(d => d.student_name),
          player_students: state.playerStudents.filter(p => p.student_name),
          scout_ncc_students: state.scoutNccStudents.filter(s => s.student_name),
          labs: state.labs,
          lab_requirements: state.labRequirements.filter(l => l.equipment),
          committee_members: state.committeeMembers.filter(c => c.name),
          panchayat_members: state.panchayatMembers.filter(p => p.name),
          exam_results: state.examResults,
          requirements: state.requirements.filter(r => r.name),
        });
        dispatch({ type: 'SET_SURVEY_META', surveyId: newSurveyId, schoolId: newSchoolId, status: state.status });
        dispatch({ type: 'SET_SAVE_SUCCESS' });
      } catch (err) {
        console.warn('Failed to promote local survey to server:', err);
        const isOffline = !navigator.onLine || (err.message && err.message.includes('fetch'));
        dispatch({ 
          type: 'SET_SAVE_ERROR', 
          error: isOffline 
            ? 'सर्वर उपलब्ध नहीं है। आपका डेटा स्थानीय रूप से सुरक्षित है।' 
            : (err.message || 'सर्वे सेव करने में त्रुटि हुई।'),
          referenceId: err.referenceId || null,
          offline: isOffline,
        });
      }
      return;
    }

    // Normal server save
    dispatch({ type: 'SET_SAVE_STATE', saveState: SAVE_STATES.SAVING });
    try {
      await api.updateSurvey(state.surveyId, {
        school: state.school,
        survey_data: state.surveyData,
        current_section: state.currentSection,
        staff_positions: state.staffPositions.filter(sp => sp.sanctioned || sp.working || sp.remarks),
        staff_members: state.staffMembers.filter(sm => sm.name),
        student_enrollment: state.studentEnrollment,
        palanhar_students: state.palanharStudents.filter(p => p.student_name),
        disabled_students: state.disabledStudents.filter(d => d.student_name),
        player_students: state.playerStudents.filter(p => p.student_name),
        scout_ncc_students: state.scoutNccStudents.filter(s => s.student_name),
        labs: state.labs,
        lab_requirements: state.labRequirements.filter(l => l.equipment),
        committee_members: state.committeeMembers.filter(c => c.name),
        panchayat_members: state.panchayatMembers.filter(p => p.name),
        exam_results: state.examResults,
        requirements: state.requirements.filter(r => r.name),
      });
      dispatch({ type: 'SET_SAVE_SUCCESS' });
    } catch (err) {
      console.error('Server save failed:', err);
      const isOffline = !navigator.onLine || (err.message && (err.message.includes('fetch') || err.message.includes('network')));
      dispatch({ 
        type: 'SET_SAVE_ERROR', 
        error: isOffline 
          ? 'सर्वर उपलब्ध नहीं है। आपका डेटा स्थानीय रूप से सुरक्षित है। कृपया पुनः कनेक्ट होकर प्रयास करें।'
          : (err.message || 'सर्वे सेव करने में त्रुटि हुई।'),
        referenceId: err.referenceId || null,
        offline: isOffline,
      });
    }
  }, [state]);

  // Auto-save to server every 60 seconds
  useEffect(() => {
    if (!state.surveyId || state.status !== 'draft') return;
    autoSaveTimer.current = setInterval(() => {
      // Only auto-save if there are unsaved changes
      if (state.saveState === SAVE_STATES.UNSAVED || state.saveState === SAVE_STATES.SAVE_FAILED) {
        saveToServer();
      }
    }, 60000);
    return () => clearInterval(autoSaveTimer.current);
  }, [state.surveyId, state.status, saveToServer, state.saveState]);

  const value = {
    state,
    dispatch,
    saveToServer,
    isOnline,
    setField: (key, value) => dispatch({ type: 'SET_FIELD', key, value }),
    setSchool: (payload) => dispatch({ type: 'SET_SCHOOL', payload }),
    goToSection: (section) => dispatch({ type: 'SET_SECTION', section }),
  };

  return <SurveyContext.Provider value={value}>{children}</SurveyContext.Provider>;
}

export function useSurvey() {
  const ctx = useContext(SurveyContext);
  if (!ctx) throw new Error('useSurvey must be used within SurveyProvider');
  return ctx;
}
