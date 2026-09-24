import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to new survey form
  if (!authLoading && user) {
    return <Navigate to="/survey/new" replace />;
  }

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      // Supabase will automatically redirect to Google and then back to /survey/new
    } catch (err) {
      setError(err?.message || 'गूगल से लॉगिन करने में त्रुटि हुई।');
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      overflowX: 'hidden',
      overflowY: 'auto',
      overscrollBehaviorY: 'contain',
      fontFamily: 'sans-serif'
    }}>
      {/* Top Left Branding */}
      <div style={{
        position: 'absolute',
        top: '30px',
        left: '40px',
        display: 'flex',
        alignItems: 'center',
        zIndex: 10
      }}>
        <img src="/emblem.svg" alt="Satyameva Jayate Logo" style={{ height: '90px', width: 'auto', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
      </div>

      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          zIndex: -2
        }}
      >
        <source src="/login-bg.mp4" type="video/mp4" />
      </video>

      {/* Overlay film (20% opacity) */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        zIndex: -1
      }} />

      {/* Login Form Container */}
      <div style={{
        minHeight: '100vh',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingTop: '120px',
        paddingBottom: '10vh',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          width: '100%',
          maxWidth: '350px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}>
          
          {/* Error Message */}
          {error && (
            <div style={{
              background: 'rgba(220, 38, 38, 0.9)',
              color: 'white',
              padding: '10px 16px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              textAlign: 'center',
              backdropFilter: 'blur(4px)',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
              animation: 'fadeIn 0.3s ease-out',
              width: '100%'
            }}>
              {error}
            </div>
          )}

          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              backgroundColor: 'white',
              color: '#333',
              border: 'none',
              borderRadius: '30px',
              padding: '14px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              width: '100%',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              opacity: loading ? 0.8 : 1,
              transition: 'all 0.3s ease',
            }}
            onMouseOver={(e) => {
              if(!loading) e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              if(!loading) e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              <path d="M1 1h22v22H1z" fill="none"/>
            </svg>
            {loading ? 'प्रतीक्षा करें...' : 'Google से लॉगिन करें'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
