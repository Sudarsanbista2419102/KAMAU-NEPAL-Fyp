import React from 'react';

const Button = ({
  children, variant = 'primary', size = 'md', className = '', ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl';
  const variants = {
    primary: 'bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500 shadow-md hover:shadow-lg transform hover:-translate-y-0.5',
    secondary: 'bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500 shadow-md hover:shadow-lg transform hover:-translate-y-0.5',
    outline: 'border-2 border-slate-200 bg-transparent text-slate-700 hover:bg-slate-50 hover:border-slate-300 focus:ring-slate-400',
    ghost: 'bg-transparent text-teal-700 hover:bg-teal-50 focus:ring-teal-200',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 shadow-md'
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-8 py-3.5 text-lg',
    icon: 'p-2'
  };
  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
