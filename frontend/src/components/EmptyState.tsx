import Image from 'next/image';

interface EmptyStateProps {
  title: string;
  description: string;
}

export const EmptyState = ({ title, description }: EmptyStateProps) => {
  return (
    <div className="empty-state">
      <Image
        src="/empty_state_quizz.svg"
        alt="État vide"
        width={200}
        height={200}
        className="empty-state__image"
      />
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__description">{description}</p>
    </div>
  );
};
