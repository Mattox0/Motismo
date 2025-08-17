import Image from 'next/image';

interface IEmptyStateProps {
  title?: string;
  description?: string;
}

export const EmptyState = ({ title, description }: IEmptyStateProps) => {
  return (
    <div className="empty-state">
      <Image
        src="/empty_state_quizz.svg"
        alt="État vide"
        width={200}
        height={200}
        className="empty-state__image"
        priority
      />
      {title && <h3 className="empty-state__title">{title}</h3>}
      {description && <p className="empty-state__description">{description}</p>}
    </div>
  );
};
