import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({ className = "", isStatic = false }) => {
  const content = (
    <img
      src="/kamau.png"
      alt="KAMAU"
      className="h-[3px] md:h-[38px] w-auto object-contain"
    />
  );

  if (isStatic) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {content}
      </div>
    );
  }

  return (
    <Link to="/" className={`flex items-center gap-3 active:scale-95 transition-transform ${className}`}>
      {content}
    </Link>
  );
};

export default Logo;
