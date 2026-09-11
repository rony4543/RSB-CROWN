import React from 'react';
import { Mail, Phone } from 'lucide-react';
import logo from '../../assets/logo.png';
import './Header.css';

export default function Header() {
  return (
    <header className="custom-top-header">
      <div className="header-left">
        <img src={logo} alt="Satyameva Jayate Logo" className="header-logo" />
        <h1 className="header-title">JYANITI</h1>
      </div>
      <div className="header-right">
        <div className="header-contact">
          <Mail className="contact-icon" size={18} />
          <span>info@jyaniti.com</span>
        </div>
        <div className="header-contact">
          <Phone className="contact-icon" size={18} />
          <span>+91 999 999 9999</span>
        </div>
      </div>
    </header>
  );
}
