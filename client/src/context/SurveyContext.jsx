import { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { STAFF_POSTS, CLASSES } from '../utils/constants';

const SurveyContext = createContext(null);

const initialSchool = {
  name: '', village: '', gram_panchayat: '', panchayat_samiti: '',
  udise_code: '', principal_name: '', principal_mobile: '', principal_email: ''
};

const initialState = {
  surveyId: null,
  schoolId: null,
  school: { ...initialSchool },
  surveyData: {},
  currentSection: 0,
  status: 'new', // new, draft, submitted
  lastSaved: null,
  saving: false,
  errors: {},
  // Related tables
  staffPositions: STAFF_POSTS.map(p => ({ post_name: p, sanctioned: '', working: '', vacant: '', remarks: '' })),
  staffMembers: [],
  studentEnrollment: CLASSES.map(c => ({ class_name: `कक्षा ${c}`, boys: '', girls: '', total: '' })),
  palanharStudents: [],
  disabledStudents: [],
  playerStudents: [],
  scoutNccStudents: [],
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
      return { ...state, school: { ...state.school, ...action.payload } };
    case 'SET_FIELD':
      return { ...state, surveyData: { ...state.surveyData, [action.key]: action.value } };
    case 'SET_SURVEY_DATA':
      return { ...state, surveyData: { ...state.surveyData, ...action.payload } };
    case 'SET_SECTION':
      return { ...state, currentSection: action.section };
    case 'SET_ERRORS':
      return { ...state, errors: action.errors };
    case 'CLEAR_ERRORS':
      return { ...state, errors: {} };
    case 'SET_STAFF_POSITIONS':
      return { ...state, staffPositions: action.payload };
    case 'SET_STAFF_MEMBERS':
      return { ...state, staffMembers: action.payload };
    case 'SET_STUDENT_ENROLLMENT':
      return { ...state, studentEnrollment: action.payload };
    case 'SET_PALANHAR':
      return { ...state, palanharStudents: action.payload };
    case 'SET_DISABLED':
      return { ...state, disabledStudents: action.payload };
    case 'SET_PLAYERS':
      return { ...state, playerStudents: action.payload };
    case 'SET_SCOUT_NCC':
      return { ...state, scoutNccStudents: action.payload };
    case 'SET_LABS':
      return { ...state, labs: action.payload };
    case 'SET_LAB_REQS':
      return { ...state, labRequirements: action.payload };
    case 'SET_COMMITTEE':
      return { ...state, committeeMembers: action.payload };
    case 'SET_PANCHAYAT':
      return { ...state, panchayatMembers: action.payload };
    case 'SET_EXAMS':
      return { ...state, examResults: action.payload };
    case 'SET_REQUIREMENTS':
      return { ...state, requirements: action.payload };
    case 'SET_SAVING':
      return { ...state, saving: action.value };
    case 'SET_SAVED':
      return { ...state, lastSaved: new Date(), saving: false, status: state.status === 'new' ? 'draft' : state.status };
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
          udise_code: action.data.udise_code || '', principal_name: action.data.principal_name || '',
          principal_mobile: action.data.principal_mobile || '', principal_email: action.data.principal_email || ''
        },
        surveyData: action.data.survey_data || {},
        currentSection: action.data.current_section || 0,
        status: action.data.status || 'draft',
        staffPositions: action.data.staff_positions?.length > 0
          ? action.data.staff_positions
          : STAFF_POSTS.map(p => ({ post_name: p, sanctioned: '', working: '', vacant: '', remarks: '' })),
        staffMembers: action.data.staff_members || [],
        studentEnrollment: action.data.student_enrollment?.length > 0
          ? action.data.student_enrollment
          : CLASSES.map(c => ({ class_name: `कक्षा ${c}`, boys: '', girls: '', total: '' })),
        palanharStudents: action.data.palanhar_students || [],
        disabledStudents: action.data.disabled_students || [],
        playerStudents: action.data.player_students || [],
        scoutNccStudents: action.data.scout_ncc_students || [],
        labs: action.data.labs || [],
        labRequirements: action.data.lab_requirements || [],
        committeeMembers: action.data.committee_members || [],
        panchayatMembers: action.data.panchayat_members || [],
        examResults: action.data.exam_results || [],
        requirements: action.data.requirements || [],
        lastSaved: action.data.updated_at ? new Date(action.data.updated_at) : null,
      };
    case 'SET_SUBMITTED':
      return { ...state, status: 'submitted' };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

export function SurveyProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const autoSaveTimer = useRef(null);

  // Auto-save to localStorage
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
    };
    localStorage.setItem('jankali_survey_draft', JSON.stringify(data));
  }, [state.school, state.surveyData, state.currentSection, state.staffPositions, state.staffMembers,
      state.studentEnrollment, state.palanharStudents, state.disabledStudents, state.playerStudents,
      state.scoutNccStudents, state.labs, state.labRequirements, state.committeeMembers,
      state.panchayatMembers, state.examResults, state.requirements, state.status, state.surveyId]);

  // Save to server
  const saveToServer = useCallback(async () => {
    if (!state.surveyId || state.status === 'submitted') return;
    dispatch({ type: 'SET_SAVING', value: true });
    try {
      await api.updateSurvey(state.surveyId, {
        school: state.school,
        survey_data: state.surveyData,
        current_section: state.currentSection,
        staff_positions: state.staffPositions.filter(sp => sp.sanctioned || sp.working),
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
      dispatch({ type: 'SET_SAVED' });
    } catch (err) {
      console.error('Auto-save failed:', err);
      dispatch({ type: 'SET_SAVING', value: false });
    }
  }, [state]);

  // Auto-save to server every 60 seconds
  useEffect(() => {
    if (!state.surveyId || state.status !== 'draft') return;
    autoSaveTimer.current = setInterval(() => {
      saveToServer();
    }, 60000);
    return () => clearInterval(autoSaveTimer.current);
  }, [state.surveyId, state.status, saveToServer]);

  const value = {
    state,
    dispatch,
    saveToServer,
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
