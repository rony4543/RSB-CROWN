import React from 'react';
import emblem from '../../assets/Emblem_of_India.svg';
import neevLogo from '../../assets/neev.png';
import './Header.css';

export default function Header() {
  return (
    <header className="custom-top-header">
      <div className="header-left">
        <img src={emblem} alt="भारत का राजचिह्न" className="header-logo" />
        <h1 className="header-title">रविन्द्र सिंह भाटी</h1>
      </div>
      <div className="header-right">
        <img src={neevLogo} alt="Neev" className="header-logo neev-logo" />
      </div>
    </header>
  );
}
