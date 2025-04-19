import { FC, ReactNode } from 'react';

interface CallToActionProps {
  icon: ReactNode;
  title: string;
  description: string;
  button: ReactNode;
  input?: ReactNode;
  variant: 'primary' | 'secondary';
  onSubmit?: () => void;
}

export const CallToAction: FC<CallToActionProps> = ({
  icon,
  title,
  description,
  input,
  button,
  variant,
  onSubmit,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.();
  };

  const content = (
    <>
      <div className="cta-title">
        <div className="cta-icon">{icon}</div>
        <h3 className="cta-title-text">{title}</h3>
      </div>
      <p>{description}</p>
      {input}
      {button && <div className="cta-button">{button}</div>}
    </>
  );

  if (input && onSubmit) {
    return (
      <form onSubmit={handleSubmit} className={`cta-container ${variant}`}>
        {content}
      </form>
    );
  }

  return <div className={`cta-container ${variant}`}>{content}</div>;
};
