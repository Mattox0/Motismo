import { ClasseDetailPage } from '@/containers/ClasseDetailPage';
import { GlobalLayout } from '@/layout/GlobalLayout';

export default function ClassDetailPage({ params }: { params: Promise<{ code: string }> }) {
  return (
    <GlobalLayout>
      <ClasseDetailPage params={params} />
    </GlobalLayout>
  );
}
