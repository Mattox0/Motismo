import { FC } from 'react';

import Input from './Input';

export const ContactForm: FC = () => {
  return (
    <form>
      <Input label="Nom" type="text" />
      <Input label="Email" type="email" />
      <Input label="Message" type="text" />
      <button type="submit">Envoyer</button>
    </form>
  );
};
