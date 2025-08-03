import React from 'react';
import './PageTransition.css';

interface PageTransitionProps {
  children: React.ReactNode;
  isActive: boolean;
  className?: string;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children, isActive, className = '' }) => {
  return (
    <div className={`page-transition ${isActive ? 'active' : ''} ${className}`}>
      {children}
    </div>
  );
};

export default PageTransition; 