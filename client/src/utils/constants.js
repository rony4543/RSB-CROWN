// Survey section definitions
export const SECTIONS = [
  { id: 0, key: 'school_profile', title: 'विद्यालय प्रोफाइल', shortTitle: 'प्रोफाइल' },
  { id: 1, key: 'academic', title: 'शैक्षणिक जानकारी', shortTitle: 'शैक्षणिक', questions: 'Q1-Q3' },
  { id: 2, key: 'special_status', title: 'विशेष स्थिति', shortTitle: 'विशेष', questions: 'Q4-Q6' },
  { id: 3, key: 'staff', title: 'कार्मिक जानकारी', shortTitle: 'कार्मिक', questions: 'Q7-Q8' },
  { id: 4, key: 'building', title: 'भवन एवं फर्नीचर', shortTitle: 'भवन', questions: 'Q9-Q10' },
  { id: 5, key: 'electricity', title: 'बिजली, कम्प्यूटर एवं इंटरनेट', shortTitle: 'बिजली/IT', questions: 'Q11-Q13' },
  { id: 6, key: 'labs', title: 'प्रयोगशाला', shortTitle: 'लैब', questions: 'Q14-Q15' },
  { id: 7, key: 'boundary', title: 'चारदीवारी', shortTitle: 'चारदीवारी', questions: 'Q16-Q17' },
  { id: 8, key: 'playground', title: 'खेल मैदान एवं सामग्री', shortTitle: 'खेल', questions: 'Q18-Q20' },
  { id: 9, key: 'road', title: 'सड़क मार्ग', shortTitle: 'सड़क', questions: 'Q21-Q22' },
  { id: 10, key: 'toilet_water', title: 'शौचालय एवं पेयजल', shortTitle: 'शौचालय/जल', questions: 'Q23-Q27' },
  { id: 11, key: 'enrollment', title: 'कक्षा वार नामांकन', shortTitle: 'नामांकन', questions: 'Q28' },
  { id: 12, key: 'students', title: 'छात्र विवरण', shortTitle: 'छात्र', questions: 'Q29-Q32' },
  { id: 13, key: 'smart_land', title: 'स्मार्ट क्लासरूम, रास्ता एवं भूमि', shortTitle: 'स्मार्ट/भूमि', questions: 'Q33-Q35' },
  { id: 14, key: 'committees', title: 'समिति एवं पंचायत', shortTitle: 'समिति', questions: 'Q36-Q38' },
  { id: 15, key: 'exams', title: 'परीक्षा परिणाम', shortTitle: 'परीक्षा', questions: 'Q39' },
  { id: 16, key: 'requirements', title: 'अन्य आवश्यक सुविधाएँ', shortTitle: 'आवश्यकताएँ', questions: 'Q40' },
  { id: 17, key: 'review', title: 'समीक्षा एवं जमा करें', shortTitle: 'समीक्षा' },
];

// Staff positions for Q7
export const STAFF_POSTS = [
  'प्रधानाचार्य', 'उपप्रधानाचार्य', 'व्याख्याता', 'वरिष्ठ अध्यापक',
  'अध्यापक लेवल-2', 'अध्यापक लेवल-1', 'विशेष शिक्षक', 'शारीरिक शिक्षक',
  'बेसिक कम्प्यूटर अनुदेशक', 'प्रयोगशाला सहायक', 'सहायक प्रशासनिक अधिकारी',
  'वरिष्ठ सहायक', 'प्रबोधक', 'वरिष्ठ प्रबोधक', 'पैरा टीचर',
  'पंचायत सहायक', 'कनिष्ठ सहायक', 'चतुर्थ श्रेणी कर्मचारी'
];

// Class names for enrollment
export const CLASSES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

// Lab types
export const LAB_TYPES = [
  'भौतिक विज्ञान', 'रसायन विज्ञान', 'भूगोल प्रयोगशाला',
  'जीव विज्ञान', 'कम्प्यूटर लैब', 'अन्य'
];

// Requirement categories
export const REQUIREMENT_CATEGORIES = [
  'भवन', 'कक्षा-कक्ष', 'फर्नीचर', 'बिजली', 'सौर ऊर्जा', 'कंप्यूटर',
  'इंटरनेट', 'लैब', 'चारदीवारी', 'खेल मैदान', 'खेल सामग्री', 'सड़क',
  'शौचालय', 'पेयजल', 'स्मार्ट क्लासरूम', 'भूमि', 'पुस्तकालय', 'अन्य'
];

// Priority options
export const PRIORITIES = [
  { value: 'high', label: 'उच्च' },
  { value: 'medium', label: 'मध्यम' },
  { value: 'low', label: 'निम्न' }
];

// School types for Q1
export const SCHOOL_TYPES = [
  'प्राथमिक विद्यालय',
  'उच्च प्राथमिक विद्यालय',
  'माध्यमिक विद्यालय',
  'उच्च माध्यमिक विद्यालय'
];

// Faculty subjects for Q3
export const FACULTY_SUBJECTS = ['कला', 'विज्ञान', 'कृषि', 'वाणिज्य', 'व्यावसायिक'];

// Water sources
export const WATER_SOURCES = ['टंकी', 'हैंडपंप', 'नल कनेक्शन', 'अन्य'];

// Exam classes
export const EXAM_CLASSES = ['कक्षा 5', 'कक्षा 8', 'कक्षा 10', 'कक्षा 12'];
