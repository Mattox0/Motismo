import React from 'react';

interface DividerProps {
  text: string;
}

const Divider: React.FC<DividerProps> = ({ text }) => {
  return (
    <div className="auth-divider">
      <span className="divider-text">{text}</span>
    </div>
  );
};

export default Divider;
