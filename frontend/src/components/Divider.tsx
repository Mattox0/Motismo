import React from 'react';

interface IDividerProps {
  text: string;
}

const Divider: React.FC<IDividerProps> = ({ text }) => {
  return (
    <div className="auth-divider">
      <span className="divider-text">{text}</span>
    </div>
  );
};

export default Divider;
