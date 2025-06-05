import { CardPage } from '@/containers/CardPage';
import { GlobalLayout } from '@/layout/GlobalLayout';
import { CardProvider } from '@/providers/CardProvider';

export default async function CardEditionPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  return (
    <GlobalLayout screened>
      <CardProvider quizId={id}>
        <CardPage quizzId={id} />
      </CardProvider>
    </GlobalLayout>
  );
}
