import { CardGamePage } from '@/containers/CardGamePage';
import { GlobalLayout } from '@/layout/GlobalLayout';
import { CardProvider } from '@/providers/CardProvider';

export default async function CardGame({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <GlobalLayout screened>
      <CardProvider quizId={id}>
        <CardGamePage />
      </CardProvider>
    </GlobalLayout>
  );
}
