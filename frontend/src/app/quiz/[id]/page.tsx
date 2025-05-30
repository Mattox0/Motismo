import { QuizzPage } from '@/containers/QuizzPage';
import { GlobalLayout } from '@/layout/GlobalLayout';
import { QuizzProvider } from '@/providers/QuizzProvider';

export default async function QuizEditionPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  return (
    <GlobalLayout screened>
      <QuizzProvider quizId={id}>
        <QuizzPage quizzId={id} />
      </QuizzProvider>
    </GlobalLayout>
  );
}
