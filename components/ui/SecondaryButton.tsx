
import React from 'react';

interface SecondaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

const SecondaryButton: React.FC<SecondaryButtonProps> = ({ children, className = '', ...props }) => {
  return (
    <button
      className={`
        btn-secondary
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default React.memo(SecondaryButton);
