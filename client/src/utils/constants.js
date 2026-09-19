// Survey section definitions
export const SECTIONS = [
  { id: 0, key: 'school_profile', title: 'विद्यालय प्रोफाइल', shortTitle: 'प्रोफाइल' },
  { id: 1, key: 'academic', title: 'शैक्षणिक जानकारी', shortTitle: 'शैक्षणिक', questions: 'Q1-Q2' },
  { id: 2, key: 'special_status', title: 'विशेष स्थिति', shortTitle: 'विशेष', questions: 'Q4-Q6' },
  { id: 3, key: 'staff', title: 'कार्मिक जानकारी', shortTitle: 'कार्मिक', questions: 'Q7-Q8' },
  { id: 4, key: 'enrollment', title: 'कक्षा वार नामांकन', shortTitle: 'नामांकन', questions: 'Q28' },
  { id: 5, key: 'building', title: 'भवन एवं फर्नीचर', shortTitle: 'भवन', questions: 'Q9-Q10' },
  { id: 6, key: 'electricity', title: 'बिजली, कम्प्यूटर एवं इंटरनेट', shortTitle: 'बिजली/IT', questions: 'Q11-Q13' },
  { id: 7, key: 'labs', title: 'प्रयोगशाला', shortTitle: 'लैब', questions: 'Q14-Q15' },
  { id: 8, key: 'boundary', title: 'चारदीवारी', shortTitle: 'चारदीवारी', questions: 'Q16-Q17' },
  { id: 9, key: 'road', title: 'सड़क मार्ग', shortTitle: 'सड़क', questions: 'Q21-Q22' },
  { id: 10, key: 'toilet_water', title: 'शौचालय एवं पेयजल', shortTitle: 'शौचालय/जल', questions: 'Q23-Q27' },
  { id: 11, key: 'students', title: 'छात्र विवरण', shortTitle: 'छात्र', questions: 'Q29-Q32' },
  { id: 12, key: 'smart_land', title: 'स्मार्ट क्लासरूम, भूमि एवं खेल मैदान', shortTitle: 'स्मार्ट/भूमि/खेल', questions: 'Q18-20, Q33-35' },
  { id: 13, key: 'committees', title: 'समिति एवं पंचायत', shortTitle: 'समिति', questions: 'Q36-Q38' },
  { id: 14, key: 'exams', title: 'परीक्षा परिणाम', shortTitle: 'परीक्षा', questions: 'Q39' },
  { id: 15, key: 'requirements', title: 'अन्य आवश्यक सुविधाएँ', shortTitle: 'आवश्यकताएँ', questions: 'Q40' },
  { id: 16, key: 'review', title: 'समीक्षा एवं जमा करें', shortTitle: 'समीक्षा' },
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

// Faculty and Subject Mapping for Q2
export const FACULTY_SUBJECT_MAPPING = {
  'कला': ['इतिहास', 'भूगोल', 'राजनीति विज्ञान', 'हिन्दी साहित्य', 'अंग्रेजी साहित्य', 'संस्कृत साहित्य', 'उर्दू साहित्य', 'समाजशास्त्र', 'अर्थशास्त्र', 'गृह विज्ञान', 'लोक प्रशासन', 'चित्रकला', 'संगीत', 'कम्प्यूटर विज्ञान', 'गणित'],
  'विज्ञान': ['भौतिक विज्ञान', 'रसायन विज्ञान', 'जीव विज्ञान', 'गणित', 'कम्प्यूटर विज्ञान', 'इन्फॉर्मेटिक्स प्रैक्टिसेज'],
  'कृषि': ['कृषि विज्ञान', 'कृषि जीव विज्ञान', 'कृषि रसायन'],
  'वाणिज्य': ['लेखाशास्त्र', 'व्यवसाय अध्ययन', 'अर्थशास्त्र', 'कम्प्यूटर विज्ञान', 'गणित'],
  'व्यावसायिक': ['आईटी एवं आईटीईएस', 'पर्यटन एवं आतिथ्य', 'स्वास्थ्य देखभाल', 'सौंदर्य एवं स्वास्थ्य', 'ऑटोमोटिव', 'परिधान निर्माण', 'खुदरा व्यापार', 'सुरक्षा', 'इलेक्ट्रॉनिक्स एवं हार्डवेयर', 'प्लंबिंग']
};

// Water sources
export const WATER_SOURCES = ['टंकी', 'हैंडपंप', 'नल कनेक्शन', 'अन्य'];

// Exam classes
export const EXAM_CLASSES = ['कक्षा 5', 'कक्षा 8', 'कक्षा 10', 'कक्षा 12'];
