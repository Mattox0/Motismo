import { ContactForm } from '@/components/forms/ContactForm';
import { GlobalLayout } from '@/layout/GlobalLayout';

export default function Contact() {
  return (
    <GlobalLayout>
      <h1>Besoin d'aide ?</h1>
      <p>Contactez-nous</p>
      <ContactForm />
      <p>Notre équipe vous répondra dans les plus brefs délais.</p>
    </GlobalLayout>
  );
}
