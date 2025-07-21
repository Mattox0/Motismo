import { FC, ReactNode } from 'react';

interface IFonctionalityItemProps {
  title: string;
  description: string;
  icon: ReactNode;
}

export const FonctionalityItem: FC<IFonctionalityItemProps> = ({ title, description, icon }) => {
  return (
    <div className="fonctionality-item">
      <div className="fonctionality-item-icon-wrapper">{icon}</div>
      <div className="fonctionality-item-content">
        <h3 className="fonctionality-item-title">{title}</h3>
        <p className="fonctionality-item-description">{description}</p>
      </div>
    </div>
  );
};
