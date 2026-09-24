import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User } from 'lucide-react';
import emblem from '../../assets/Emblem_of_India.svg';
import neevLogo from '../../assets/neev.png';
import './Header.css';

export default function Header() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const displayName = user?.user_metadata?.full_name || user?.email || '';

  return (
    <header className="custom-top-header">
      <div className="header-left">
        <img src={emblem} alt="भारत का राजचिह्न" className="header-logo" />
        <h1 className="header-title">रविन्द्र सिंह भाटी</h1>
      </div>
      <div className="header-right">
        {user && (
          <div className="header-user-section" ref={dropdownRef} style={{ position: 'relative' }}>
            <button 
              className="profile-icon-btn" 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid var(--gray-200)',
                borderRadius: '50%',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--primary-700)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                transition: 'all 0.2s ease',
                padding: 0
              }}
            >
              <User size={22} />
            </button>
            
            {dropdownOpen && (
              <div 
                className="profile-dropdown"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  background: 'rgba(255, 255, 255, 0.98)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid var(--gray-200)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  minWidth: '220px',
                  zIndex: 100,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ padding: '16px', borderBottom: '1px solid var(--gray-100)' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Signed in as</p>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '15px', color: 'var(--gray-800)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {displayName}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '14px 16px',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--danger-600)',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: 600,
                    textAlign: 'left',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'var(--danger-50)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <LogOut size={18} />
                  लॉग आउट
                </button>
              </div>
            )}
          </div>
        )}
        <img src={neevLogo} alt="Neev" className="header-logo neev-logo" />
      </div>
    </header>
  );
}
