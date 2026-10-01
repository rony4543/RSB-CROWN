-- ==========================================================================
-- JANKALI School Survey — COMPLETE QUESTION REGISTRY
-- 100% Coverage of All Survey Questions, Sub-questions, and Options
-- ==========================================================================
-- This file populates the question_registry table with EVERY question
-- from the survey form, mapped to its JSONB path in responses.
-- ==========================================================================

-- Clear existing registry for clean insert
TRUNCATE public.question_registry RESTART IDENTITY;

-- ==========================================================================
-- SECTION 00: SCHOOL PROFILE (विद्यालय प्रोफाइल)
-- ==========================================================================
INSERT INTO public.question_registry (question_id, section_id, section_name, question_number, question_text, question_text_en, question_type, options, required, conditional_logic, parent_question, data_path, unit, display_order, version) VALUES
('school_name',     'section_00_school_profile', 'विद्यालय प्रोफाइल', NULL, 'विद्यालय का नाम', 'School Name', 'text', NULL, true, NULL, NULL, 'responses.section_00_school_profile.school_name', NULL, 1, '1.0.0'),
('village',         'section_00_school_profile', 'विद्यालय प्रोफाइल', NULL, 'राजस्व गाँव', 'Revenue Village', 'text', NULL, true, NULL, NULL, 'responses.section_00_school_profile.village', NULL, 2, '1.0.0'),
('gram_panchayat',  'section_00_school_profile', 'विद्यालय प्रोफाइल', NULL, 'ग्राम पंचायत', 'Gram Panchayat', 'text', NULL, true, NULL, NULL, 'responses.section_00_school_profile.gram_panchayat', NULL, 3, '1.0.0'),
('panchayat_samiti','section_00_school_profile', 'विद्यालय प्रोफाइल', NULL, 'पंचायत समिति', 'Panchayat Samiti (Block)', 'text', NULL, true, NULL, NULL, 'responses.section_00_school_profile.panchayat_samiti', NULL, 4, '1.0.0'),
('udise_code',      'section_00_school_profile', 'विद्यालय प्रोफाइल', NULL, 'UDISE CODE', 'UDISE Code', 'text', NULL, true, NULL, NULL, 'responses.section_00_school_profile.udise_code', NULL, 5, '1.0.0'),
('school_code',     'section_00_school_profile', 'विद्यालय प्रोफाइल', NULL, 'विद्यालय कोड (School Code / शाला दर्पण कोड)', 'School Code / Shala Darpan Code', 'text', NULL, false, NULL, NULL, 'responses.section_00_school_profile.school_code', NULL, 6, '1.0.0'),
('principal_name',  'section_00_school_profile', 'विद्यालय प्रोफाइल', NULL, 'संस्थाप्रधान का नाम', 'Principal Name', 'text', NULL, true, NULL, NULL, 'responses.section_00_school_profile.principal_name', NULL, 7, '1.0.0'),
('principal_mobile','section_00_school_profile', 'विद्यालय प्रोफाइल', NULL, 'मोबाइल नंबर', 'Mobile Number', 'tel', NULL, true, NULL, NULL, 'responses.section_00_school_profile.principal_mobile', NULL, 8, '1.0.0'),
('principal_email', 'section_00_school_profile', 'विद्यालय प्रोफाइल', NULL, 'ईमेल', 'Email', 'email', NULL, false, NULL, NULL, 'responses.section_00_school_profile.principal_email', NULL, 9, '1.0.0');

-- ==========================================================================
-- SECTION 01: ACADEMIC (शैक्षणिक जानकारी) — Q1, Q2
-- ==========================================================================
INSERT INTO public.question_registry (question_id, section_id, section_name, question_number, question_text, question_text_en, question_type, options, required, conditional_logic, parent_question, data_path, unit, display_order, version) VALUES
('q1',  'section_01_academic', 'शैक्षणिक जानकारी', 'Q1', 'विद्यालय का प्रकार क्या है?', 'What is the type of school?', 'radio', '["प्राथमिक विद्यालय", "माध्यमिक विद्यालय", "उच्च माध्यमिक विद्यालय"]'::jsonb, true, NULL, NULL, 'responses.section_01_academic.q1', NULL, 10, '1.0.0'),
('q2',  'section_01_academic', 'शैक्षणिक जानकारी', 'Q2', 'विद्यालय का संकाय/विषय क्या है?', 'What are the school faculties/subjects?', 'checkbox_group', '{"कला": ["इतिहास","भूगोल","राजनीति विज्ञान","हिन्दी साहित्य","अंग्रेजी साहित्य","संस्कृत साहित्य","उर्दू साहित्य","समाजशास्त्र","अर्थशास्त्र","गृह विज्ञान","लोक प्रशासन","चित्रकला","संगीत","कम्प्यूटर विज्ञान","गणित"],"विज्ञान":["भौतिक विज्ञान","रसायन विज्ञान","जीव विज्ञान","गणित","कम्प्यूटर विज्ञान","इन्फॉर्मेटिक्स प्रैक्टिसेज"],"कृषि":["कृषि विज्ञान","कृषि जीव विज्ञान","कृषि रसायन"],"वाणिज्य":["लेखाशास्त्र","व्यवसाय अध्ययन","अर्थशास्त्र","कम्प्यूटर विज्ञान","गणित"],"व्यावसायिक":["आईटी एवं आईटीईएस","पर्यटन एवं आतिथ्य","स्वास्थ्य देखभाल","सौंदर्य एवं स्वास्थ्य","ऑटोमोटिव","परिधान निर्माण","खुदरा व्यापार","सुरक्षा","इलेक्ट्रॉनिक्स एवं हार्डवेयर","प्लंबिंग"]}'::jsonb, true, '{"depends_on": "q1", "show_when": "उच्च माध्यमिक विद्यालय"}'::jsonb, 'q1', 'responses.section_01_academic.q2', NULL, 11, '1.0.0');

-- ==========================================================================
-- SECTION 02: SPECIAL STATUS (विशेष स्थिति) — Q4, Q5, Q6, Q7(skill)
-- ==========================================================================
INSERT INTO public.question_registry (question_id, section_id, section_name, question_number, question_text, question_text_en, question_type, options, required, conditional_logic, parent_question, data_path, unit, display_order, version) VALUES
('q4',              'section_02_special_status', 'विशेष स्थिति', 'Q4', 'क्या विद्यालय PM Shri / MGGS है?', 'Is the school PM Shri / MGGS?', 'radio', '["हाँ", "नहीं"]'::jsonb, true, NULL, NULL, 'responses.section_02_special_status.q4', NULL, 20, '1.0.0'),
('q5',              'section_02_special_status', 'विशेष स्थिति', 'Q5', 'क्या विद्यालय को क्रमोन्नति (Upgradation) की आवश्यकता है?', 'Does the school need upgradation?', 'radio', '["हाँ", "नहीं"]'::jsonb, true, NULL, NULL, 'responses.section_02_special_status.q5', NULL, 21, '1.0.0'),
('q5_details',      'section_02_special_status', 'विशेष स्थिति', 'Q5', 'क्रमोन्नति की आवश्यकता का विवरण', 'Upgradation requirement details', 'textarea', NULL, false, '{"depends_on": "q5", "show_when": "हाँ"}'::jsonb, 'q5', 'responses.section_02_special_status.q5_details', NULL, 22, '1.0.0'),
('q6',              'section_02_special_status', 'विशेष स्थिति', 'Q6', 'क्या विद्यालय में महिला शिक्षक कार्यरत हैं?', 'Are female teachers working in the school?', 'radio', '["हाँ", "नहीं"]'::jsonb, true, NULL, NULL, 'responses.section_02_special_status.q6', NULL, 23, '1.0.0'),
('q7_skill',        'section_02_special_status', 'विशेष स्थिति', 'Q7', 'क्या आपके विद्यालय में कोई स्किल एक्टिविटी करवाई जाती है?', 'Is any skill activity conducted?', 'radio', '["हाँ", "नहीं"]'::jsonb, true, NULL, NULL, 'responses.section_02_special_status.q7_skill', NULL, 24, '1.0.0'),
('q7_skill_details','section_02_special_status', 'विशेष स्थिति', 'Q7', 'स्किल एक्टिविटी का विवरण', 'Skill activity details', 'textarea', NULL, false, '{"depends_on": "q7_skill", "show_when": "हाँ"}'::jsonb, 'q7_skill', 'responses.section_02_special_status.q7_skill_details', NULL, 25, '1.0.0');

-- ==========================================================================
-- SECTION 03: STAFF (कार्मिक जानकारी) — Q7(positions), Q8
-- ==========================================================================
INSERT INTO public.question_registry (question_id, section_id, section_name, question_number, question_text, question_text_en, question_type, options, required, conditional_logic, parent_question, data_path, unit, display_order, version) VALUES
('q7',                        'section_03_staff', 'कार्मिक जानकारी', 'Q7', 'विद्यालय में पदवार संस्थापन सूचना दर्ज करें।', 'Enter post-wise establishment information.', 'table', '{"columns": ["post_name","sanctioned","working","vacant","remarks"], "post_names": ["प्रधानाचार्य","उपप्रधानाचार्य","व्याख्याता","वरिष्ठ अध्यापक","अध्यापक लेवल-2","अध्यापक लेवल-1","विशेष शिक्षक","शारीरिक शिक्षक","बेसिक कम्प्यूटर अनुदेशक","प्रयोगशाला सहायक","सहायक प्रशासनिक अधिकारी","वरिष्ठ सहायक","प्रबोधक","वरिष्ठ प्रबोधक","पैरा टीचर","पंचायत सहायक","कनिष्ठ सहायक","चतुर्थ श्रेणी कर्मचारी"]}'::jsonb, true, NULL, NULL, 'responses.section_03_staff.q7', NULL, 30, '1.0.0'),
('q8',                        'section_03_staff', 'कार्मिक जानकारी', 'Q8', 'विद्यालय में कार्यरत कार्मिकों की सूचना दर्ज करें।', 'Enter information about working staff members.', 'table', '{"columns": ["name","staff_id","post","subject","mobile","email"]}'::jsonb, false, NULL, NULL, 'responses.section_03_staff.q8', NULL, 31, '1.0.0'),
('staff_requirements_details','section_03_staff', 'कार्मिक जानकारी', NULL, 'आपकी राय में, विद्यालय के सुचारू संचालन और विद्यार्थियों के बेहतर भविष्य के लिए किन-किन पदों पर कितने अतिरिक्त कार्मिकों की नितांत आवश्यकता है?', 'In your opinion, how many additional staff are critically needed?', 'textarea', NULL, false, NULL, NULL, 'responses.section_03_staff.staff_requirements_details', NULL, 32, '1.0.0');

-- ==========================================================================
-- SECTION 04: ENROLLMENT (कक्षा वार नामांकन) — Q28
-- ==========================================================================
INSERT INTO public.question_registry (question_id, section_id, section_name, question_number, question_text, question_text_en, question_type, options, required, conditional_logic, parent_question, data_path, unit, display_order, version) VALUES
('q28', 'section_04_enrollment', 'कक्षा वार नामांकन', 'Q28', 'कक्षावार विद्यार्थियों का नामांकन (Enrollment) दर्ज करें', 'Enter class-wise student enrollment', 'table', '{"columns": ["class_name","boys","girls","total"], "classes": ["1","2","3","4","5","6","7","8","9","10","11","12"]}'::jsonb, true, NULL, NULL, 'responses.section_04_enrollment.q28', NULL, 40, '1.0.0');

-- ==========================================================================
-- SECTION 05: BUILDING & FURNITURE (भवन एवं फर्नीचर) — Q9, Q9A, Q9B, Q9C, Q10
-- ==========================================================================
INSERT INTO public.question_registry (question_id, section_id, section_name, question_number, question_text, question_text_en, question_type, options, required, conditional_logic, parent_question, data_path, unit, display_order, version) VALUES
('q9_rooms_upto_2023',        'section_05_building', 'भवन एवं फर्नीचर', 'Q9', '2023 तक विद्यालय में कितनी कक्ष थीं?', 'How many rooms existed till 2023?', 'number', NULL, false, NULL, NULL, 'responses.section_05_building.q9_rooms_upto_2023', NULL, 50, '1.0.0'),
('q9_new_rooms_after_2023',   'section_05_building', 'भवन एवं फर्नीचर', 'Q9', '2023 के बाद अब तक नए कक्ष कितने बने हैं?', 'How many new rooms built after 2023?', 'number', NULL, false, NULL, NULL, 'responses.section_05_building.q9_new_rooms_after_2023', NULL, 51, '1.0.0'),
('q9_existing_rooms',         'section_05_building', 'भवन एवं फर्नीचर', 'Q9', 'वर्तमान में उपलब्ध कुल कक्ष (कुल कमरे)', 'Total rooms currently available', 'number', NULL, true, NULL, NULL, 'responses.section_05_building.q9_existing_rooms', NULL, 52, '1.0.0'),
('q9_total_students',         'section_05_building', 'भवन एवं फर्नीचर', 'Q9', 'कुल अध्ययनरत / नामांकित छात्र संख्या', 'Total enrolled student count', 'number', NULL, false, NULL, NULL, 'responses.section_05_building.q9_total_students', NULL, 53, '1.0.0'),
('q9_additional_rooms',       'section_05_building', 'भवन एवं फर्नीचर', 'Q9', 'छात्रानुपात में अतिरिक्त कक्षा-कक्षों की आवश्यकता', 'Additional rooms needed by student-room ratio', 'number', NULL, false, NULL, NULL, 'responses.section_05_building.q9_additional_rooms', NULL, 54, '1.0.0'),
('q9_required_rooms',         'section_05_building', 'भवन एवं फर्नीचर', 'Q9', 'अन्य कारणों से अतिरिक्त कक्षा-कक्षों की सामान्य आवश्यकता', 'Additional rooms needed for other reasons', 'number', NULL, false, NULL, NULL, 'responses.section_05_building.q9_required_rooms', NULL, 55, '1.0.0'),
('q9_repairable_buildings_count','section_05_building', 'भवन एवं फर्नीचर', 'Q9', 'मरम्मत योग्य भवन की संख्या', 'Number of repairable buildings', 'number', NULL, false, NULL, NULL, 'responses.section_05_building.q9_repairable_buildings_count', NULL, 56, '1.0.0'),
('q9_needs_painting',         'section_05_building', 'भवन एवं फर्नीचर', 'Q9', 'क्या विद्यालय के भवनों की रंगरोगन (Painting) की आवश्यकता है?', 'Do buildings need painting?', 'radio', '["हाँ", "नहीं"]'::jsonb, false, NULL, NULL, 'responses.section_05_building.q9_needs_painting', NULL, 57, '1.0.0'),
('q9_condition',              'section_05_building', 'भवन एवं फर्नीचर', 'Q9', 'रंगरोगन / मरम्मत योग्य भवन का विवरण', 'Painting/repair building details', 'textarea', NULL, false, '{"depends_on": "q9_needs_painting", "show_when": "हाँ"}'::jsonb, 'q9_needs_painting', 'responses.section_05_building.q9_condition', NULL, 58, '1.0.0'),
('q9a_dilapidated',           'section_05_building', 'भवन एवं फर्नीचर', 'Q9A', 'क्या विद्यालय के कोई भवन जर्जर घोषित हैं?', 'Are any buildings declared dilapidated?', 'radio', '["हाँ", "नहीं"]'::jsonb, false, NULL, NULL, 'responses.section_05_building.q9a_dilapidated', NULL, 59, '1.0.0'),
('q9a_dilapidated_count',     'section_05_building', 'भवन एवं फर्नीचर', 'Q9A', 'जर्जर घोषित भवनों की संख्या', 'Number of dilapidated buildings', 'number', NULL, false, '{"depends_on": "q9a_dilapidated", "show_when": "हाँ"}'::jsonb, 'q9a_dilapidated', 'responses.section_05_building.q9a_dilapidated_count', NULL, 60, '1.0.0'),
('q9a_dilapidated_details',   'section_05_building', 'भवन एवं फर्नीचर', 'Q9A', 'जर्जर भवनों का विवरण (स्थिति, कब घोषित हुआ, आदि)', 'Dilapidated building details', 'textarea', NULL, false, '{"depends_on": "q9a_dilapidated", "show_when": "हाँ"}'::jsonb, 'q9a_dilapidated', 'responses.section_05_building.q9a_dilapidated_details', NULL, 61, '1.0.0'),
('q9b_classes_outside',       'section_05_building', 'भवन एवं फर्नीचर', 'Q9B', 'क्या विद्यालय में कक्ष की कमी से कक्षाएं बाहर (खुले में) संचालित हो रही हैं?', 'Are classes running outside due to room shortage?', 'radio', '["हाँ", "नहीं"]'::jsonb, false, NULL, NULL, 'responses.section_05_building.q9b_classes_outside', NULL, 62, '1.0.0'),
('q9b_classes_outside_count', 'section_05_building', 'भवन एवं फर्नीचर', 'Q9B', 'कितनी कक्षाएं बाहर संचालित हो रही हैं? (संख्या)', 'How many classes running outside?', 'number', NULL, false, '{"depends_on": "q9b_classes_outside", "show_when": "हाँ"}'::jsonb, 'q9b_classes_outside', 'responses.section_05_building.q9b_classes_outside_count', NULL, 63, '1.0.0'),
('q9c_approved_unbuilt',      'section_05_building', 'भवन एवं फर्नीचर', 'Q9C', 'क्या किसी अन्य योजना में भवन स्वीकृत हुआ है?', 'Are buildings approved in any other scheme?', 'radio', '["हाँ", "नहीं"]'::jsonb, false, NULL, NULL, 'responses.section_05_building.q9c_approved_unbuilt', NULL, 64, '1.0.0'),
('q9c_approved_unbuilt_details','section_05_building', 'भवन एवं फर्नीचर', 'Q9C', 'स्वीकृत भवनों का विवरण (योजना का नाम, स्वीकृति वर्ष, आदि)', 'Approved building details', 'textarea', NULL, false, '{"depends_on": "q9c_approved_unbuilt", "show_when": "हाँ"}'::jsonb, 'q9c_approved_unbuilt', 'responses.section_05_building.q9c_approved_unbuilt_details', NULL, 65, '1.0.0'),
('q9c_current_status',        'section_05_building', 'भवन एवं फर्नीचर', 'Q9C', 'वर्तमान स्थिति', 'Current status', 'text', NULL, false, '{"depends_on": "q9c_approved_unbuilt", "show_when": "हाँ"}'::jsonb, 'q9c_approved_unbuilt', 'responses.section_05_building.q9c_current_status', NULL, 66, '1.0.0'),
('q10_existing',              'section_05_building', 'भवन एवं फर्नीचर', 'Q10', 'पूर्व में उपलब्ध फर्नीचर की संख्या', 'Existing furniture count', 'number', NULL, true, NULL, NULL, 'responses.section_05_building.q10_existing', NULL, 67, '1.0.0'),
('q10_required',              'section_05_building', 'भवन एवं फर्नीचर', 'Q10', 'वर्तमान में फर्नीचर की आवश्यकता', 'Furniture requirement', 'number', NULL, true, NULL, NULL, 'responses.section_05_building.q10_required', NULL, 68, '1.0.0');

-- ==========================================================================
-- SECTION 06: ELECTRICITY, COMPUTERS, INTERNET — Q11, Q12, Q13
-- ==========================================================================
INSERT INTO public.question_registry (question_id, section_id, section_name, question_number, question_text, question_text_en, question_type, options, required, conditional_logic, parent_question, data_path, unit, display_order, version) VALUES
('q11_electricity', 'section_06_electricity', 'बिजली, कम्प्यूटर एवं इंटरनेट', 'Q11', 'बिजली कनेक्शन', 'Electricity connection', 'radio', '["हाँ", "नहीं"]'::jsonb, true, NULL, NULL, 'responses.section_06_electricity.q11_electricity', NULL, 70, '1.0.0'),
('q11_solar',       'section_06_electricity', 'बिजली, कम्प्यूटर एवं इंटरनेट', 'Q11', 'सौर ऊर्जा', 'Solar energy', 'radio', '["हाँ", "नहीं"]'::jsonb, false, NULL, NULL, 'responses.section_06_electricity.q11_solar', NULL, 71, '1.0.0'),
('q11_details',     'section_06_electricity', 'बिजली, कम्प्यूटर एवं इंटरनेट', 'Q11', 'कारण', 'Requirement details', 'textarea', NULL, false, '{"depends_on_any": ["q11_electricity","q11_solar"], "show_when": "नहीं"}'::jsonb, NULL, 'responses.section_06_electricity.q11_details', NULL, 72, '1.0.0'),
('q12_total',       'section_06_electricity', 'बिजली, कम्प्यूटर एवं इंटरनेट', 'Q12', 'कुल कम्प्यूटर', 'Total computers', 'number', NULL, true, NULL, NULL, 'responses.section_06_electricity.q12_total', NULL, 73, '1.0.0'),
('q12_working',     'section_06_electricity', 'बिजली, कम्प्यूटर एवं इंटरनेट', 'Q12', 'सही / कार्यशील कम्प्यूटर', 'Working computers', 'number', NULL, false, NULL, NULL, 'responses.section_06_electricity.q12_working', NULL, 74, '1.0.0'),
('q12_broken',      'section_06_electricity', 'बिजली, कम्प्यूटर एवं इंटरनेट', 'Q12', 'खराब कम्प्यूटर', 'Broken computers', 'number', NULL, false, NULL, NULL, 'responses.section_06_electricity.q12_broken', NULL, 75, '1.0.0'),
('q13_internet',    'section_06_electricity', 'बिजली, कम्प्यूटर एवं इंटरनेट', 'Q13', 'इंटरनेट कनेक्शन', 'Internet connection', 'radio', '["हाँ", "नहीं"]'::jsonb, true, NULL, NULL, 'responses.section_06_electricity.q13_internet', NULL, 76, '1.0.0'),
('q13_network',     'section_06_electricity', 'बिजली, कम्प्यूटर एवं इंटरनेट', 'Q13', 'नेटवर्क उपलब्धता', 'Network availability', 'radio', '["हाँ", "नहीं"]'::jsonb, false, NULL, NULL, 'responses.section_06_electricity.q13_network', NULL, 77, '1.0.0'),
('q13_details',     'section_06_electricity', 'बिजली, कम्प्यूटर एवं इंटरनेट', 'Q13', 'समस्या / आवश्यकता का विवरण', 'Problem/requirement details', 'textarea', NULL, false, '{"depends_on_any": ["q13_internet","q13_network"], "show_when": "नहीं"}'::jsonb, NULL, 'responses.section_06_electricity.q13_details', NULL, 78, '1.0.0');

-- ==========================================================================
-- SECTION 07: LABS (प्रयोगशाला) — Q14, Q15
-- ==========================================================================
INSERT INTO public.question_registry (question_id, section_id, section_name, question_number, question_text, question_text_en, question_type, options, required, conditional_logic, parent_question, data_path, unit, display_order, version) VALUES
('q14',            'section_07_labs', 'प्रयोगशाला', 'Q14', 'क्या विद्यालय में प्रयोगशाला (Lab) उपलब्ध है?', 'Is a laboratory available?', 'radio', '["हाँ", "नहीं"]'::jsonb, true, NULL, NULL, 'responses.section_07_labs.q14', NULL, 80, '1.0.0'),
('q14_lab_details','section_07_labs', 'प्रयोगशाला', 'Q14', 'प्रयोगशालाओं की विस्तृत जानकारी (प्रकार, उपलब्धता, स्थिति)', 'Lab details by type (available, condition, details)', 'nested_object', '{"lab_types": ["भौतिक विज्ञान","रसायन विज्ञान","भूगोल प्रयोगशाला","जीव विज्ञान","कम्प्यूटर लैब","अन्य"], "sub_fields": ["available","condition","details"]}'::jsonb, false, '{"depends_on": "q14", "show_when": "हाँ"}'::jsonb, 'q14', 'responses.section_07_labs.q14_lab_details', NULL, 81, '1.0.0'),
('q15',            'section_07_labs', 'प्रयोगशाला', 'Q15', 'क्या लैब में पर्याप्त संसाधन / उपकरण उपलब्ध हैं?', 'Are sufficient lab resources/equipment available?', 'radio', '["हाँ", "नहीं"]'::jsonb, true, NULL, NULL, 'responses.section_07_labs.q15', NULL, 82, '1.0.0'),
('q15_lab_requirements','section_07_labs', 'प्रयोगशाला', 'Q15', 'लैब उपकरण आवश्यकताएँ', 'Lab equipment requirements', 'table', '{"columns": ["lab_type","equipment","quantity","condition","details"]}'::jsonb, false, '{"depends_on": "q15", "show_when": "नहीं"}'::jsonb, 'q15', 'responses.section_07_labs.q15_lab_requirements', NULL, 83, '1.0.0');

-- ==========================================================================
-- SECTION 08: BOUNDARY (चारदीवारी) — Q16, Q17
-- ==========================================================================
INSERT INTO public.question_registry (question_id, section_id, section_name, question_number, question_text, question_text_en, question_type, options, required, conditional_logic, parent_question, data_path, unit, display_order, version) VALUES
('q16',         'section_08_boundary', 'चारदीवारी', 'Q16', 'क्या विद्यालय में चारदीवारी (Boundary Wall) उपलब्ध है?', 'Is a boundary wall available?', 'radio', '["हाँ", "नहीं"]'::jsonb, true, NULL, NULL, 'responses.section_08_boundary.q16', NULL, 90, '1.0.0'),
('q17_meters',  'section_08_boundary', 'चारदीवारी', 'Q17', 'चारदीवारी की आवश्यकता (मीटर में)', 'Boundary wall requirement in meters', 'number', NULL, false, '{"depends_on": "q16", "show_when": "नहीं"}'::jsonb, 'q16', 'responses.section_08_boundary.q17_meters', 'मीटर', 91, '1.0.0'),
('q17_details', 'section_08_boundary', 'चारदीवारी', 'Q17', 'अन्य विवरण', 'Other details', 'textarea', NULL, false, '{"depends_on": "q16", "show_when": "नहीं"}'::jsonb, 'q16', 'responses.section_08_boundary.q17_details', NULL, 92, '1.0.0');

-- ==========================================================================
-- SECTION 09: ROAD (सड़क मार्ग) — Q21, Q22, Q22A
-- ==========================================================================
INSERT INTO public.question_registry (question_id, section_id, section_name, question_number, question_text, question_text_en, question_type, options, required, conditional_logic, parent_question, data_path, unit, display_order, version) VALUES
('q21',                'section_09_road', 'सड़क मार्ग', 'Q21', 'क्या विद्यालय सड़क मार्ग से जुड़ा हुआ है?', 'Is the school connected by road?', 'radio', '["हाँ", "नहीं"]'::jsonb, true, NULL, NULL, 'responses.section_09_road.q21', NULL, 100, '1.0.0'),
('q22_distance',       'section_09_road', 'सड़क मार्ग', 'Q22', 'निकटतम सड़क से दूरी (किलोमीटर में)', 'Distance to nearest road (km)', 'number', NULL, true, '{"depends_on": "q21", "show_when": "नहीं"}'::jsonb, 'q21', 'responses.section_09_road.q22_distance', 'किलोमीटर', 101, '1.0.0'),
('q22_details',        'section_09_road', 'सड़क मार्ग', 'Q22', 'सड़क/रास्ते की समस्या का विवरण', 'Road/path problem details', 'textarea', NULL, false, '{"depends_on": "q21", "show_when": "नहीं"}'::jsonb, 'q21', 'responses.section_09_road.q22_details', NULL, 102, '1.0.0'),
('q22a_road_type',     'section_09_road', 'सड़क मार्ग', 'Q22A', 'विद्यालय से जुड़ा रास्ता किस प्रकार का है?', 'What type of road connects the school?', 'radio', '["कच्चा रस्ता", "पक्का रस्ता", "दोनों", "कोई रस्ता नहीं"]'::jsonb, false, NULL, NULL, 'responses.section_09_road.q22a_road_type', NULL, 103, '1.0.0'),
('q22a_kaccha_distance','section_09_road', 'सड़क मार्ग', 'Q22A', 'निकटतम कच्चा रस्ता — दूरी (किमी)', 'Nearest unpaved road distance (km)', 'number', NULL, false, NULL, NULL, 'responses.section_09_road.q22a_kaccha_distance', 'किलोमीटर', 104, '1.0.0'),
('q22a_pakka_distance','section_09_road', 'सड़क मार्ग', 'Q22A', 'निकटतम पक्का रस्ता — दूरी (किमी)', 'Nearest paved road distance (km)', 'number', NULL, false, NULL, NULL, 'responses.section_09_road.q22a_pakka_distance', 'किलोमीटर', 105, '1.0.0'),
('q22a_road_remarks',  'section_09_road', 'सड़क मार्ग', 'Q22A', 'रास्ते संबंधी अन्य विवरण / समस्या', 'Other road details/problems', 'textarea', NULL, false, NULL, NULL, 'responses.section_09_road.q22a_road_remarks', NULL, 106, '1.0.0');

-- ==========================================================================
-- SECTION 10: TOILET & WATER (शौचालय एवं पेयजल) — Q23, Q23A, Q23B, Q24, Q25, Q26, Q27
-- ==========================================================================
INSERT INTO public.question_registry (question_id, section_id, section_name, question_number, question_text, question_text_en, question_type, options, required, conditional_logic, parent_question, data_path, unit, display_order, version) VALUES
('q23_available',          'section_10_toilet_water', 'शौचालय एवं पेयजल', 'Q23', 'शौचालय उपलब्ध', 'Toilet available', 'radio', '["हाँ", "नहीं"]'::jsonb, true, NULL, NULL, 'responses.section_10_toilet_water.q23_available', NULL, 110, '1.0.0'),
('q23_girls_separate',    'section_10_toilet_water', 'शौचालय एवं पेयजल', 'Q23', 'बालिकाओं के लिए पृथक शौचालय', 'Separate toilet for girls', 'radio', '["हाँ", "नहीं"]'::jsonb, false, '{"depends_on": "q23_available", "show_when": "हाँ"}'::jsonb, 'q23_available', 'responses.section_10_toilet_water.q23_girls_separate', NULL, 111, '1.0.0'),
('q23_details',            'section_10_toilet_water', 'शौचालय एवं पेयजल', 'Q23', 'शौचालय की स्थिति / विवरण', 'Toilet condition/details', 'textarea', NULL, false, NULL, NULL, 'responses.section_10_toilet_water.q23_details', NULL, 112, '1.0.0'),
('q23_toilet_photo_preview','section_10_toilet_water', 'शौचालय एवं पेयजल', 'Q23A', 'शौचालय जियोटैगिंग फोटो (Base64)', 'Toilet geotagged photo preview', 'file', NULL, false, NULL, NULL, 'responses.section_10_toilet_water.q23_toilet_photo_preview', NULL, 113, '1.0.0'),
('q23_toilet_photo_name',  'section_10_toilet_water', 'शौचालय एवं पेयजल', 'Q23A', 'फोटो फाइल नाम', 'Photo file name', 'text', NULL, false, NULL, NULL, 'responses.section_10_toilet_water.q23_toilet_photo_name', NULL, 114, '1.0.0'),
('q23_toilet_geo_lat',     'section_10_toilet_water', 'शौचालय एवं पेयजल', 'Q23A', 'शौचालय GPS अक्षांश (Latitude)', 'Toilet GPS latitude', 'text', NULL, false, NULL, NULL, 'responses.section_10_toilet_water.q23_toilet_geo_lat', NULL, 115, '1.0.0'),
('q23_toilet_geo_lng',     'section_10_toilet_water', 'शौचालय एवं पेयजल', 'Q23A', 'शौचालय GPS देशांतर (Longitude)', 'Toilet GPS longitude', 'text', NULL, false, NULL, NULL, 'responses.section_10_toilet_water.q23_toilet_geo_lng', NULL, 116, '1.0.0'),
('q23_toilet_geo_notes',   'section_10_toilet_water', 'शौचालय एवं पेयजल', 'Q23A', 'शौचालय स्थिति पर टिप्पणी / नोट्स', 'Toilet condition notes', 'textarea', NULL, false, NULL, NULL, 'responses.section_10_toilet_water.q23_toilet_geo_notes', NULL, 117, '1.0.0'),
('q23b_approved_scheme',   'section_10_toilet_water', 'शौचालय एवं पेयजल', 'Q23B', 'क्या शौचालय किसी पूर्व योजना में स्वीकृत हुआ है?', 'Is toilet approved in any scheme?', 'radio', '["हाँ", "नहीं"]'::jsonb, true, NULL, NULL, 'responses.section_10_toilet_water.q23b_approved_scheme', NULL, 118, '1.0.0'),
('q23b_scheme_details',    'section_10_toilet_water', 'शौचालय एवं पेयजल', 'Q23B', 'योजना का नाम एवं विवरण', 'Scheme name and details', 'textarea', NULL, false, '{"depends_on": "q23b_approved_scheme", "show_when": "हाँ"}'::jsonb, 'q23b_approved_scheme', 'responses.section_10_toilet_water.q23b_scheme_details', NULL, 119, '1.0.0'),
('q23b_current_status',    'section_10_toilet_water', 'शौचालय एवं पेयजल', 'Q23B', 'वर्तमान स्थिति', 'Current status', 'text', NULL, false, '{"depends_on": "q23b_approved_scheme", "show_when": "हाँ"}'::jsonb, 'q23b_approved_scheme', 'responses.section_10_toilet_water.q23b_current_status', NULL, 120, '1.0.0'),
('q24',                    'section_10_toilet_water', 'शौचालय एवं पेयजल', 'Q24', 'क्या शौचालय में नल/जल की व्यवस्था है?', 'Is water connection available in toilet?', 'radio', '["हाँ", "नहीं"]'::jsonb, true, NULL, NULL, 'responses.section_10_toilet_water.q24', NULL, 121, '1.0.0'),
('q24_details',            'section_10_toilet_water', 'शौचालय एवं पेयजल', 'Q24', 'आवश्यकता का विवरण', 'Requirement details', 'textarea', NULL, false, '{"depends_on": "q24", "show_when": "नहीं"}'::jsonb, 'q24', 'responses.section_10_toilet_water.q24_details', NULL, 122, '1.0.0'),
('q25',                    'section_10_toilet_water', 'शौचालय एवं पेयजल', 'Q25', 'क्या विद्यालय में पेयजल सुविधा उपलब्ध है?', 'Is drinking water available?', 'radio', '["हाँ", "नहीं"]'::jsonb, true, NULL, NULL, 'responses.section_10_toilet_water.q25', NULL, 123, '1.0.0'),
('q25_source',             'section_10_toilet_water', 'शौचालय एवं पेयजल', 'Q25', 'पेयजल स्रोत', 'Drinking water source', 'select', '["टंकी", "हैंडपंप", "नल कनेक्शन", "अन्य"]'::jsonb, false, '{"depends_on": "q25", "show_when": "हाँ"}'::jsonb, 'q25', 'responses.section_10_toilet_water.q25_source', NULL, 124, '1.0.0'),
('q25_ro',                 'section_10_toilet_water', 'शौचालय एवं पेयजल', 'Q25', 'RO / Water Cooler उपलब्ध है?', 'Is RO/Water Cooler available?', 'radio', '["हाँ", "नहीं"]'::jsonb, false, '{"depends_on": "q25", "show_when": "हाँ"}'::jsonb, 'q25', 'responses.section_10_toilet_water.q25_ro', NULL, 125, '1.0.0'),
('q26_details',            'section_10_toilet_water', 'शौचालय एवं पेयजल', 'Q26', 'पानी की समस्या का विवरण', 'Water problem details', 'textarea', NULL, true, NULL, NULL, 'responses.section_10_toilet_water.q26_details', NULL, 126, '1.0.0'),
('q27',                    'section_10_toilet_water', 'शौचालय एवं पेयजल', 'Q27', 'क्या विद्यालय में टिन शेड (Tin shed) है?', 'Does the school have a tin shed?', 'radio', '["हाँ", "नहीं"]'::jsonb, true, NULL, NULL, 'responses.section_10_toilet_water.q27', NULL, 127, '1.0.0'),
('q27_details',            'section_10_toilet_water', 'शौचालय एवं पेयजल', 'Q27', 'टिन शेड आवश्यकता का विवरण', 'Tin shed requirement details', 'textarea', NULL, false, '{"depends_on": "q27", "show_when": "नहीं"}'::jsonb, 'q27', 'responses.section_10_toilet_water.q27_details', NULL, 128, '1.0.0');

-- ==========================================================================
-- SECTION 11: STUDENTS (छात्र विवरण) — Q29, Q30, Q31, Q32
-- ==========================================================================
INSERT INTO public.question_registry (question_id, section_id, section_name, question_number, question_text, question_text_en, question_type, options, required, conditional_logic, parent_question, data_path, unit, display_order, version) VALUES
('q29',       'section_11_students', 'छात्र विवरण', 'Q29', 'पालनहार योजना में लाभान्वित छात्रों का विवरण।', 'Details of Palanhar scheme beneficiary students.', 'table', '{"columns": ["student_name","class_name","palanhar_number","palanhar_category"]}'::jsonb, false, NULL, NULL, 'responses.section_11_students.q29', NULL, 130, '1.0.0'),
('q30',       'section_11_students', 'छात्र विवरण', 'Q30', 'विद्यालय में दिव्यांग छात्रों का विवरण दें।', 'Details of disabled students.', 'table', '{"columns": ["student_name","class_name","disability_type","percentage","certificate_number"]}'::jsonb, false, NULL, NULL, 'responses.section_11_students.q30', NULL, 131, '1.0.0'),
('q31_total', 'section_11_students', 'छात्र विवरण', 'Q31', 'कुल खिलाड़ी छात्र', 'Total player students', 'number', NULL, false, NULL, NULL, 'responses.section_11_students.q31_total', NULL, 132, '1.0.0'),
('q31',       'section_11_students', 'छात्र विवरण', 'Q31', 'विद्यालय में खिलाड़ी छात्रों का विवरण।', 'Details of player students.', 'table', '{"columns": ["student_name","class_name","sport","level"], "levels": ["जिला","राज्य","राष्ट्रीय","अंतरराष्ट्रीय"]}'::jsonb, false, NULL, NULL, 'responses.section_11_students.q31', NULL, 133, '1.0.0'),
('q32',       'section_11_students', 'छात्र विवरण', 'Q32', 'क्या विद्यालय में Scout Guide / NCC है?', 'Does the school have Scout Guide / NCC?', 'radio', '["हाँ", "नहीं"]'::jsonb, true, NULL, NULL, 'responses.section_11_students.q32', NULL, 134, '1.0.0'),
('q32_table', 'section_11_students', 'छात्र विवरण', 'Q32', 'Scout / NCC छात्रों का विवरण', 'Scout/NCC students details', 'table', '{"columns": ["student_name","class_name","level","details"]}'::jsonb, false, '{"depends_on": "q32", "show_when": "हाँ"}'::jsonb, 'q32', 'responses.section_11_students.q32_table', NULL, 135, '1.0.0');

-- ==========================================================================
-- SECTION 12: SMART CLASSROOM, LAND & SPORTS — Q18, Q19, Q20, Q33, Q34, Q35
-- ==========================================================================
INSERT INTO public.question_registry (question_id, section_id, section_name, question_number, question_text, question_text_en, question_type, options, required, conditional_logic, parent_question, data_path, unit, display_order, version) VALUES
('q33',                 'section_12_smart_land', 'स्मार्ट क्लासरूम, भूमि एवं खेल मैदान', 'Q33', 'क्या विद्यालय में स्मार्ट क्लासरूम है?', 'Does the school have a smart classroom?', 'radio', '["हाँ", "नहीं"]'::jsonb, true, NULL, NULL, 'responses.section_12_smart_land.q33', NULL, 140, '1.0.0'),
('q33_count',           'section_12_smart_land', 'स्मार्ट क्लासरूम, भूमि एवं खेल मैदान', 'Q33', 'स्मार्ट क्लासरूम की संख्या', 'Number of smart classrooms', 'number', NULL, false, '{"depends_on": "q33", "show_when": "हाँ"}'::jsonb, 'q33', 'responses.section_12_smart_land.q33_count', NULL, 141, '1.0.0'),
('q33_smart_classes',   'section_12_smart_land', 'स्मार्ट क्लासरूम, भूमि एवं खेल मैदान', 'Q33', 'कौन-कौन सी कक्षाएँ स्मार्ट क्लास हैं? (चुनें)', 'Which classes are smart classes? (Select)', 'checkbox', '["1","2","3","4","5","6","7","8","9","10","11","12"]'::jsonb, false, '{"depends_on": "q33", "show_when": "हाँ"}'::jsonb, 'q33', 'responses.section_12_smart_land.q33_smart_classes', NULL, 142, '1.0.0'),
('q33_working',         'section_12_smart_land', 'स्मार्ट क्लासरूम, भूमि एवं खेल मैदान', 'Q33', 'क्या स्मार्ट क्लासरूम उपकरण क्रियाशील हैं?', 'Are smart classroom devices working?', 'radio', '["क्रियाशील (Working)", "अक्रियाशील (Not Working)"]'::jsonb, false, '{"depends_on": "q33", "show_when": "हाँ"}'::jsonb, 'q33', 'responses.section_12_smart_land.q33_working', NULL, 143, '1.0.0'),
('q33_details',         'section_12_smart_land', 'स्मार्ट क्लासरूम, भूमि एवं खेल मैदान', 'Q33', 'उपकरण/अन्य विवरण', 'Equipment/other details', 'textarea', NULL, false, '{"depends_on": "q33", "show_when": "हाँ"}'::jsonb, 'q33', 'responses.section_12_smart_land.q33_details', NULL, 144, '1.0.0'),
('q33_required_count',  'section_12_smart_land', 'स्मार्ट क्लासरूम, भूमि एवं खेल मैदान', 'Q33', 'आवश्यक स्मार्ट क्लासरूम की संख्या', 'Required smart classrooms count', 'number', NULL, false, '{"depends_on": "q33", "show_when": "नहीं"}'::jsonb, 'q33', 'responses.section_12_smart_land.q33_required_count', NULL, 145, '1.0.0'),
('q33_required_details','section_12_smart_land', 'स्मार्ट क्लासरूम, भूमि एवं खेल मैदान', 'Q33', 'आवश्यक उपकरण / आवश्यकता का विवरण', 'Required equipment/details', 'textarea', NULL, false, '{"depends_on": "q33", "show_when": "नहीं"}'::jsonb, 'q33', 'responses.section_12_smart_land.q33_required_details', NULL, 146, '1.0.0'),
('q34_condition',       'section_12_smart_land', 'स्मार्ट क्लासरूम, भूमि एवं खेल मैदान', 'Q34', 'रास्ते की वर्तमान स्थिति', 'Current path condition', 'text', NULL, true, NULL, NULL, 'responses.section_12_smart_land.q34_condition', NULL, 147, '1.0.0'),
('q34_problem',         'section_12_smart_land', 'स्मार्ट क्लासरूम, भूमि एवं खेल मैदान', 'Q34', 'रास्ते की समस्या', 'Path problem', 'textarea', NULL, false, NULL, NULL, 'responses.section_12_smart_land.q34_problem', NULL, 148, '1.0.0'),
('q34_details',         'section_12_smart_land', 'स्मार्ट क्लासरूम, भूमि एवं खेल मैदान', 'Q34', 'भूमि की आवश्यकता / अन्य विवरण', 'Land requirement/other details', 'textarea', NULL, false, NULL, NULL, 'responses.section_12_smart_land.q34_details', NULL, 149, '1.0.0'),
('q35_available',       'section_12_smart_land', 'स्मार्ट क्लासरूम, भूमि एवं खेल मैदान', 'Q35', 'उपलब्ध भूमि', 'Available land', 'text', NULL, true, NULL, NULL, 'responses.section_12_smart_land.q35_available', NULL, 150, '1.0.0'),
('q35_condition',       'section_12_smart_land', 'स्मार्ट क्लासरूम, भूमि एवं खेल मैदान', 'Q35', 'भूमि की स्थिति', 'Land condition', 'text', NULL, false, NULL, NULL, 'responses.section_12_smart_land.q35_condition', NULL, 151, '1.0.0'),
('q35_details',         'section_12_smart_land', 'स्मार्ट क्लासरूम, भूमि एवं खेल मैदान', 'Q35', 'अतिरिक्त भूमि की आवश्यकता / अन्य विवरण', 'Additional land requirement/details', 'textarea', NULL, false, NULL, NULL, 'responses.section_12_smart_land.q35_details', NULL, 152, '1.0.0'),
('q18',                 'section_12_smart_land', 'स्मार्ट क्लासरूम, भूमि एवं खेल मैदान', 'Q18', 'क्या विद्यालय में खेल मैदान है?', 'Does the school have a sports ground?', 'radio', '["हाँ", "नहीं"]'::jsonb, true, NULL, NULL, 'responses.section_12_smart_land.q18', NULL, 153, '1.0.0'),
('q18_condition',       'section_12_smart_land', 'स्मार्ट क्लासरूम, भूमि एवं खेल मैदान', 'Q18', 'खेल मैदान की स्थिति', 'Sports ground condition', 'text', NULL, false, '{"depends_on": "q18", "show_when": "हाँ"}'::jsonb, 'q18', 'responses.section_12_smart_land.q18_condition', NULL, 154, '1.0.0'),
('q18_details',         'section_12_smart_land', 'स्मार्ट क्लासरूम, भूमि एवं खेल मैदान', 'Q18', 'आवश्यकता / समस्या का विवरण', 'Requirement/problem details', 'textarea', NULL, false, '{"depends_on": "q18", "show_when": "हाँ"}'::jsonb, 'q18', 'responses.section_12_smart_land.q18_details', NULL, 155, '1.0.0'),
('q18_has_land',        'section_12_smart_land', 'स्मार्ट क्लासरूम, भूमि एवं खेल मैदान', 'Q18', 'क्या आपके पास जमीन है?', 'Do you have land?', 'radio', '["हाँ", "नहीं"]'::jsonb, false, '{"depends_on": "q18", "show_when": "नहीं"}'::jsonb, 'q18', 'responses.section_12_smart_land.q18_has_land', NULL, 156, '1.0.0'),
('q18_govt_land_nearby','section_12_smart_land', 'स्मार्ट क्लासरूम, भूमि एवं खेल मैदान', 'Q18', 'क्या आपके आस-पास 5 किलोमीटर के अंदर कोई सरकारी जमीन है?', 'Is there govt land within 5km?', 'radio', '["हाँ", "नहीं"]'::jsonb, false, '{"depends_on": "q18_has_land", "show_when": "नहीं"}'::jsonb, 'q18_has_land', 'responses.section_12_smart_land.q18_govt_land_nearby', NULL, 157, '1.0.0'),
('q18_khasra_number',   'section_12_smart_land', 'स्मार्ट क्लासरूम, भूमि एवं खेल मैदान', 'Q18', 'खसरा नंबर', 'Khasra number', 'text', NULL, false, '{"depends_on": "q18_govt_land_nearby", "show_when": "हाँ"}'::jsonb, 'q18_govt_land_nearby', 'responses.section_12_smart_land.q18_khasra_number', NULL, 158, '1.0.0'),
('q18_govt_land_details','section_12_smart_land', 'स्मार्ट क्लासरूम, भूमि एवं खेल मैदान', 'Q18', 'सरकारी जमीन का विवरण', 'Government land details', 'textarea', NULL, false, '{"depends_on": "q18_govt_land_nearby", "show_when": "हाँ"}'::jsonb, 'q18_govt_land_nearby', 'responses.section_12_smart_land.q18_govt_land_details', NULL, 159, '1.0.0'),
('q19_area',            'section_12_smart_land', 'स्मार्ट क्लासरूम, भूमि एवं खेल मैदान', 'Q19', 'अतिक्रमित भूमि (बीघा में)', 'Encroached land (in bigha)', 'number', NULL, true, NULL, NULL, 'responses.section_12_smart_land.q19_area', 'बीघा', 160, '1.0.0'),
('q19_details',         'section_12_smart_land', 'स्मार्ट क्लासरूम, भूमि एवं खेल मैदान', 'Q19', 'अतिक्रमण का विवरण', 'Encroachment details', 'textarea', NULL, false, NULL, NULL, 'responses.section_12_smart_land.q19_details', NULL, 161, '1.0.0'),
('q20',                 'section_12_smart_land', 'स्मार्ट क्लासरूम, भूमि एवं खेल मैदान', 'Q20', 'क्या विद्यालय में खेलों की सामग्री है?', 'Does the school have sports equipment?', 'radio', '["हाँ", "नहीं"]'::jsonb, true, NULL, NULL, 'responses.section_12_smart_land.q20', NULL, 162, '1.0.0'),
('q20_details',         'section_12_smart_land', 'स्मार्ट क्लासरूम, भूमि एवं खेल मैदान', 'Q20', 'आवश्यक खेल सामग्री का विवरण', 'Required sports equipment details', 'textarea', NULL, false, '{"depends_on": "q20", "show_when": "नहीं"}'::jsonb, 'q20', 'responses.section_12_smart_land.q20_details', NULL, 163, '1.0.0');

-- ==========================================================================
-- SECTION 13: COMMITTEES & PANCHAYAT — Q36, Q37, Q38
-- ==========================================================================
INSERT INTO public.question_registry (question_id, section_id, section_name, question_number, question_text, question_text_en, question_type, options, required, conditional_logic, parent_question, data_path, unit, display_order, version) VALUES
('q36',       'section_13_committees', 'समिति एवं पंचायत', 'Q36', 'विद्यालय विकास प्रबंधन स्थिति', 'School Development Management Status', 'table', '{"columns": ["name","occupation","mobile","details"]}'::jsonb, true, NULL, NULL, 'responses.section_13_committees.q36', NULL, 170, '1.0.0'),
('q37',       'section_13_committees', 'समिति एवं पंचायत', 'Q37', 'सरपंच और वार्ड पंच की सूचना नाम व मोबाइल नंबर सहित दें।', 'Sarpanch and Ward Panch information with name and mobile.', 'table', '{"sarpanch_columns": ["name","mobile"], "ward_panch_columns": ["name","mobile","ward_number","details"]}'::jsonb, true, NULL, NULL, 'responses.section_13_committees.q37', NULL, 171, '1.0.0'),
('q38',       'section_13_committees', 'समिति एवं पंचायत', 'Q38', 'SMC / SDMC / अन्य कार्यकारिणी सदस्यों का विवरण।', 'SMC/SDMC/Other executive members details.', 'table', '{"columns": ["name","post","mobile","committee_type","tenure"], "committee_types": ["SMC","SDMC","अन्य"]}'::jsonb, true, NULL, NULL, 'responses.section_13_committees.q38', NULL, 172, '1.0.0');

-- ==========================================================================
-- SECTION 14: EXAMS (परीक्षा परिणाम) — Q39
-- ==========================================================================
INSERT INTO public.question_registry (question_id, section_id, section_name, question_number, question_text, question_text_en, question_type, options, required, conditional_logic, parent_question, data_path, unit, display_order, version) VALUES
('q39', 'section_14_exams', 'परीक्षा परिणाम', 'Q39', 'पिछले वर्ष का परीक्षा परिणाम (कक्षावार प्रतिशत) दर्ज करें', 'Enter last year exam results (class-wise percentage)', 'table', '{"columns": ["class_name","first_div","second_div","third_div","total"], "classes": ["कक्षा 5","कक्षा 8","कक्षा 10","कक्षा 12"]}'::jsonb, true, NULL, NULL, 'responses.section_14_exams.q39', NULL, 180, '1.0.0');

-- ==========================================================================
-- SECTION 15: REQUIREMENTS (अन्य आवश्यक सुविधाएँ) — Q40
-- ==========================================================================
INSERT INTO public.question_registry (question_id, section_id, section_name, question_number, question_text, question_text_en, question_type, options, required, conditional_logic, parent_question, data_path, unit, display_order, version) VALUES
('q40', 'section_15_requirements', 'अन्य आवश्यक सुविधाएँ', 'Q40', 'अन्य आवश्यक सुविधाओं की मांग', 'Other facility requirements', 'table', '{"columns": ["name","category","description","quantity","unit","priority","estimated_cost","location","details"], "categories": ["भवन","कक्षा-कक्ष","फर्नीचर","बिजली","सौर ऊर्जा","कंप्यूटर","इंटरनेट","लैब","चारदीवारी","खेल मैदान","खेल सामग्री","सड़क","शौचालय","पेयजल","स्मार्ट क्लासरूम","भूमि","पुस्तकालय","अन्य"], "priorities": ["high","medium","low"]}'::jsonb, false, NULL, NULL, 'responses.section_15_requirements.q40', NULL, 190, '1.0.0');

-- ==========================================================================
-- COVERAGE VERIFICATION QUERY
-- Run this to verify 100% coverage
-- ==========================================================================
-- SELECT 
--   COUNT(*) AS total_questions,
--   COUNT(DISTINCT section_id) AS total_sections,
--   COUNT(DISTINCT question_number) FILTER (WHERE question_number IS NOT NULL) AS distinct_question_numbers,
--   COUNT(*) FILTER (WHERE required = true) AS required_questions,
--   COUNT(*) FILTER (WHERE conditional_logic IS NOT NULL) AS conditional_questions,
--   COUNT(*) FILTER (WHERE parent_question IS NOT NULL) AS sub_questions
-- FROM public.question_registry;
