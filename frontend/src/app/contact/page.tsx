import { ContactForm } from '@/components/forms/ContactForm';
import { GlobalLayout } from '@/layout/GlobalLayout';

export default function Contact() {
  return (
    <GlobalLayout>
      <div className="contact-page">
        <div className="contact-header">
          <h1 className="contact-title">Besoin d'aide ?</h1>
          <p className="contact-subtitle">
            Notre équipe est là pour vous accompagner. N'hésitez pas à nous contacter !
          </p>
        </div>

        <div className="contact-form-container">
          <ContactForm />
        </div>
      </div>
    </GlobalLayout>
  );
}
