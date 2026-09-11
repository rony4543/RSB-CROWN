import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // Proceed to form for now
    navigate('/survey/new');
  };

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      overflow: 'hidden',
      fontFamily: 'sans-serif'
    }}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Yatra+One&display=swap');
        `}
      </style>

      {/* Top Left Branding */}
      <div style={{
        position: 'absolute',
        top: '30px',
        left: '40px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        zIndex: 10
      }}>
        <img src="/emblem.svg" alt="Satyameva Jayate Logo" style={{ height: '90px', width: 'auto', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
        <span style={{
          fontFamily: "'Yatra One', system-ui",
          fontSize: '48px',
          color: 'white',
          textShadow: '0 3px 8px rgba(0,0,0,0.8)',
          letterSpacing: '2px'
        }}>
          जनकली
        </span>
      </div>

      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: -2
        }}
      >
        <source src="/login-bg.mp4" type="video/mp4" />
      </video>

      {/* Overlay film (20% opacity) */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        zIndex: -1
      }} />

      {/* Login Form Container */}
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'flex-end', // push towards bottom so it doesn't cover face as much
        justifyContent: 'center',
        paddingBottom: '10vh', // give some space from the bottom
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          width: '100%',
          maxWidth: '350px',
          padding: '20px'
        }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <input 
                type="text" 
                placeholder="यूज़रनेम" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  border: 'none',
                  background: 'white',
                  borderRadius: '30px',
                  padding: '14px 24px',
                  fontSize: '16px',
                  color: 'black',
                  outline: 'none',
                  width: '100%',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
              />
              
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <input 
                  type="password" 
                  placeholder="पासवर्ड"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    border: 'none',
                    background: 'white',
                    borderRadius: '30px',
                    padding: '14px 24px',
                    fontSize: '16px',
                    color: 'black',
                    outline: 'none',
                    width: '100%',
                    fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                />
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '12px',
                  padding: '0 10px',
                  fontSize: '14px',
                  color: 'white',
                  fontWeight: '700',
                  textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                }}>
                  <span style={{ cursor: 'pointer' }}>नया उपयोगकर्ता?</span>
                  <span style={{ cursor: 'pointer' }}>पासवर्ड भूल गए?</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
              <button 
                type="submit"
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '30px',
                  padding: '14px 40px',
                  fontSize: '16px',
                  fontWeight: '700',
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  width: '100%',
                  boxShadow: '0 4px 12px rgba(0,123,255,0.4)'
                }}
              >
                लॉगिन
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
