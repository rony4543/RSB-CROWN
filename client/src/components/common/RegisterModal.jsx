import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './RegisterModal.css';

export default function RegisterModal({ isOpen, onClose, onRegistered }) {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (!fullName.trim()) {
      setError('कृपया अपना नाम दर्ज करें।');
      return;
    }
    if (!email.trim()) {
      setError('कृपया ईमेल दर्ज करें।');
      return;
    }
    if (password.length < 6) {
      setError('पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।');
      return;
    }
    if (password !== confirmPassword) {
      setError('पासवर्ड और पुष्टि पासवर्ड मेल नहीं खाते।');
      return;
    }

    setLoading(true);
    try {
      const data = await signUp(email, password, { full_name: fullName.trim() });

      // Check if email confirmation is required
      if (data?.user?.identities?.length === 0) {
        setError('यह ईमेल पहले से पंजीकृत है।');
        setLoading(false);
        return;
      }

      setSuccess(true);

      // If Supabase auto-confirms (email confirmation disabled), 
      // the user is already logged in, so we can navigate
      if (data?.session) {
        setTimeout(() => {
          onRegistered?.();
          onClose();
        }, 1500);
      }
      // Otherwise show success message about email confirmation
    } catch (err) {
      const msg = err?.message || 'रजिस्ट्रेशन में त्रुटि हुई।';
      // Map common Supabase auth errors to Hindi
      if (msg.includes('already registered') || msg.includes('already exists')) {
        setError('यह ईमेल पहले से पंजीकृत है। कृपया लॉगिन करें।');
      } else if (msg.includes('valid email')) {
        setError('कृपया एक सही ईमेल पता दर्ज करें।');
      } else if (msg.includes('least 6')) {
        setError('पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="register-overlay" onClick={handleOverlayClick}>
      <div className="register-modal">
        <button className="register-close-btn" onClick={onClose} type="button" aria-label="बंद करें">
          ✕
        </button>

        <h2 className="register-title">नया खाता बनाएं</h2>
        <p className="register-subtitle">अपनी जानकारी दर्ज करें</p>

        {success ? (
          <div className="register-success">
            <p>✅ खाता सफलतापूर्वक बनाया गया!</p>
            <small>आप अब लॉगिन कर सकते हैं।</small>
          </div>
        ) : (
          <form className="register-form" onSubmit={handleSubmit}>
            {error && <div className="register-error">{error}</div>}

            <div className="register-field">
              <label className="register-label" htmlFor="reg-fullname">पूरा नाम</label>
              <input
                id="reg-fullname"
                className="register-input"
                type="text"
                placeholder="अपना नाम दर्ज करें"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
              />
            </div>

            <div className="register-field">
              <label className="register-label" htmlFor="reg-email">ईमेल</label>
              <input
                id="reg-email"
                className="register-input"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="register-field">
              <label className="register-label" htmlFor="reg-password">पासवर्ड</label>
              <input
                id="reg-password"
                className="register-input"
                type="password"
                placeholder="कम से कम 6 अक्षर"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <div className="register-field">
              <label className="register-label" htmlFor="reg-confirm">पासवर्ड पुष्टि</label>
              <input
                id="reg-confirm"
                className={`register-input ${password && confirmPassword && password !== confirmPassword ? 'error' : ''}`}
                type="password"
                placeholder="पासवर्ड दोबारा दर्ज करें"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="register-submit-btn"
              disabled={loading}
            >
              {loading ? 'खाता बनाया जा रहा है...' : 'रजिस्टर करें'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
