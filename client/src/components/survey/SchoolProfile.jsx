import FloatingInput from '../common/FloatingInput';
import { useSurvey } from '../../context/SurveyContext';
import { validateSchoolProfile } from '../../utils/validation';

export default function SchoolProfile() {
  const { state, setSchool, dispatch } = useSurvey();
  const { school, errors } = state;

  const handleChange = (name, value) => {
    setSchool({ [name]: value });
    // Clear error on change
    if (errors[name]) {
      dispatch({ type: 'SET_ERRORS', errors: { ...errors, [name]: null } });
    }
  };

  return (
    <div>
      <div className="section-header">
        <span className="section-number">विद्यालय प्रोफाइल</span>
        <h2 className="section-title">विद्यालय की मूलभूत जानकारी</h2>
        <p className="section-description">विद्यालय का आधारभूत विवरण दर्ज करें। तारांकित (*) फ़ील्ड अनिवार्य हैं।</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">विद्यालय विवरण</h3>
        </div>

        <FloatingInput
          label="विद्यालय का नाम" name="name"
          value={school.name} onChange={handleChange}
          required error={errors.name}
        />

        <div className="inline-fields">
          <FloatingInput
            label="राजस्व गाँव" name="village"
            value={school.village} onChange={handleChange}
            required error={errors.village}
          />
          <FloatingInput
            label="ग्राम पंचायत" name="gram_panchayat"
            value={school.gram_panchayat} onChange={handleChange}
            required error={errors.gram_panchayat}
          />
        </div>

        <div className="inline-fields">
          <FloatingInput
            label="पंचायत समिति" name="panchayat_samiti"
            value={school.panchayat_samiti} onChange={handleChange}
            required error={errors.panchayat_samiti}
          />
          <FloatingInput
            label="UDISE CODE" name="udise_code"
            value={school.udise_code} onChange={handleChange}
            required error={errors.udise_code}
            inputMode="numeric" maxLength={11}
          />
        </div>

        <FloatingInput
          label="विद्यालय कोड (School Code / शाला दर्पण कोड)" name="school_code"
          value={school.school_code || ''} onChange={handleChange}
          placeholder="उदा. 219154"
        />
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">संस्थाप्रधान विवरण</h3>
        </div>

        <FloatingInput
          label="संस्थाप्रधान का नाम" name="principal_name"
          value={school.principal_name} onChange={handleChange}
          required error={errors.principal_name}
        />

        <div className="inline-fields">
          <FloatingInput
            label="मोबाइल नंबर" name="principal_mobile"
            value={school.principal_mobile} onChange={handleChange}
            required error={errors.principal_mobile}
            type="tel" inputMode="numeric" maxLength={10}
          />
          <FloatingInput
            label="ईमेल" name="principal_email"
            value={school.principal_email} onChange={handleChange}
            error={errors.principal_email} type="email"
          />
        </div>
      </div>
    </div>
  );
}
